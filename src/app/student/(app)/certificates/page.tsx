import type { Metadata } from "next";
import CertificatesView from "@/components/student/CertificatesView";

export const metadata: Metadata = {
  title: "Certificates — SkillBridge Student Portal",
  description: "Manage your verified professional licenses, diplomas, and certifications.",
};

export default function CertificatesPage() {
  return <CertificatesView />;
}
