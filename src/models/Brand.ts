import mongoose, { Schema, model, models } from "mongoose";

const ColorSchema = new Schema({
  primary: String,
  secondary: String,
  accent: String,
  neutrals: [String],
}, { _id: false });

const TypographySchema = new Schema({
  heading: { family: String, weight: String, fallback: String },
  body: { family: String, weight: String, fallback: String },
}, { _id: false });

const AudienceSchema = new Schema({
  demographics: String,
  psychographics: String,
  painPoints: [String],
  geography: String,
}, { _id: false });

const StyleSchema = new Schema({
  keywords: [String],
  moodDescriptors: [String],
  visualReferences: [String],
}, { _id: false });

const RulesSchema = new Schema({
  dos: [String],
  donts: [String],
}, { _id: false });

const LogoGeometrySchema = new Schema({
  shape: String,
  style: String,
  complexity: String,
  inspiration: [String],
}, { _id: false });

const DNASchema = new Schema({
  colors: ColorSchema,
  typography: TypographySchema,
  tone: [String],
  voice: String,
  audience: AudienceSchema,
  style: StyleSchema,
  rules: RulesSchema,
  logoGeometry: LogoGeometrySchema,
  tagline: String,
  missionStatement: String,
  uniqueValueProp: String,
}, { _id: false });

const ChatMessageSchema = new Schema({
  role: { type: String, enum: ["user", "assistant"] },
  content: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const AuditViolationSchema = new Schema({
  type: String,
  description: String,
  severity: { type: String, enum: ["low", "medium", "high"] },
}, { _id: false });

const BrandSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
  name: { type: String, required: true },
  industry: String,
  description: String,
  website: String,
  status: { type: String, enum: ["drafting", "active", "archived"], default: "drafting" },
  dna: DNASchema,
  chatHistory: [ChatMessageSchema],
  onboardingStep: { type: Number, default: 0 },
  onboardingComplete: { type: Boolean, default: false },
  auditScore: { type: Number, default: null },
  auditViolations: [AuditViolationSchema],
  auditLastRun: Date,
  generatedNames: [{
    name: String,
    rationale: String,
    domainCom: { available: Boolean, checked: Boolean },
    domainPk: { available: Boolean, checked: Boolean },
    instagramHandle: { available: Boolean, checked: Boolean },
  }],
  moodboardAssets: [{
    url: String,
    extractedColors: [String],
    styleKeywords: [String],
  }],
}, { timestamps: true });

const Brand = models.Brand || model("Brand", BrandSchema);
export default Brand;
