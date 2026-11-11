import { ApiError, handle, jsonBody, ok } from "@/lib/server/http";
import { mutateDb, readDb } from "@/lib/server/db";
import { findValidResetTokenUser, hashPassword } from "@/lib/server/auth";
import { validatePassword } from "@/lib/student/validation";

export const POST = handle(async (req: Request) => {
  const body = await jsonBody(req);
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    throw new ApiError(400, "Reset token is missing or invalid.");
  }

  const errors: Record<string, string> = {};
  const ePw = validatePassword(newPassword);
  if (ePw) errors.newPassword = ePw;
  if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, Object.values(errors)[0], errors);
  }

  const db = await readDb();
  const tokenUser = findValidResetTokenUser(db, token);
  if (!tokenUser) {
    throw new ApiError(400, "This password reset link is invalid or has expired. Please request a new one.");
  }

  const nextHash = hashPassword(newPassword);
  await mutateDb((mutDb) => {
    const u = mutDb.users.find((x) => x.id === tokenUser.user.id);
    if (u) {
      u.passwordHash = nextHash;
    }
    // Mark token used
    if (mutDb.passwordResetTokens) {
      const entry = mutDb.passwordResetTokens.find((t) => t.tokenHash === tokenUser.resetRecord.tokenHash);
      if (entry) entry.used = true;
    }
    // Revoke old sessions for security
    mutDb.sessions = mutDb.sessions.filter((s) => s.userId !== tokenUser.user.id);
  });

  return ok({
    success: true,
    message: "Password has been successfully updated. You can now sign in with your new password.",
  });
});
