export interface BrokerRecord {
  code: string
  name: string
  policy_prefix?: string | null
}

const BROKER_PREFIX_ALIASES: Record<string, string[]> = {
  AXS: ['AXE'],
  TLD: ['TDL'],
}

export function normalizeBrokerCode(value: string | null | undefined) {
  const normalized = (value || '').trim().toUpperCase()
  for (const [canonical, aliases] of Object.entries(BROKER_PREFIX_ALIASES)) {
    if (normalized === canonical || aliases.includes(normalized)) {
      return canonical
    }
  }
  return normalized
}

export function buildBrokerMemberFilter(brokerCode: string) {
  const normalized = normalizeBrokerCode(brokerCode)
  const aliasPrefixes = BROKER_PREFIX_ALIASES[normalized] || []
  const memberNumberClauses = [normalized, ...aliasPrefixes]
    .map((prefix) => `member_number.ilike.${prefix}%`)
    .join(',')

  return `broker_code.eq.${normalized},${memberNumberClauses}`
}

export function deriveBrokerCodeFromMemberNumber(
  memberNumber: string | null | undefined,
  brokers: BrokerRecord[]
) {
  const normalizedMemberNumber = normalizeBrokerCode(memberNumber)
  if (!normalizedMemberNumber) return null

  const knownPrefixes = [...new Set(
    brokers
      .map((broker) => normalizeBrokerCode(broker.policy_prefix || broker.code))
      .filter(Boolean)
  )].sort((a, b) => b.length - a.length)

  const directMatch = knownPrefixes.find((prefix) => normalizedMemberNumber.startsWith(prefix))
  if (directMatch) return directMatch

  for (const [canonical, aliases] of Object.entries(BROKER_PREFIX_ALIASES)) {
    if (aliases.some((alias) => normalizedMemberNumber.startsWith(alias))) {
      return canonical
    }
  }

  return null
}

export function resolveBrokerIdentity(
  memberNumber: string | null | undefined,
  brokerCode: string | null | undefined,
  brokerName: string | null | undefined,
  brokers: BrokerRecord[]
) {
  const explicitCode = normalizeBrokerCode(brokerCode)
  const derivedCode = deriveBrokerCodeFromMemberNumber(memberNumber, brokers)
  const resolvedCode = explicitCode || derivedCode || ''

  const matchedBroker = brokers.find(
    (broker) =>
      normalizeBrokerCode(broker.code) === resolvedCode ||
      normalizeBrokerCode(broker.policy_prefix) === resolvedCode
  )

  return {
    code: resolvedCode || 'N/A',
    name: brokerName || matchedBroker?.name || 'N/A',
  }
}
