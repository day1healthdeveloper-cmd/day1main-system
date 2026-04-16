/**
 * Maps Plus1Rewards plan names to Day1Health product names
 * 
 * Plus1Rewards uses simplified plan names like "Comprehensive - Value Plus"
 * Day1Health uses full product names like "Comprehensive Plan – Value Plus"
 * 
 * This mapper ensures consistent plan naming across both databases
 */

export interface PlanMapping {
  plus1Name: string
  productName: string
  category: 'hospital' | 'comprehensive' | 'day-to-day' | 'senior'
}

/**
 * Official plan name mappings between Plus1Rewards and Day1Health
 */
export const PLAN_MAPPINGS: PlanMapping[] = [
  // Hospital Plans
  {
    plus1Name: 'Hospital - Value Plus',
    productName: 'Hospital Plan – Value Plus',
    category: 'hospital'
  },
  {
    plus1Name: 'Hospital - Platinum',
    productName: 'Hospital Plan – Platinum',
    category: 'hospital'
  },
  {
    plus1Name: 'Hospital - Executive',
    productName: 'Hospital Plan – Executive',
    category: 'hospital'
  },
  
  // Comprehensive Plans
  {
    plus1Name: 'Comprehensive - Value Plus',
    productName: 'Comprehensive Plan – Value Plus',
    category: 'comprehensive'
  },
  {
    plus1Name: 'Comprehensive - Platinum',
    productName: 'Comprehensive Plan – Platinum',
    category: 'comprehensive'
  },
  {
    plus1Name: 'Comprehensive - Executive',
    productName: 'Comprehensive Plan – Executive',
    category: 'comprehensive'
  },
  
  // Day-to-Day Plan
  {
    plus1Name: 'Day to Day',
    productName: 'Day-to-Day Plan',
    category: 'day-to-day'
  },
  
  // Senior Plans
  {
    plus1Name: 'Senior Hospital',
    productName: 'Senior Hospital Plan',
    category: 'senior'
  },
  {
    plus1Name: 'Senior Day to Day',
    productName: 'Senior Day-to-Day Plan',
    category: 'senior'
  },
  {
    plus1Name: 'Senior Comprehensive',
    productName: 'Senior Comprehensive Plan',
    category: 'senior'
  }
]

/**
 * Maps a Plus1Rewards plan name to the corresponding Day1Health product name
 * 
 * @param plus1PlanName - The plan name from Plus1Rewards database (e.g., "Comprehensive - Value Plus")
 * @returns The corresponding Day1Health product name (e.g., "Comprehensive Plan – Value Plus")
 * @throws Error if no mapping is found
 */
export function mapPlus1PlanToProduct(plus1PlanName: string): string {
  const mapping = PLAN_MAPPINGS.find(
    m => m.plus1Name.toLowerCase() === plus1PlanName.toLowerCase()
  )
  
  if (!mapping) {
    throw new Error(
      `No plan mapping found for Plus1 plan name: "${plus1PlanName}". ` +
      `Available mappings: ${PLAN_MAPPINGS.map(m => m.plus1Name).join(', ')}`
    )
  }
  
  return mapping.productName
}

/**
 * Maps a Day1Health product name to the corresponding Plus1Rewards plan name
 * 
 * @param productName - The product name from Day1Health database (e.g., "Comprehensive Plan – Value Plus")
 * @returns The corresponding Plus1Rewards plan name (e.g., "Comprehensive - Value Plus")
 * @throws Error if no mapping is found
 */
export function mapProductToPlus1Plan(productName: string): string {
  const mapping = PLAN_MAPPINGS.find(
    m => m.productName.toLowerCase() === productName.toLowerCase()
  )
  
  if (!mapping) {
    throw new Error(
      `No plan mapping found for product name: "${productName}". ` +
      `Available mappings: ${PLAN_MAPPINGS.map(m => m.productName).join(', ')}`
    )
  }
  
  return mapping.plus1Name
}

/**
 * Gets the plan category for a Plus1Rewards plan name
 * 
 * @param plus1PlanName - The plan name from Plus1Rewards database
 * @returns The plan category
 */
export function getPlus1PlanCategory(plus1PlanName: string): 'hospital' | 'comprehensive' | 'day-to-day' | 'senior' | null {
  const mapping = PLAN_MAPPINGS.find(
    m => m.plus1Name.toLowerCase() === plus1PlanName.toLowerCase()
  )
  
  return mapping?.category || null
}

/**
 * Validates if a Plus1Rewards plan name has a corresponding Day1Health product
 * 
 * @param plus1PlanName - The plan name from Plus1Rewards database
 * @returns True if mapping exists, false otherwise
 */
export function isValidPlus1Plan(plus1PlanName: string): boolean {
  return PLAN_MAPPINGS.some(
    m => m.plus1Name.toLowerCase() === plus1PlanName.toLowerCase()
  )
}

/**
 * Gets all available Plus1Rewards plan names
 * 
 * @returns Array of Plus1Rewards plan names
 */
export function getAvailablePlus1Plans(): string[] {
  return PLAN_MAPPINGS.map(m => m.plus1Name)
}

/**
 * Gets all available Day1Health product names
 * 
 * @returns Array of Day1Health product names
 */
export function getAvailableProductNames(): string[] {
  return PLAN_MAPPINGS.map(m => m.productName)
}
