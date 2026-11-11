import { ApiError, handle, jsonBody, ok } from "@/lib/server/http";
import { mutateDb, readDb } from "@/lib/server/db";
import { createPasswordResetToken, throttle } from "@/lib/server/auth";
import { validateEmail } from "@/lib/student/validation";

export const POST = handle(async (req: Request) => {
  const body = await jsonBody(req);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  const errEmail = validateEmail(email);
  if (errEmail) {
    throw new ApiError(422, errEmail, { email: errEmail });
  }

  // Rate limit password recovery attempts per email/IP
  throttle(`forgot-academia:${email}`, 5, 10 * 60 * 1000);

  const db = await readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email && u.role === "academia");
  if (!user) {
    throw new ApiError(404, "No registered Academia account found with that email address.", {
      email: "No registered Academia account found with that email address.",
    });
  }

  let resetToken = "";
  await mutateDb((mutDb) => {
    resetToken = createPasswordResetToken(mutDb, user.id);
  });

  return ok({
    sent: true,
    message: "Password recovery verified. Single-use reset link generated.",
    resetUrl: `/academia/reset-password?token=${resetToken}`,
  });
});
