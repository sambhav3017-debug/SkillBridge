"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  X,
  CalendarCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import type {
  StudentData,
  StudentTask,
  TaskPriority,
  TaskType,
} from "@/lib/student/types";
import { TASK_PRIORITIES, TASK_TYPES } from "@/lib/student/types";
import {
  formatFriendlyDate,
  formatTime12h,
  getLocalDateString,
  PRIORITY_STYLES,
  sortTasksChronologically,
} from "@/lib/student/task-utils";
import { useStudent } from "./StudentProvider";
import { TextSoftSwap } from "@/components/ui/SkillBridgeCalendar";

interface StudentCompactPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  data: StudentData;
  anchorButtonId?: string;
}

export default function StudentCompactPlanner({
  isOpen,
  onClose,
  initialDate,
  data,
  anchorButtonId = "schedule-planner-plus-btn",
}: StudentCompactPlannerProps) {
  const { createTask, deleteTask, toggleTaskComplete, notify } = useStudent();
  const plannerRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || todayStr
  );

  // Month navigation: { year, month (0-11) }
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

  // Planner view mode: "agenda" | "add"
  const [mode, setMode] = useState<"agenda" | "add">("agenda");

  // Inline Quick Add Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(selectedDate);
  const [formStartTime, setFormStartTime] = useState("");
  const [formDueTime, setFormDueTime] = useState("");
  const [formType, setFormType] = useState<TaskType>("Personal Task");
  const [formPriority, setFormPriority] = useState<TaskPriority>("Medium");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when initialDate changes externally
  const [prevInitialDate, setPrevInitialDate] = useState(initialDate);
  if (initialDate !== prevInitialDate) {
    setPrevInitialDate(initialDate);
    const d = initialDate || todayStr;
    setSelectedDate(d);
    setFormDate(d);
    const dt = new Date(d);
    if (!Number.isNaN(dt.getTime())) {
      setViewYearMonth({ year: dt.getFullYear(), month: dt.getMonth() });
    }
    setMode("agenda");
  }

  // Handle escape key and click-outside dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const anchor = document.getElementById(anchorButtonId);
      if (
        plannerRef.current &&
        !plannerRef.current.contains(e.target as Node) &&
        (!anchor || !anchor.contains(e.target as Node))
      ) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorButtonId]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewYearMonth((curr) => {
      if (curr.month === 0) return { year: curr.year - 1, month: 11 };
      return { year: curr.year, month: curr.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewYearMonth((curr) => {
      if (curr.month === 11) return { year: curr.year + 1, month: 0 };
      return { year: curr.year, month: curr.month + 1 };
    });
  };

  const handleGoToToday = () => {
    const now = new Date();
    setViewYearMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(todayStr);
    setFormDate(todayStr);
  };

  // Month & Year string
  const monthName = useMemo(() => {
    return new Date(viewYearMonth.year, viewYearMonth.month, 1).toLocaleDateString(
      "en-US",
      { month: "short", year: "numeric" }
    );
  }, [viewYearMonth]);

  // Task map: count & list of tasks per date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, StudentTask[]>();
    (data.tasks ?? []).forEach((t) => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });
    return map;
  }, [data.tasks]);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    const raw = tasksByDate.get(selectedDate) || [];
    return sortTasksChronologically(raw);
  }, [tasksByDate, selectedDate]);

  // Calendar matrix calculation (starts on Sunday)
  const calendarCells = useMemo(() => {
    const { year, month } = viewYearMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasTasks: boolean;
      taskCount: number;
    }[] = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dStr = getLocalDateString(new Date(prevYear, prevMonthIdx, dayNum));
      const count = (tasksByDate.get(dStr) || []).length;
      cells.push({
        dayNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        hasTasks: count > 0,
        taskCount: count,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = getLocalDateString(new Date(year, month, d));
      const count = (tasksByDate.get(dStr) || []).length;
      cells.push({
        dayNum: d,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        hasTasks: count > 0,
        taskCount: count,
      });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dStr = getLocalDateString(new Date(nextYear, nextMonthIdx, d));
      const count = (tasksByDate.get(dStr) || []).length;
      cells.push({
        dayNum: d,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        hasTasks: count > 0,
        taskCount: count,
      });
    }

    return cells;
  }, [viewYearMonth, todayStr, selectedDate, tasksByDate]);

  // Form submission handler
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) {
      setFormError("Task title is required.");
      return;
    }

    if (!formDate) {
      setFormError("Task date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTask({
        title: trimmedTitle,
        date: formDate,
        startTime: formStartTime || undefined,
        dueTime: formDueTime || undefined,
        type: formType,
        priority: formPriority,
        description: formNotes.trim() || undefined,
        reminder: "none",
      });

      if (res.ok) {
        notify("success", `Added task: “${trimmedTitle}”`);
        setSelectedDate(formDate);
        setFormTitle("");
        setFormNotes("");
        setFormStartTime("");
        setFormDueTime("");
        setMode("agenda");
      } else {
        setFormError(res.error || "Failed to create task.");
        notify("error", res.error || "Failed to create task.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error.";
      setFormError(msg);
      notify("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (task: StudentTask) => {
    const nextCompleted = !task.completed;
    const res = await toggleTaskComplete(task.id, nextCompleted);
    if (res.ok) {
      notify(
        "success",
        nextCompleted
          ? `Completed: “${task.title}”`
          : `Reopened: “${task.title}”`
      );
    } else {
      notify("error", res.error || "Could not update task.");
    }
  };

  // Delete task
  const handleDeleteTask = async (task: StudentTask) => {
    const res = await deleteTask(task.id);
    if (res.ok) {
      notify("success", `Deleted: “${task.title}”`);
    } else {
      notify("error", res.error || "Could not delete task.");
    }
  };

  // Selected date label
  const friendlySelectedDate = useMemo(() => {
    return formatFriendlyDate(selectedDate);
  }, [selectedDate]);

  if (!isOpen) return null;

  return (
    <div
      ref={plannerRef}
      id="compact-calendar-planner"
      role="region"
      aria-label="Personal calendar and task planner"
      className="xl:absolute xl:right-[calc(100%+1.25rem)] xl:top-0 xl:w-[410px] xl:max-w-[420px] xl:h-full w-full mt-4 xl:mt-0 z-40 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 slide-in-from-right-3 duration-200"
    >
      {/* ============================================================== */}
      {/* 1. COMPACT TOP HEADER                                          */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E3E3] dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-orange-500/20 dark:text-orange-400">
            <CalendarIcon size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <TextSoftSwap
                text={monthName}
                as="span"
                className="text-xs font-extrabold text-[#171717] dark:text-white tracking-tight"
              />
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="btn-bounce-sm grid h-5 w-5 place-items-center rounded text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="btn-bounce-sm grid h-5 w-5 place-items-center rounded text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGoToToday}
            className="btn-bounce-sm text-[10px] font-bold px-2 py-1 rounded-md bg-[#F7F7F7] dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/10 text-[#686868] dark:text-neutral-300 hover:text-[#FF6A00] dark:hover:text-orange-400 border border-[#E3E3E3] dark:border-transparent transition-all"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === "add") {
                setMode("agenda");
              } else {
                setFormDate(selectedDate);
                setMode("add");
              }
            }}
            aria-label={mode === "add" ? "View agenda" : "Add task"}
            className={`btn-bounce-sm flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
              mode === "add"
                ? "bg-neutral-200 dark:bg-white/20 text-[#171717] dark:text-white"
                : "bg-[#FF6A00] text-white hover:bg-[#E94E00] shadow-sm"
            }`}
          >
            {mode === "add" ? (
              <>
                <ArrowLeft size={10} /> Agenda
              </>
            ) : (
              <>
                <Plus size={11} /> Add
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close planner"
            className="btn-bounce-sm grid h-6 w-6 place-items-center rounded-md text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. COMPACT MONTHLY CALENDAR GRID                               */}
      {/* ============================================================== */}
      <div className="p-3 border-b border-[#E3E3E3] dark:border-white/10 bg-white dark:bg-[#0D1117]">
        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
            <span
              key={idx}
              className="text-[9px] font-extrabold uppercase tracking-wider text-[#686868] dark:text-neutral-500 py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarCells.map((cell, idx) => {
            const isSel = cell.isSelected;
            const isTod = cell.isToday;
            const isCur = cell.isCurrentMonth;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedDate(cell.dateStr);
                  setFormDate(cell.dateStr);
                  // Keep on agenda mode when selecting dates
                  if (mode === "add") setMode("agenda");
                }}
                className={`group relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSel
                    ? "bg-gradient-to-br from-[#FF6A00] to-[#E94E00] text-white shadow-sm font-bold scale-[1.04] z-10"
                    : isTod
                    ? "border border-[#FF6A00] text-[#FF6A00] dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10 font-bold"
                    : isCur
                    ? "text-[#171717] dark:text-neutral-200 hover:bg-orange-50/70 dark:hover:bg-white/10"
                    : "text-neutral-400/40 dark:text-neutral-600 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                aria-label={`${cell.dateStr}${
                  cell.hasTasks ? `, ${cell.taskCount} tasks` : ""
                }`}
              >
                <span>{cell.dayNum}</span>

                {/* Task dot indicator */}
                {cell.hasTasks && (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${
                      isSel
                        ? "bg-white"
                        : isTod
                        ? "bg-[#FF6A00] dark:bg-orange-400"
                        : "bg-[#FF6A00] dark:bg-orange-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. AGENDA / QUICK ADD VIEW CONTAINER                          */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-[220px]">
        {mode === "agenda" ? (
          <>
            {/* Selected Date Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E3E3]/70 dark:border-white/10">
              <div className="min-w-0">
                <TextSoftSwap
                  text={friendlySelectedDate}
                  as="span"
                  className="text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 block"
                />
                <TextSoftSwap
                  text={`${selectedDateTasks.length} ${selectedDateTasks.length === 1 ? "task scheduled" : "tasks scheduled"}`}
                  as="p"
                  className="text-xs font-extrabold text-[#171717] dark:text-white truncate"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormDate(selectedDate);
                  setMode("add");
                }}
                className="btn-bounce-sm text-[10px] font-bold text-[#FF6A00] hover:text-[#E94E00] dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 dark:bg-orange-500/20 transition-colors cursor-pointer"
              >
                <Plus size={11} /> New Task
              </button>
            </div>

            {/* Task Items List */}
            {selectedDateTasks.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500/10 dark:bg-white/5 text-[#FF6A00] dark:text-orange-400 mb-2">
                  <CalendarCheck size={18} />
                </div>
                <p className="text-xs font-bold text-[#171717] dark:text-white">
                  No tasks for this day
                </p>
                <p className="text-[11px] text-[#686868] dark:text-neutral-400 mt-0.5 max-w-[220px]">
                  Stay ahead by planning your study sessions, exams, and project goals.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormDate(selectedDate);
                    setMode("add");
                  }}
                  className="btn-bounce-sm mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#E94E00] text-white shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={12} /> Add Task for This Date
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateTasks.map((task) => {
                  const priority = PRIORITY_STYLES[task.priority];

                  return (
                    <div
                      key={task.id}
                      className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl border transition-all duration-150 ${
                        task.completed
                          ? "bg-[#F9F9F9] dark:bg-white/[0.02] border-[#E3E3E3]/60 dark:border-white/5 opacity-75"
                          : "bg-white dark:bg-white/[0.04] border-[#E3E3E3] dark:border-white/10 hover:border-[#FF6A00]/40 hover:shadow-sm"
                      }`}
                    >
                      {/* Completion Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        aria-label={
                          task.completed
                            ? `Mark “${task.title}” as pending`
                            : `Mark “${task.title}” as completed`
                        }
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border transition-all cursor-pointer ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-[#999] dark:border-white/30 hover:border-[#FF6A00] text-transparent"
                        }`}
                      >
                        <Check size={10} strokeWidth={3} />
                      </button>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={`text-xs font-bold truncate transition-colors ${
                              task.completed
                                ? "line-through text-[#888] dark:text-neutral-500"
                                : "text-[#171717] dark:text-white"
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>

                        {/* Meta: Priority, Time, Type */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${priority.bg} ${priority.text}`}
                          >
                            {task.priority}
                          </span>

                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-[#686868] dark:text-neutral-400 font-medium">
                            {task.type}
                          </span>

                          {task.startTime && (
                            <span className="inline-flex items-center gap-1 text-[#686868] dark:text-neutral-400">
                              <Clock size={10} />
                              {formatTime12h(task.startTime)}
                              {task.dueTime ? ` - ${formatTime12h(task.dueTime)}` : ""}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="mt-1 text-[11px] text-[#686868] dark:text-neutral-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task)}
                        aria-label={`Delete ${task.title}`}
                        className="btn-bounce-sm opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ============================================================== */
          /* INLINE QUICK ADD TASK FORM                                      */
          /* ============================================================== */
          <form onSubmit={handleSaveTask} className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E3E3]/70 dark:border-white/10">
              <span className="text-xs font-extrabold text-[#171717] dark:text-white">
                Quick Add Task
              </span>
              <button
                type="button"
                onClick={() => setMode("agenda")}
                className="text-[11px] text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="compact-task-title"
                className="block text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="compact-task-title"
                type="text"
                required
                autoFocus
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Complete System Design Notes"
                className="w-full px-3 py-2 rounded-lg text-xs bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white placeholder:text-[#999] focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Date and Priority Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="compact-task-date"
                  className="block text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1"
                >
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="compact-task-date"
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="compact-task-priority"
                  className="block text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1"
                >
                  Priority
                </label>
                <select
                  id="compact-task-priority"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-[#F7F7F7] dark:bg-[#1A1F2B] border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Type & Start Time */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="compact-task-type"
                  className="block text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1"
                >
                  Type
                </label>
                <select
                  id="compact-task-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TaskType)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-[#F7F7F7] dark:bg-[#1A1F2B] border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="compact-task-time"
                  className="block text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1"
                >
                  Time (Optional)
                </label>
                <input
                  id="compact-task-time"
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label
                htmlFor="compact-task-notes"
                className="block text-[10px] font-bold uppercase tracking-wider text-[#686868] dark:text-neutral-400 mb-1"
              >
                Notes (Optional)
              </label>
              <textarea
                id="compact-task-notes"
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Additional notes or links..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-[#F7F7F7] dark:bg-white/5 border border-[#E3E3E3] dark:border-white/15 text-[#171717] dark:text-white placeholder:text-[#999] focus:outline-none focus:border-[#FF6A00] dark:focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("agenda")}
                className="btn-bounce-sm px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F7F7] dark:bg-white/5 text-[#686868] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-bounce-sm px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#E94E00] text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={12} /> Save Task
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. COMPACT FOOTER STATUS                                       */}
      {/* ============================================================== */}
      <div className="px-4 py-2.5 border-t border-[#E3E3E3] dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-[#686868] dark:text-neutral-400">
        <span className="flex items-center gap-1 font-medium">
          <CheckCircle2 size={11} className="text-emerald-500" />
          {(data.tasks ?? []).filter((t) => t.completed).length} of{" "}
          {(data.tasks ?? []).length} completed
        </span>
        <button
          type="button"
          onClick={onClose}
          className="hover:text-[#171717] dark:hover:text-white font-semibold transition-colors cursor-pointer"
        >
          Collapse
        </button>
      </div>
    </div>
  );
}
