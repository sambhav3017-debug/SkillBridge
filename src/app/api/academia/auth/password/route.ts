import { ApiError, handle, jsonBody, ok } from "@/lib/server/http";
import { hashPassword, requireAcademiaUser, verifyPassword } from "@/lib/server/auth";
import { mutateDb } from "@/lib/server/db";
import { validatePassword } from "@/lib/student/validation";

export const POST = handle(async (req: Request) => {
  const user = await requireAcademiaUser();
  const body = await jsonBody(req);
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  const errors: Record<string, string> = {};
  if (!currentPassword) errors.currentPassword = "Enter your current password.";
  const ePw = validatePassword(newPassword);
  if (ePw) errors.newPassword = ePw;
  if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";
  if (Object.keys(errors).length) {
    throw new ApiError(422, Object.values(errors)[0], errors);
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw new ApiError(401, "Current password is incorrect.", {
      currentPassword: "Current password is incorrect.",
    });
  }

  const nextHash = hashPassword(newPassword);
  await mutateDb((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (u) u.passwordHash = nextHash;
  });
  return ok({ changed: true });
});
