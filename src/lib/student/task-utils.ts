import type { StudentTask, TaskPriority, TaskStatus } from "./types";

export const pad2 = (n: number) => n.toString().padStart(2, "0");

/** Returns local date string in YYYY-MM-DD */
export function getLocalDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Formats "HH:mm" 24h into "hh:mm AM/PM" */
export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${pad2(m)} ${ampm}`;
}

export function formatTaskTimeRange(startTime?: string, dueTime?: string): string {
  if (startTime && dueTime) {
    return `${formatTime12h(startTime)} – ${formatTime12h(dueTime)}`;
  }
  if (dueTime) {
    return `Due by ${formatTime12h(dueTime)}`;
  }
  if (startTime) {
    return `Starts at ${formatTime12h(startTime)}`;
  }
  return "All day";
}

/** Computes accurate task status according to prompt specs */
export function getTaskStatus(task: StudentTask, now: Date = new Date()): TaskStatus {
  if (task.completed) return "Completed";

  const todayStr = getLocalDateString(now);

  if (task.date < todayStr) {
    return "Overdue";
  }

  if (task.date === todayStr) {
    if (task.dueTime) {
      const currentHHmm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
      if (task.dueTime < currentHHmm) {
        return "Overdue";
      }
    }
    return "Due Today";
  }

  return "Upcoming";
}

export function formatFriendlyDate(dateStr: string, now: Date = new Date()): string {
  const todayStr = getLocalDateString(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (dateStr === todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";
  if (dateStr === yesterdayStr) return "Yesterday";

  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return dateStr;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const PRIORITY_STYLES: Record<
  TaskPriority,
  { bg: string; text: string; border: string; badge: string; dot: string }
> = {
  Urgent: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30 dark:border-rose-500/30",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    dot: "bg-rose-500",
  },
  High: {
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30 dark:border-orange-500/30",
    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
    dot: "bg-[#FF6A00]",
  },
  Medium: {
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/30 dark:border-sky-500/30",
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
    dot: "bg-sky-500",
  },
  Low: {
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/30 dark:border-slate-500/30",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
    dot: "bg-slate-400",
  },
};

export const STATUS_STYLES: Record<
  TaskStatus,
  { badge: string; label: string }
> = {
  Completed: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    label: "Completed",
  },
  Overdue: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold animate-pulse",
    label: "Overdue",
  },
  "Due Today": {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold",
    label: "Due Today",
  },
  Upcoming: {
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
    label: "Upcoming",
  },
};

export const REMINDER_LABELS: Record<string, string> = {
  none: "No reminder",
  at_time: "At time of task",
  "15_min": "15 minutes before",
  "30_min": "30 minutes before",
  "1_hour": "1 hour before",
  "1_day": "1 day before",
};

export function sortTasksChronologically(tasks: StudentTask[]): StudentTask[] {
  return [...tasks].sort((a, b) => {
    // Incomplete first, then completed
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Date asc
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    // Time asc
    const aTime = a.startTime || a.dueTime || "99:99";
    const bTime = b.startTime || b.dueTime || "99:99";
    if (aTime !== bTime) return aTime.localeCompare(bTime);
    // Priority desc
    const pRank: Record<TaskPriority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    return pRank[b.priority] - pRank[a.priority];
  });
}
