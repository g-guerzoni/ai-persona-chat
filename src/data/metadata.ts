/**
 * Hardcoded scenario metadata
 * Contains persona information and initial messages for each scenario
 */

export interface OceanTraits {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export type OceanTraitKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism"

export interface ScenarioMetadataData {
  personaName: string
  personaRole: string
  callId: string
  service: string
  subject: string
  notes: string
  oceanTraits: OceanTraits
  primaryTrait: OceanTraitKey
  secondaryTrait: OceanTraitKey
}

export interface InitialMessages {
  systemMessage: string
  initialMessage: {
    role: "ai"
    content: string
  }
}

export interface InitialOption {
  id: string
  text: string
  nodeKey: string
}

export interface ScenarioData {
  metadata: ScenarioMetadataData
  initialMessages: InitialMessages
  initialOptions: InitialOption[]
}

// Service scenario - Billing Service
export const serviceMetadata: ScenarioData = {
  metadata: {
    personaName: "Claudia",
    personaRole: "Frustrated Customer",
    callId: "123456",
    service: "Billing",
    subject: "Refund Request",
    notes: "Customer is upset about unexpected charge. Has been a loyal customer for 2 years.",
    oceanTraits: {
      openness: 45,
      conscientiousness: 60,
      extraversion: 55,
      agreeableness: 30,
      neuroticism: 70,
    },
    primaryTrait: "agreeableness",
    secondaryTrait: "neuroticism",
  },
  initialMessages: {
    systemMessage:
      "You are speaking with Claudia, a frustrated customer requesting a refund for billing #123456. She noticed an unexpected charge on her account and is upset. Your goal is to handle the situation with empathy, clarity, and professionalism.",
    initialMessage: {
      role: "ai",
      content:
        "Hi, I'm Claudia and I need to talk to someone about billing #123456. I just got charged $149.99 and I never authorized this! I've been a customer for 2 years and this is really disappointing.",
    },
  },
  initialOptions: [
    {
      id: "opt_0_a",
      text: "I see the issue. Let me check this charge now.",
      nodeKey: "start",
    },
    {
      id: "opt_0_b",
      text: "Tell me what you expected to be charged.",
      nodeKey: "start",
    },
  ],
}

// Case scenario - Technical Support
export const caseMetadata: ScenarioData = {
  metadata: {
    personaName: "Marcus",
    personaRole: "Technical User",
    callId: "847293",
    service: "Technical Support",
    subject: "System Outage",
    notes:
      "Client reports critical system outage affecting their operations. High technical knowledge, expects detailed technical responses.",
    oceanTraits: {
      openness: 75,
      conscientiousness: 85,
      extraversion: 50,
      agreeableness: 45,
      neuroticism: 40,
    },
    primaryTrait: "conscientiousness",
    secondaryTrait: "openness",
  },
  initialMessages: {
    systemMessage:
      "You are speaking with Marcus, a technical user experiencing a critical system outage. He has high technical knowledge and expects detailed, accurate information. Your goal is to communicate clearly, provide technical solutions, and manage the situation professionally.",
    initialMessage: {
      role: "ai",
      content:
        "Hi, this is Marcus from DevOps at TechCorp. We're experiencing a complete system outage - case #847293. Our entire production environment has been down for 15 minutes. I need immediate assistance.",
    },
  },
  initialOptions: [
    {
      id: "opt_0_a",
      text: "I've escalated this to our senior engineering team. Can you describe the exact symptoms?",
      nodeKey: "start",
    },
    {
      id: "opt_0_b",
      text: "Let me check the system status. Are you seeing any error messages?",
      nodeKey: "start",
    },
  ],
}

// Subject scenario - Account Access
export const subjectMetadata: ScenarioData = {
  metadata: {
    personaName: "Sarah",
    personaRole: "Anxious User",
    callId: "652418",
    service: "Account Support",
    subject: "Account Access Issue",
    notes:
      "User is locked out of account and needs urgent access. Shows signs of anxiety and needs reassurance along with solutions.",
    oceanTraits: {
      openness: 50,
      conscientiousness: 70,
      extraversion: 35,
      agreeableness: 75,
      neuroticism: 80,
    },
    primaryTrait: "extraversion",
    secondaryTrait: "neuroticism",
  },
  initialMessages: {
    systemMessage:
      "You are speaking with Sarah, an anxious user who has been locked out of her account. She needs urgent access for an important meeting and is feeling stressed. Your goal is to be friendly, reassuring, and provide clear step-by-step guidance to resolve the issue.",
    initialMessage: {
      role: "ai",
      content:
        "Hi, I really need help - case #652418. I'm completely locked out of my account and I have an important client meeting in 30 minutes! I've tried resetting my password twice but it's not working. I'm really worried I won't be able to access my files.",
    },
  },
  initialOptions: [
    {
      id: "opt_0_a",
      text: "Don't worry, we'll get you back in. Let me guide you through the account recovery process.",
      nodeKey: "start",
    },
    {
      id: "opt_0_b",
      text: "I can see your account. Can you verify your email address for me?",
      nodeKey: "start",
    },
  ],
}

// Notes scenario - Product Complaint
export const notesMetadata: ScenarioData = {
  metadata: {
    personaName: "David",
    personaRole: "Disappointed Client",
    callId: "901234",
    service: "Product Support",
    subject: "Product Defect - Repeat Issue",
    notes:
      "Third complaint about the same recurring product defect. Client is losing patience and considering alternatives. Needs all three traits: clarity on resolution, friendly demeanor, and empathy for frustration.",
    oceanTraits: {
      openness: 60,
      conscientiousness: 80,
      extraversion: 50,
      agreeableness: 40,
      neuroticism: 55,
    },
    primaryTrait: "agreeableness",
    secondaryTrait: "conscientiousness",
  },
  initialMessages: {
    systemMessage:
      "You are speaking with David, a disappointed client reporting a product defect for the third time. He's frustrated with the recurring issue and is considering switching to a competitor. Your goal is to demonstrate clarity in your solution, maintain a friendly tone despite his frustration, and show genuine empathy for his situation.",
    initialMessage: {
      role: "ai",
      content:
        "Hi, this is David again - case #901234. This is the THIRD time I'm contacting you about the same issue with your product. The screen keeps freezing after 2 hours of use. I've tried everything you suggested before and it still happens. I'm seriously considering switching to a competitor at this point.",
    },
  },
  initialOptions: [
    {
      id: "opt_0_a",
      text: "I sincerely apologize for this recurring issue. Let me escalate this to our product team right now.",
      nodeKey: "start",
    },
    {
      id: "opt_0_b",
      text: "I can see your previous cases. This is unacceptable. Let me find a permanent solution.",
      nodeKey: "start",
    },
  ],
}

export const METADATA_MAP: Record<string, ScenarioData> = {
  service: serviceMetadata,
  case: caseMetadata,
  subject: subjectMetadata,
  notes: notesMetadata,
}
