import { GLOBAL_CERTIFICATES } from "./certificate-catalog";
import type {
  GlobalCertificate,
  CertificateRecommendation,
  StudentCertificateProgress,
} from "./certificate-types";
import type { StudentData } from "./types";

export function generateCertificateRecommendations(
  student: StudentData,
  userSavedIds: string[] = [],
  userProgressList: StudentCertificateProgress[] = []
): CertificateRecommendation[] {
  // Collect student profile signals
  const enrolledCourseIds = Object.keys(student.learning || {});
  const completedLessonCount = Object.values(student.learning || {}).reduce(
    (acc, curr) => acc + (curr.completedLessonIds?.length || 0),
    0
  );

  const studentSkills = (student.skills || []).map((s) => s.name.toLowerCase());
  const studentRoles = (student.profile?.preferences?.roles || []).map((r) => r.toLowerCase());
  const studentAreas = (student.profile?.preferences?.areas || []).map((a) => a.toLowerCase());
  const branch = (student.profile?.branch || "").toLowerCase();
  const degree = (student.profile?.degree || "").toLowerCase();

  // Already earned certification titles/issuers
  const earnedCertTitles = (student.certifications || []).map((c) => c.title.toLowerCase());

  // In-progress or completed catalog IDs
  const inProgressOrDoneIds = new Set(
    userProgressList
      .filter((p) => p.status === "Completed" || p.status === "Verified")
      .map((p) => p.catalogId)
  );

  const recommendations: CertificateRecommendation[] = [];

  for (const cert of GLOBAL_CERTIFICATES) {
    // Skip if already earned
    const isAlreadyEarned = earnedCertTitles.some(
      (title) =>
        title.includes(cert.title.toLowerCase()) ||
        cert.title.toLowerCase().includes(title)
    );
    if (isAlreadyEarned || inProgressOrDoneIds.has(cert.id)) {
      continue;
    }

    let score = 50; // base score
    let category: CertificateRecommendation["category"] = "Explore New Domains";
    const matchedCourses: string[] = [];
    const matchedSkills: string[] = [];
    const matchedRoles: string[] = [];
    const reasons: string[] = [];

    // 1. Check active enrolled courses
    // e.g. python, react, etc.
    for (const courseId of enrolledCourseIds) {
      const lowerCourse = courseId.toLowerCase();
      // Match skills covered or domain
      const skillsMatch = cert.skillsCovered.some(
        (s) => s.toLowerCase().includes(lowerCourse) || lowerCourse.includes(s.toLowerCase())
      );
      if (skillsMatch || (lowerCourse === "python" && (cert.domain.includes("Data") || cert.domain.includes("AI")))) {
        score += 30;
        matchedCourses.push(courseId.charAt(0).toUpperCase() + courseId.slice(1));
        reasons.push(`Directly complements your active “${courseId}” coursework in Gain Skills`);
        category = "Best Match for Your Current Courses";
      }
    }

    // 2. Check student verified profile skills
    for (const skill of cert.skillsCovered) {
      if (studentSkills.some((s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))) {
        score += 15;
        matchedSkills.push(skill);
      }
    }
    if (matchedSkills.length > 0 && category !== "Best Match for Your Current Courses") {
      category = "Advance Your Existing Skills";
      reasons.push(`Levels up verified skills in ${matchedSkills.slice(0, 3).join(", ")}`);
    }

    // 3. Check target career roles & areas
    for (const role of cert.careerRelevance) {
      if (
        studentRoles.some(
          (r) => r.includes(role.toLowerCase()) || role.toLowerCase().includes(r)
        )
      ) {
        score += 20;
        matchedRoles.push(role);
      }
    }
    if (matchedRoles.length > 0 && category !== "Best Match for Your Current Courses") {
      category = "Recommended for Your Career Goal";
      reasons.push(`High recruiter ATS weight for target role: ${matchedRoles[0]}`);
    }

    // 4. Area affinity (e.g. AI / ML, Engineering, Cloud)
    for (const area of studentAreas) {
      if (
        cert.domain.toLowerCase().includes(area) ||
        cert.skillsCovered.some((s) => s.toLowerCase().includes(area))
      ) {
        score += 10;
      }
    }

    // 5. Academic branch / degree affinity
    if (branch.includes("computer") || branch.includes("it") || branch.includes("ai")) {
      if (cert.domain === "Software Engineering & CS" || cert.domain === "AI & Machine Learning") {
        score += 8;
      }
    }

    // 6. Popularity boost
    if (cert.isPopular) {
      score += 5;
    }

    // Format detailed reason
    let matchReason = "";
    if (reasons.length > 0) {
      matchReason = reasons.join(". ") + ".";
    } else {
      matchReason = `High-value credential across ${cert.domain} with global recruiter recognition.`;
    }

    // Clamp score
    const finalScore = Math.min(99, Math.max(50, score));

    recommendations.push({
      certificate: cert,
      matchScore: finalScore,
      category,
      matchReason,
      matchedCourses: matchedCourses.length > 0 ? matchedCourses : undefined,
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : undefined,
      matchedRoles: matchedRoles.length > 0 ? matchedRoles : undefined,
    });
  }

  // Sort descending by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
