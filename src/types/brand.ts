export interface BrandColor {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutrals?: string[];
}

export interface Typography {
  heading?: { family?: string; weight?: string; fallback?: string };
  body?: { family?: string; weight?: string; fallback?: string };
}

export interface BrandAudience {
  demographics?: string;
  psychographics?: string;
  painPoints?: string[];
  geography?: string;
}

export interface BrandStyle {
  keywords?: string[];
  moodDescriptors?: string[];
  visualReferences?: string[];
}

export interface BrandRules {
  dos?: string[];
  donts?: string[];
}

export interface LogoGeometry {
  shape?: string;
  style?: string;
  complexity?: string;
  inspiration?: string[];
}

export interface BrandDNA {
  colors?: BrandColor;
  typography?: Typography;
  tone?: string[];
  voice?: string;
  audience?: BrandAudience;
  style?: BrandStyle;
  rules?: BrandRules;
  logoGeometry?: LogoGeometry;
  tagline?: string;
  missionStatement?: string;
  uniqueValueProp?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date | string;
}

export interface BrandGeneratedName {
  name: string;
  rationale: string;
  domainCom?: { available?: boolean; checked?: boolean };
  domainPk?: { available?: boolean; checked?: boolean };
  instagramHandle?: { available?: boolean; checked?: boolean };
}

export interface Brand {
  _id: string;
  userId: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  status: "drafting" | "active" | "archived";
  dna?: BrandDNA;
  chatHistory?: ChatMessage[];
  onboardingStep?: number;
  onboardingComplete?: boolean;
  auditScore?: number | null;
  auditViolations?: Array<{
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  generatedNames?: BrandGeneratedName[];
  createdAt: string;
  updatedAt: string;
}
