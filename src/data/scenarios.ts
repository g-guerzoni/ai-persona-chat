/**
 * Hardcoded scenario configurations
 * These define the tabs/scenarios available in the application
 */

export interface Scenario {
  slug: string
  title: string
  icon: string
  orderIndex: number
}

export const SCENARIOS: Scenario[] = [
  { slug: "service", title: "Billing Service", icon: "CreditCard", orderIndex: 0 },
  { slug: "case", title: "Technical Support", icon: "Wrench", orderIndex: 1 },
  { slug: "subject", title: "Account Access", icon: "Lock", orderIndex: 2 },
  { slug: "notes", title: "Product Complaint", icon: "AlertCircle", orderIndex: 3 },
]
