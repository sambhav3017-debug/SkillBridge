import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { ApiError, respond } from "@/lib/server/http";
import { getSessionUser, requireUser } from "@/lib/server/auth";
import { DATA_DIR, mutateDb } from "@/lib/server/db";
import { toStudentData } from "@/lib/server/student-service";

const MAX = 2 * 1024 * 1024;
const TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  pdf: { ext: "pdf", magic: (b) => b.subarray(0, 4).toString() === "%PDF" },
  docx: { ext: "docx", magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
  doc: { ext: "doc", magic: (b) => b[0] === 0xd0 && b[1] === 0xcf },
};
const dir = path.join(DATA_DIR, "resumes");

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "Please log in." }, { status: 401 });
  const file = path.join(dir, user.id);
  try {
    const buf = await fs.readFile(file);
    const meta = JSON.parse(await fs.readFile(file + ".json", "utf8")) as { name: string };
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${meta.name.replace(/[^\w.\- ]/g, "_")}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "No resume uploaded." }, { status: 404 });
  }
}

export async function POST(req: Request) {
  return respond(async () => {
    const user = await requireUser();
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "Choose a file to upload.");
    if (file.size === 0) throw new ApiError(422, "That file is empty.");
    if (file.size > MAX) throw new ApiError(422, "Resume must be 2 MB or smaller.");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const kind = TYPES[ext];
    const buf = Buffer.from(await file.arrayBuffer());
    if (!kind || !kind.magic(buf)) throw new ApiError(422, "Upload a PDF, DOC or DOCX file.");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, user.id), buf);
    const name = file.name.slice(-120);
    await fs.writeFile(path.join(dir, user.id + ".json"), JSON.stringify({ name }));
    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student profile not found.");
      rec.resume = { name, size: file.size, uploadedAt: new Date().toISOString() };
      return toStudentData(user, rec, db);
    });
  });
}

export async function DELETE() {
  return respond(async () => {
    const user = await requireUser();
    await fs.rm(path.join(dir, user.id), { force: true });
    await fs.rm(path.join(dir, user.id + ".json"), { force: true });
    return mutateDb((db) => {
      const rec = db.students[user.id];
      if (!rec) throw new ApiError(404, "Student profile not found.");
      rec.resume = null;
      return toStudentData(user, rec, db);
    });
  });
}
