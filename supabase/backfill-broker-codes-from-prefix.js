const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: 'apps/frontend/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const normalize = (value) => (value || '').trim().toUpperCase()
const BROKER_PREFIX_ALIASES = {
  AXS: ['AXE'],
  TLD: ['TDL'],
}

function deriveBrokerCode(memberNumber, brokerCodes) {
  const normalizedMemberNumber = normalize(memberNumber)
  if (!normalizedMemberNumber) return null

  for (const code of brokerCodes) {
    if (normalizedMemberNumber.startsWith(code)) {
      return code
    }
  }

  for (const [canonical, aliases] of Object.entries(BROKER_PREFIX_ALIASES)) {
    if (aliases.some((alias) => normalizedMemberNumber.startsWith(alias))) {
      return canonical
    }
  }

  return null
}

async function fetchAllMembers() {
  const members = []
  let page = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('members')
      .select('id, member_number, first_name, last_name, broker_code')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      break
    }

    members.push(...data)
    page += 1
  }

  return members
}

async function main() {
  console.log('Starting broker_code backfill from member_number prefixes...')

  const { data: brokers, error: brokerError } = await supabase
    .from('brokers')
    .select('code, name, policy_prefix')
    .order('name')

  if (brokerError) {
    throw brokerError
  }

  const brokerCodes = [...new Set((brokers || [])
    .map((broker) => normalize(broker.policy_prefix || broker.code))
    .filter(Boolean))]
    .sort((a, b) => b.length - a.length)

  const members = await fetchAllMembers()
  console.log(`Loaded ${members.length} members and ${brokerCodes.length} broker codes`)

  const updates = members
    .map((member) => {
      const derivedCode = deriveBrokerCode(member.member_number, brokerCodes)
      const currentCode = normalize(member.broker_code)

      if (!derivedCode || currentCode === derivedCode) {
        return null
      }

      return {
        id: member.id,
        member_number: member.member_number,
        first_name: member.first_name,
        last_name: member.last_name,
        old_code: currentCode || 'NULL',
        new_code: derivedCode,
      }
    })
    .filter(Boolean)

  console.log(`Found ${updates.length} members needing broker_code updates`)

  if (updates.length === 0) {
    console.log('No updates required.')
    return
  }

  const summary = updates.reduce((acc, item) => {
    acc[item.new_code] = (acc[item.new_code] || 0) + 1
    return acc
  }, {})

  console.log('Updates by broker:')
  Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`)
    })

  let successCount = 0
  let errorCount = 0

  for (const update of updates) {
    const { error } = await supabase
      .from('members')
      .update({ broker_code: update.new_code })
      .eq('id', update.id)

    if (error) {
      errorCount += 1
      console.error(`Failed for ${update.member_number}: ${error.message}`)
      continue
    }

    successCount += 1
  }

  console.log(`Completed. Updated: ${successCount}, errors: ${errorCount}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
