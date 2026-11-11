"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type {
  ReminderSetting,
  StudentData,
  StudentTask,
  TaskPriority,
  TaskType,
} from "@/lib/student/types";
import {
  REMINDER_SETTINGS,
  TASK_PRIORITIES,
  TASK_TYPES,
} from "@/lib/student/types";
import {
  formatFriendlyDate,
  formatTaskTimeRange,
  formatTime12h,
  getLocalDateString,
  getTaskStatus,
  PRIORITY_STYLES,
  REMINDER_LABELS,
  STATUS_STYLES,
  sortTasksChronologically,
} from "@/lib/student/task-utils";
import { useStudent } from "./StudentProvider";

interface StudentCalendarPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  data: StudentData;
}

export default function StudentCalendarPlannerModal({
  isOpen,
  onClose,
  initialDate,
  data,
}: StudentCalendarPlannerModalProps) {
  const { createTask, updateTask, deleteTask, toggleTaskComplete, notify } =
    useStudent();

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || todayStr
  );

  // Month navigation state: [year, month (0-11)]
  const [viewYearMonth, setViewYearMonth] = useState<{
    year: number;
    month: number;
  }>(() => {
    const init = initialDate ? new Date(initialDate) : new Date();
    return {
      year: init.getFullYear(),
      month: init.getMonth(),
    };
  });

  // Modal sub-states
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adjust state when initialDate changes
  const [prevInitialDate, setPrevInitialDate] = useState(initialDate);
  if (initialDate !== prevInitialDate) {
    setPrevInitialDate(initialDate);
    const d = initialDate || todayStr;
    setSelectedDate(d);
    const dt = new Date(d);
    if (!Number.isNaN(dt.getTime())) {
      setViewYearMonth({ year: dt.getFullYear(), month: dt.getMonth() });
    }
    setFormOpen(false);
    setEditingTask(null);
    setDeletingTaskId(null);
  }

  // Form input state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(selectedDate);
  const [formType, setFormType] = useState<TaskType>("Personal Task");
  const [formPriority, setFormPriority] = useState<TaskPriority>("Medium");
  const [formDescription, setFormDescription] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formDueTime, setFormDueTime] = useState("");
  const [formReminder, setFormReminder] = useState<ReminderSetting>("15_min");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deletingTaskId) {
          setDeletingTaskId(null);
        } else if (formOpen) {
          setFormOpen(false);
          setEditingTask(null);
        } else {
          onClose();
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, formOpen, deletingTaskId, onClose]);

  // Tasks mapped by date YYYY-MM-DD
  const tasksByDate = useMemo(() => {
    const map = new Map<string, StudentTask[]>();
    const tasks = data.tasks ?? [];
    for (const t of tasks) {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    }
    return map;
  }, [data.tasks]);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    const tasks = tasksByDate.get(selectedDate) || [];
    return sortTasksChronologically(tasks);
  }, [tasksByDate, selectedDate]);

  // Upcoming tasks across all dates (for bottom agenda preview)
  const upcomingTasks = useMemo(() => {
    const all = data.tasks ?? [];
    const pending = all.filter((t) => !t.completed && t.date >= todayStr);
    return sortTasksChronologically(pending).slice(0, 4);
  }, [data.tasks, todayStr]);

  // Calendar days grid computation
  const calendarDays = useMemo(() => {
    const { year, month } = viewYearMonth;
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDays = lastDayOfMonth.getDate();

    const days: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasTasks: boolean;
      taskCount: number;
      hasUrgent: boolean;
    }[] = [];

    // Preceding month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = getLocalDateString(prevDate);
      const dayTasks = tasksByDate.get(dateStr) || [];
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasTasks: dayTasks.length > 0,
        taskCount: dayTasks.length,
        hasUrgent: dayTasks.some((t) => t.priority === "Urgent" && !t.completed),
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dateStr = getLocalDateString(d);
      const dayTasks = tasksByDate.get(dateStr) || [];
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasTasks: dayTasks.length > 0,
        taskCount: dayTasks.length,
        hasUrgent: dayTasks.some((t) => t.priority === "Urgent" && !t.completed),
      });
    }

    // Succeeding month padding to make full 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = getLocalDateString(nextDate);
      const dayTasks = tasksByDate.get(dateStr) || [];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasTasks: dayTasks.length > 0,
        taskCount: dayTasks.length,
        hasUrgent: dayTasks.some((t) => t.priority === "Urgent" && !t.completed),
      });
    }

    return days;
  }, [viewYearMonth, selectedDate, todayStr, tasksByDate]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setViewYearMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewYearMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewYearMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(todayStr);
  };

  // Open Add Task form
  const handleOpenAddForm = (forDate?: string) => {
    const targetDate = forDate || selectedDate || todayStr;
    setEditingTask(null);
    setFormTitle("");
    setFormDate(targetDate);
    setFormType("Personal Task");
    setFormPriority("Medium");
    setFormDescription("");
    setFormStartTime("");
    setFormDueTime("");
    setFormReminder("15_min");
    setFormErrors({});
    setFormOpen(true);
  };

  // Open Edit Task form
  const handleOpenEditForm = (task: StudentTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDate(task.date);
    setFormType(task.type);
    setFormPriority(task.priority);
    setFormDescription(task.description || "");
    setFormStartTime(task.startTime || "");
    setFormDueTime(task.dueTime || "");
    setFormReminder(task.reminder || "none");
    setFormErrors({});
    setFormOpen(true);
  };

  // Form submit handler
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errs: Record<string, string> = {};
    if (!formTitle.trim()) {
      errs.title = "Please enter a task title.";
    }
    if (!formDate) {
      errs.date = "Please select a date.";
    }
    if (formStartTime && formDueTime && formDueTime < formStartTime) {
      errs.dueTime = "Due time cannot be earlier than start time.";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTask) {
        const res = await updateTask(editingTask.id, {
          title: formTitle.trim(),
          date: formDate,
          type: formType,
          priority: formPriority,
          description: formDescription.trim() || undefined,
          startTime: formStartTime || undefined,
          dueTime: formDueTime || undefined,
          reminder: formReminder,
        });
        if (res.ok) {
          notify("success", `Updated task “${formTitle.trim()}”`);
          setSelectedDate(formDate);
          setFormOpen(false);
          setEditingTask(null);
        } else {
          setFormErrors({ form: res.error || "Failed to update task." });
        }
      } else {
        const res = await createTask({
          title: formTitle.trim(),
          date: formDate,
          type: formType,
          priority: formPriority,
          description: formDescription.trim() || undefined,
          startTime: formStartTime || undefined,
          dueTime: formDueTime || undefined,
          reminder: formReminder,
        });
        if (res.ok) {
          notify("success", `Added task “${formTitle.trim()}”`);
          setSelectedDate(formDate);
          setFormOpen(false);
        } else {
          setFormErrors({ form: res.error || "Failed to create task." });
        }
      }
    } catch {
      setFormErrors({ form: "Network error occurred while saving." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Task deletion handler
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    setIsSubmitting(true);
    try {
      const res = await deleteTask(deletingTaskId);
      if (res.ok) {
        notify("success", "Task deleted successfully.");
        setDeletingTaskId(null);
      } else {
        notify("error", res.error || "Failed to delete task.");
      }
    } catch {
      notify("error", "An unexpected error occurred while deleting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle complete handler
  const handleToggleComplete = async (task: StudentTask) => {
    const nextState = !task.completed;
    const res = await toggleTaskComplete(task.id, nextState);
    if (res.ok) {
      notify(
        "success",
        nextState
          ? `Marked “${task.title}” as completed!`
          : `Reopened “${task.title}”`
      );
    } else {
      notify("error", res.error || "Could not update task status.");
    }
  };

  const monthName = new Date(
    viewYearMonth.year,
    viewYearMonth.month,
    1
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map((v) => parseInt(v, 10));
    if (!y || !m || !d) return selectedDate;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-md animate-dash-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-planner-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0D1117] text-[#171717] dark:text-white border border-[#E3E3E3] dark:border-white/15 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* Modal Top Header Bar                                           */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E3E3E3] dark:border-white/10 bg-white/70 dark:bg-[#111622]/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500/10 text-[#FF6A00] dark:bg-orange-500/20 dark:text-orange-400">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2
                id="calendar-planner-title"
                className="text-lg font-black tracking-tight text-[#171717] dark:text-white flex items-center gap-2"
              >
                Personal Planner & Calendar
              </h2>
              <p className="text-xs text-[#686868] dark:text-neutral-400 font-medium">
                Organize assignments, exams, placement prep, and deadlines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!formOpen && (
              <button
                type="button"
                onClick={() => handleOpenAddForm(selectedDate)}
                className="btn-bounce-sm hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white text-xs font-bold shadow-md shadow-orange-500/25 hover:brightness-105 transition-all"
                aria-label="Add task or reminder"
              >
                <Plus size={15} /> Add Task
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close calendar planner"
              className="btn-bounce-sm grid h-9 w-9 place-items-center rounded-xl bg-[#F7F7F7] dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/15 text-[#686868] hover:text-[#171717] dark:text-neutral-300 dark:hover:text-white border border-[#E3E3E3] dark:border-transparent transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Main Content Area: Split 2-Column or Form View                  */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto">
          {formOpen ? (
            /* ============================================================ */
            /* Add / Edit Task Form View                                    */
            /* ============================================================ */
            <div className="p-5 sm:p-7 max-w-2xl mx-auto animate-in fade-in-0 duration-200">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E3E3E3] dark:border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-[#171717] dark:text-white">
                    {editingTask ? "Edit Scheduled Task" : "Add New Task or Reminder"}
                  </h3>
                  <p className="text-xs text-[#686868] dark:text-neutral-400 mt-0.5 font-medium">
                    {editingTask
                      ? "Update your schedule details, reminder, and priority."
                      : "Schedule personal study goals, project submissions, or exam deadlines."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingTask(null);
                  }}
                  className="btn-bounce-sm text-xs font-semibold text-[#686868] hover:text-[#171717] dark:text-neutral-400 dark:hover:text-white px-3 py-1.5 rounded-lg border border-[#E3E3E3] dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>

              {formErrors.form && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formErrors.form}</span>
                </div>
              )}

              <form onSubmit={handleSaveTask} className="space-y-4">
                {/* Task Title */}
                <div>
                  <label
                    htmlFor="task-title-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                  >
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="task-title-input"
                    type="text"
                    required
                    maxLength={120}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Operating Systems Final Exam Prep"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white placeholder:text-[#999] focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Date & Task Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Task Date */}
                  <div>
                    <label
                      htmlFor="task-date-input"
                      className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                    >
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="task-date-input"
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                    />
                    {formErrors.date && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {formErrors.date}
                      </p>
                    )}
                  </div>

                  {/* Task Type */}
                  <div>
                    <label
                      htmlFor="task-type-select"
                      className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                    >
                      Task Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="task-type-select"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as TaskType)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-[#1A1F2B] border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority Selection Pills */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5">
                    Priority Level <span className="text-rose-500">*</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TASK_PRIORITIES.map((p) => {
                      const isSelected = formPriority === p;
                      const style = PRIORITY_STYLES[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormPriority(p)}
                          className={`btn-bounce-sm flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? `${style.bg} ${style.text} ${style.border} ring-2 ring-[#FF6A00]/40 shadow-sm`
                              : "bg-[#F7F7F7] dark:bg-white/5 border-[#E3E3E3] dark:border-white/10 text-[#686868] dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-white/10"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Start Time & Due Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="task-start-time"
                      className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                    >
                      Start Time (Optional)
                    </label>
                    <div className="relative">
                      <input
                        id="task-start-time"
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="task-due-time"
                      className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                    >
                      Due Time / Deadline (Optional)
                    </label>
                    <div className="relative">
                      <input
                        id="task-due-time"
                        type="time"
                        value={formDueTime}
                        onChange={(e) => setFormDueTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                      />
                    </div>
                    {formErrors.dueTime && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        {formErrors.dueTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reminder Notification Setting */}
                <div>
                  <label
                    htmlFor="task-reminder-select"
                    className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                  >
                    In-App Reminder
                  </label>
                  <select
                    id="task-reminder-select"
                    value={formReminder}
                    onChange={(e) =>
                      setFormReminder(e.target.value as ReminderSetting)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-[#1A1F2B] border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                  >
                    {REMINDER_SETTINGS.map((r) => (
                      <option key={r} value={r}>
                        {REMINDER_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-[#686868] dark:text-neutral-400 flex items-center gap-1.5">
                    <Bell size={12} className="text-[#FF6A00] dark:text-orange-400 flex-none" />
                    <span>
                      In-app reminders display on your SkillBridge Dashboard and notifications bell.
                    </span>
                  </p>
                </div>

                {/* Description / Notes */}
                <div>
                  <label
                    htmlFor="task-description-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1.5"
                  >
                    Notes or Checklist (Optional)
                  </label>
                  <textarea
                    id="task-description-input"
                    rows={3}
                    maxLength={1000}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Add topic outlines, assignment links, or submission requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white placeholder:text-[#999] focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setFormOpen(false);
                      setEditingTask(null);
                    }}
                    className="btn-bounce-sm px-4 py-2 rounded-xl border border-[#E3E3E3] dark:border-white/10 text-xs font-bold text-[#686868] hover:text-[#171717] dark:text-neutral-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-bounce-sm px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white text-xs font-bold shadow-md shadow-orange-500/25 hover:brightness-105 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingTask
                      ? "Update Task"
                      : "Save Task"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ============================================================ */
            /* 2-Column Calendar & Agenda Split Layout                      */
            /* ============================================================ */
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
              {/* ---------------------------------------------------------- */}
              {/* Left Column: Full Monthly Interactive Calendar (7 cols)    */}
              {/* ---------------------------------------------------------- */}
              <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#E3E3E3] dark:border-white/10 flex flex-col justify-between">
                <div>
                  {/* Calendar Month Navigation Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#E3E3E3] dark:border-white/10">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#686868] dark:text-neutral-400">
                        Monthly View
                      </span>
                      <h3 className="text-lg font-black text-[#171717] dark:text-white tracking-tight">
                        {monthName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleGoToday}
                        className="btn-bounce-sm px-2.5 py-1 text-xs font-bold rounded-lg border border-[#E3E3E3] dark:border-white/10 hover:border-[#FF6A00] text-[#686868] hover:text-[#FF6A00] dark:text-neutral-300 dark:hover:text-orange-400 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous month"
                        className="btn-bounce-sm grid h-7 w-7 place-items-center rounded-lg bg-[#F7F7F7] dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/15 text-[#171717] dark:text-neutral-300 hover:text-[#FF6A00] dark:hover:text-white border border-[#E3E3E3] dark:border-transparent transition-colors"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        aria-label="Next month"
                        className="btn-bounce-sm grid h-7 w-7 place-items-center rounded-lg bg-[#F7F7F7] dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/15 text-[#171717] dark:text-neutral-300 hover:text-[#FF6A00] dark:hover:text-white border border-[#E3E3E3] dark:border-transparent transition-colors"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                      <span
                        key={d + i}
                        className="text-[11px] font-bold text-[#686868] dark:text-neutral-400 py-1"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Days Matrix */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((cd, idx) => {
                      const isSelected = cd.isSelected;
                      const isToday = cd.isToday;

                      return (
                        <button
                          key={idx + cd.dateStr}
                          type="button"
                          onClick={() => setSelectedDate(cd.dateStr)}
                          className={`calendar-day-interactive group relative flex flex-col items-center justify-between p-2 rounded-xl transition-all duration-150 min-h-[52px] sm:min-h-[58px] ${
                            isSelected
                              ? "bg-gradient-to-b from-[#FF6A00] to-[#E94E00] text-white shadow-md font-bold scale-[1.02] z-10"
                              : isToday
                              ? "bg-orange-500/10 dark:bg-orange-500/15 border-2 border-[#FF6A00] text-[#171717] dark:text-white font-bold"
                              : cd.isCurrentMonth
                              ? "bg-[#F7F7F7] dark:bg-white/[0.04] text-[#171717] dark:text-white hover:bg-orange-50 dark:hover:bg-white/10 hover:text-[#FF6A00] dark:hover:text-white border border-[#E3E3E3]/60 dark:border-white/5"
                              : "bg-transparent text-[#999] dark:text-neutral-600 hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`text-xs sm:text-sm font-extrabold ${
                              isSelected
                                ? "text-white"
                                : isToday
                                ? "text-[#FF6A00] dark:text-orange-400"
                                : cd.isCurrentMonth
                                ? "text-[#171717] dark:text-white"
                                : "text-[#999] dark:text-neutral-600"
                            }`}
                          >
                            {cd.dayNum}
                          </span>

                          {/* Task Dots / Indicators */}
                          <div className="flex items-center gap-1 mt-1 min-h-[6px]">
                            {cd.hasTasks && (
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected
                                    ? "bg-white"
                                    : cd.hasUrgent
                                    ? "bg-rose-500 animate-pulse"
                                    : "bg-[#FF6A00] dark:bg-orange-400"
                                }`}
                              />
                            )}
                            {cd.taskCount > 1 && (
                              <span
                                className={`text-[9px] font-bold leading-none ${
                                  isSelected
                                    ? "text-white/90"
                                    : "text-[#686868] dark:text-neutral-400"
                                }`}
                              >
                                {cd.taskCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar Legend / Info Bar */}
                <div className="mt-5 pt-3 border-t border-[#E3E3E3] dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#686868] dark:text-neutral-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#FF6A00]" /> Scheduled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Urgent
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
                    </span>
                  </div>

                  <span className="font-semibold text-[#171717] dark:text-neutral-300">
                    {(data.tasks ?? []).length} Total Tasks
                  </span>
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* Right Column: Daily Agenda & Selected Date Tasks (5 cols)  */}
              {/* ---------------------------------------------------------- */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-[#FAFAFA]/50 dark:bg-transparent">
                <div>
                  {/* Selected Date Header */}
                  <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-[#E3E3E3] dark:border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#686868] dark:text-neutral-400">
                          Daily Agenda
                        </span>
                        <span className="text-[11px] font-bold text-[#FF6A00] dark:text-orange-400">
                          {formatFriendlyDate(selectedDate)}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#171717] dark:text-white mt-0.5">
                        {selectedDateLabel}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddForm(selectedDate)}
                      className="btn-bounce-sm inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-orange-500/20 dark:text-orange-400 hover:bg-[#FF6A00] hover:text-white text-xs font-bold transition-all"
                      aria-label="Add task for this date"
                    >
                      <Plus size={14} /> Add Task
                    </button>
                  </div>

                  {/* Tasks List for Selected Date */}
                  {selectedDateTasks.length === 0 ? (
                    <div className="py-8 text-center px-4 rounded-2xl border border-dashed border-[#E3E3E3] dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500/10 text-[#FF6A00] dark:bg-orange-500/20 dark:text-orange-400 mx-auto mb-2.5">
                        <CalendarIcon size={20} />
                      </div>
                      <p className="text-xs font-bold text-[#171717] dark:text-white">
                        No tasks scheduled for this day
                      </p>
                      <p className="text-[11px] text-[#686868] dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                        Plan a study session, set an assignment reminder, or schedule upcoming exams.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddForm(selectedDate)}
                        className="btn-bounce-sm mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-orange-500/20 dark:text-orange-400 hover:bg-[#FF6A00] hover:text-white text-xs font-bold transition-all"
                      >
                        <Plus size={13} /> Add Task for {formatFriendlyDate(selectedDate)}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {selectedDateTasks.map((task) => {
                        const status = getTaskStatus(task);
                        const statusStyle = STATUS_STYLES[status];
                        const priorityStyle = PRIORITY_STYLES[task.priority];

                        return (
                          <div
                            key={task.id}
                            className={`group rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-md ${
                              task.completed
                                ? "bg-[#F7F7F7]/60 dark:bg-white/[0.02] border-[#E3E3E3] dark:border-white/5 opacity-80"
                                : status === "Overdue"
                                ? "bg-rose-500/[0.04] dark:bg-rose-500/10 border-rose-500/30"
                                : "bg-white dark:bg-white/[0.04] border-[#E3E3E3] dark:border-white/10 hover:border-[#FF6A00]/40"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Checkbox button */}
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(task)}
                                aria-label={
                                  task.completed
                                    ? `Reopen task ${task.title}`
                                    : `Mark task ${task.title} as completed`
                                }
                                className={`btn-bounce-sm grid h-5 w-5 place-items-center rounded-lg border mt-0.5 transition-colors ${
                                  task.completed
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-[#999] dark:border-neutral-500 hover:border-[#FF6A00] dark:hover:border-orange-400"
                                }`}
                              >
                                {task.completed && <Check size={12} strokeWidth={3} />}
                              </button>

                              {/* Task Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h5
                                    className={`text-xs font-extrabold truncate ${
                                      task.completed
                                        ? "line-through text-[#686868] dark:text-neutral-400"
                                        : "text-[#171717] dark:text-white"
                                    }`}
                                  >
                                    {task.title}
                                  </h5>

                                  {/* Quick Action Buttons */}
                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditForm(task)}
                                      aria-label={`Edit ${task.title}`}
                                      className="btn-bounce-sm p-1 text-[#686868] hover:text-[#171717] dark:text-neutral-400 dark:hover:text-white transition-colors"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingTaskId(task.id)}
                                      aria-label={`Delete ${task.title}`}
                                      className="btn-bounce-sm p-1 text-[#686868] hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* Badges Row */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0F0F0] dark:bg-white/10 text-[#686868] dark:text-neutral-300">
                                    {task.type}
                                  </span>

                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityStyle.badge}`}
                                  >
                                    {task.priority}
                                  </span>

                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusStyle.badge}`}
                                  >
                                    {statusStyle.label}
                                  </span>
                                </div>

                                {/* Time & Reminder Details */}
                                {(task.startTime || task.dueTime || task.reminder !== "none") && (
                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#686868] dark:text-neutral-400 font-medium">
                                    {(task.startTime || task.dueTime) && (
                                      <span className="flex items-center gap-1">
                                        <Clock size={11} className="text-[#FF6A00] dark:text-orange-400" />
                                        {formatTaskTimeRange(task.startTime, task.dueTime)}
                                      </span>
                                    )}
                                    {task.reminder && task.reminder !== "none" && (
                                      <span className="flex items-center gap-1">
                                        <Bell size={11} className="text-amber-500" />
                                        {REMINDER_LABELS[task.reminder]}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Notes Preview */}
                                {task.description && (
                                  <p className="mt-1.5 text-[11px] text-[#686868] dark:text-neutral-400 line-clamp-2 bg-black/[0.02] dark:bg-white/[0.02] p-1.5 rounded-lg border border-[#E3E3E3]/50 dark:border-white/5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upcoming Tasks Preview across other dates */}
                {upcomingTasks.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-[#E3E3E3] dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#686868] dark:text-neutral-400">
                        Approaching Deadlines
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {upcomingTasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedDate(t.date);
                            const dt = new Date(t.date);
                            setViewYearMonth({
                              year: dt.getFullYear(),
                              month: dt.getMonth(),
                            });
                          }}
                          className="btn-bounce-sm w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-white/5 border border-[#E3E3E3] dark:border-white/10 hover:border-[#FF6A00] text-left text-xs transition-all"
                        >
                          <div className="min-w-0 flex-1 truncate pr-2">
                            <span className="font-bold text-[#171717] dark:text-white truncate block">
                              {t.title}
                            </span>
                            <span className="text-[10px] text-[#686868] dark:text-neutral-400">
                              {formatFriendlyDate(t.date)}
                              {t.dueTime ? ` · ${formatTime12h(t.dueTime)}` : ""}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              PRIORITY_STYLES[t.priority].badge
                            }`}
                          >
                            {t.priority}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* Delete Confirmation Overlay Dialog                             */}
        {/* ============================================================== */}
        {deletingTaskId && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
            role="alertdialog"
            aria-labelledby="confirm-delete-task-title"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161B26] p-5 shadow-2xl border border-[#E3E3E3] dark:border-white/15 text-center">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 mx-auto mb-3">
                <Trash2 size={22} />
              </div>
              <h4
                id="confirm-delete-task-title"
                className="text-sm font-bold text-[#171717] dark:text-white"
              >
                Delete Scheduled Task?
              </h4>
              <p className="text-xs text-[#686868] dark:text-neutral-400 mt-1">
                Are you sure you want to remove this task? This action cannot be undone.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setDeletingTaskId(null)}
                  className="btn-bounce-sm px-4 py-2 rounded-xl border border-[#E3E3E3] dark:border-white/10 text-xs font-bold text-[#686868] dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDelete}
                  className="btn-bounce-sm px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  {isSubmitting ? "Deleting..." : "Delete Task"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
