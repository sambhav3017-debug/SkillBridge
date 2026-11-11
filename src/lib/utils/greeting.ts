/**
 * Shared Time-zone-aware greeting utility for SkillBridge Portals (Student, Academia, Industry).
 *
 * Authoritative Time Zone: Asia/Kolkata (Indian Standard Time, IST, UTC+5:30)
 *
 * Periods (IST):
 * - Good Morning: 5:00 AM to 11:59 AM IST (05:00 - 11:59)
 * - Good Afternoon: 12:00 PM to 4:59 PM IST (12:00 - 16:59)
 * - Good Evening: 5:00 PM to 8:59 PM IST (17:00 - 20:59)
 * - Good Night: 9:00 PM to 4:59 AM IST (21:00 - 04:59)
 */

export function getISTHour(date: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hourCycle: "h23",
  });
  return parseInt(formatter.format(date), 10);
}

export function getISTGreeting(date: Date = new Date()): string {
  const hour = getISTHour(date);
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }
  return "Good Night";
}

/**
 * Calculates milliseconds until the next greeting transition boundary in IST:
 * - 05:00:00 IST (Good Morning)
 * - 12:00:00 IST (Good Afternoon)
 * - 17:00:00 IST (Good Evening)
 * - 21:00:00 IST (Good Night)
 */
export function getMsUntilNextISTBoundary(date: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  let h = 0, m = 0, s = 0;
  for (const part of parts) {
    if (part.type === "hour") h = parseInt(part.value, 10);
    if (part.type === "minute") m = parseInt(part.value, 10);
    if (part.type === "second") s = parseInt(part.value, 10);
  }

  const currentSecondsInDay = h * 3600 + m * 60 + s;
  const boundariesInHours = [5, 12, 17, 21];
  const boundariesInSeconds = boundariesInHours.map((hour) => hour * 3600);

  let nextBoundarySeconds = boundariesInSeconds.find((b) => b > currentSecondsInDay);
  if (nextBoundarySeconds === undefined) {
    nextBoundarySeconds = 86400 + 5 * 3600; // 5:00 AM next day
  }

  const diffSeconds = nextBoundarySeconds - currentSecondsInDay;
  return Math.max(500, diffSeconds * 1000 + 200);
}

/**
 * Formats an academic staff member's display name, preserving existing academic
 * titles (e.g. Dr., Prof., Dean) and avoiding duplicate designations.
 */
export function formatAcademicName(name?: string, designation?: string): string {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";

  // Check if name already begins with an academic prefix (case-insensitive)
  const titleRegex = /^(dr\.?|prof\.?|professor|dean|assoc\.?\s+prof\.?)\s+/i;
  const match = trimmed.match(titleRegex);

  if (match) {
    const rawPrefix = match[1].toLowerCase().replace(/\./g, "");
    const restOfName = trimmed.slice(match[0].length).trim();
    if (rawPrefix === "dr") {
      return `Dr. ${restOfName}`;
    }
    if (rawPrefix === "prof" || rawPrefix === "professor") {
      return `Prof. ${restOfName}`;
    }
    if (rawPrefix === "dean") {
      return `Dean ${restOfName}`;
    }
    return trimmed;
  }

  // If the name does NOT already include a title, check designation
  if (designation && typeof designation === "string") {
    const d = designation.trim().toLowerCase();
    if (/\b(doctor|dr\.?|ph\.?d)\b/i.test(d)) {
      return `Dr. ${trimmed}`;
    }
    if (/\b(professor|prof\.?)\b/i.test(d) && !d.includes("assistant")) {
      return `Prof. ${trimmed}`;
    }
  }

  return trimmed;
}
