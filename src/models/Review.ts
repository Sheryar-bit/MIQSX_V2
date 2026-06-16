import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  author: string;
  role: string;
  content: string;
  createdAt: Date;
}

export interface IReview extends Document {
  brandId?: Schema.Types.ObjectId;
  userId: string;
  title: string;
  description?: string;
  assetType: "logo" | "caption" | "image" | "tagline" | "design";
  assetContent: string; // SVG, text, or image URL
  status: "draft" | "in_review" | "approved" | "needs_changes";
  publicToken?: string;
  tokenExpiry?: Date;
  clientName?: string;
  clientEmail?: string;
  clientComment?: string;
  clientDecidedAt?: Date;
  comments: IComment[];
  guardianScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  author: { type: String, required: true },
  role: { type: String, default: "Editor" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ReviewSchema = new Schema<IReview>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    assetType: {
      type: String,
      enum: ["logo", "caption", "image", "tagline", "design"],
      default: "design",
    },
    assetContent: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "in_review", "approved", "needs_changes"],
      default: "draft",
    },
    publicToken: { type: String, index: true, sparse: true },
    tokenExpiry: Date,
    clientName: String,
    clientEmail: String,
    clientComment: String,
    clientDecidedAt: Date,
    comments: [CommentSchema],
    guardianScore: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
