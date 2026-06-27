import dbConnect from "./mongoose";
import AuditLog, { AuditAction } from "../models/AuditLog";

// Fire-and-forget audit logging — never throws to the caller.
export async function logAudit(opts: {
  orgId: string;
  actorId: string;
  actorName?: string | null;
  action: AuditAction;
  detail?: string;
}): Promise<void> {
  try {
    await dbConnect();
    await AuditLog.create({
      orgId: opts.orgId,
      actorId: opts.actorId,
      actorName: opts.actorName || "A member",
      action: opts.action,
      detail: opts.detail,
    });
  } catch (err) {
    console.error("[audit-log] failed:", err);
  }
}
