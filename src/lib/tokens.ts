import { randomBytes, createHash } from "crypto";
import dbConnect from "./mongoose";
import AuthToken, { AuthTokenType } from "../models/AuthToken";

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a single-use token of `type` for `identifier` (email). Invalidates any
 * existing tokens of the same type first. Returns the RAW token (goes in the link).
 */
export async function createAuthToken(
  identifier: string,
  type: AuthTokenType,
  ttlMs: number
): Promise<string> {
  await dbConnect();
  const id = identifier.toLowerCase().trim();

  await AuthToken.deleteMany({ identifier: id, type });

  const raw = randomBytes(32).toString("hex");
  await AuthToken.create({
    identifier: id,
    tokenHash: hash(raw),
    type,
    expiresAt: new Date(Date.now() + ttlMs),
  });

  return raw;
}

/**
 * Validate + consume a token. Returns the identifier (email) if valid, else null.
 * Single-use: the token is deleted on success.
 */
export async function consumeAuthToken(
  raw: string,
  type: AuthTokenType
): Promise<string | null> {
  await dbConnect();

  const doc = await AuthToken.findOne({ tokenHash: hash(raw), type });
  if (!doc) return null;
  if (doc.expiresAt.getTime() < Date.now()) {
    await doc.deleteOne();
    return null;
  }

  const identifier = doc.identifier;
  await doc.deleteOne();
  return identifier;
}
