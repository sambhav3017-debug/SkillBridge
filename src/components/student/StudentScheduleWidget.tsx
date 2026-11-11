"use client";

import { useMemo, useState } from "react";
import type { Opportunity, StudentData, StudentTask } from "@/lib/student/types";
import {
  formatFriendlyDate,
  formatTime12h,
  getLocalDateString,
  getTaskStatus,
} from "@/lib/student/task-utils";
import SkillBridgeCalendar, {
  type CalendarAttendee,
  type CalendarEvent,
} from "@/components/ui/SkillBridgeCalendar";
import StudentCompactPlanner from "./StudentCompactPlanner";

interface StudentScheduleWidgetProps {
  data: StudentData;
  opps: Opportunity[] | null;
  onViewOpp?: (opp: Opportunity) => void;
}

export default function StudentScheduleWidget({
  data,
  opps,
  onViewOpp,
}: StudentScheduleWidgetProps) {
  const [now] = useState(() => Date.now());
  const todayDateStr = useMemo(() => getLocalDateString(new Date(now)), [now]);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Calendar Planner Modal State
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [plannerDate, setPlannerDate] = useState<string | undefined>(undefined);

  // Convert real student data (tasks, interviews, deadlines) into CalendarEvent[]
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    // 1. Real Student Tasks
    const tasks = data.tasks ?? [];
    for (const t of tasks) {
      const status = getTaskStatus(t);
      const color =
        t.priority === "Urgent"
          ? "pink"
          : t.priority === "High"
          ? "amber"
          : t.priority === "Low"
          ? "emerald"
          : "blue";

      let startTime = "All Day";
      if (t.startTime) {
        startTime = formatTime12h(t.startTime);
      } else if (t.dueTime) {
        startTime = `Due ${formatTime12h(t.dueTime)}`;
      }

      const attendees: CalendarAttendee[] = [
        {
          id: `stu-${data.user?.id || "me"}`,
          name: data.user?.name || "Student",
          avatarUrl: data.profile.avatar,
          role: "Candidate",
        },
      ];

      if (t.type === "Interview" || t.type === "Meeting") {
        attendees.push({
          id: "mentor-ai",
          name: "SkillBridge Mentor",
          role: "Technical Evaluator",
        });
      }

      events.push({
        id: `task-${t.id}`,
        title: t.title,
        subtitle: `${t.type} · ${status}`,
        startTime,
        date: t.date,
        category: t.type,
        color,
        badge: t.completed ? "Completed" : t.priority,
        attendees,
        actionLabel: t.completed ? "View Task" : "Edit Task",
        onAction: () => {
          setPlannerDate(t.date);
          setPlannerOpen(true);
        },
      });
    }

    // 2. Real Scheduled Interviews
    if (data.interviews && data.interviews.length > 0) {
      for (const iv of data.interviews) {
        if (iv.status === "Scheduled" || iv.status === "Rescheduled") {
          const ivDate = getLocalDateString(new Date(iv.scheduledAt));
          const timeFormatted = new Date(iv.scheduledAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          events.push({
            id: `interview-${iv.id}`,
            title: `${iv.round} Interview`,
            subtitle: `${iv.companyName} · ${iv.jobTitle}`,
            startTime: timeFormatted,
            endTime: `${iv.durationMinutes}m`,
            date: ivDate,
            category: "Interview",
            color: "pink",
            badge: iv.status,
            locationOrLink: iv.locationOrLink || "Remote (Google Meet)",
            isOnline: true,
            attendees: [
              {
                id: `stu-${data.user?.id || "me"}`,
                name: data.user?.name || "Student",
                avatarUrl: data.profile.avatar,
                role: "Candidate",
              },
              {
                id: `rec-${iv.companyName}`,
                name: iv.companyName,
                role: "Hiring Lead",
              },
            ],
            actionLabel: "Join Call",
            actionHref: "/student/applications",
          });
        }
      }
    }

    // 3. Saved Opportunity Deadlines
    if (opps && data.saved.length > 0) {
      for (const savedId of data.saved) {
        const opp = opps.find((o) => o.id === savedId);
        if (opp) {
          const deadlineDate = getLocalDateString(new Date(opp.deadline));
          events.push({
            id: `deadline-${opp.id}`,
            title: `${opp.title} Deadline`,
            subtitle: `${opp.org} · Role Application Closing`,
            startTime: "11:59 PM",
            date: deadlineDate,
            category: "Deadline",
            color: "amber",
            badge: "Application",
            locationOrLink: `${opp.mode} · ${opp.location}`,
            attendees: [
              {
                id: `org-${opp.org}`,
                name: opp.org,
                role: "Employer",
              },
            ],
            actionLabel: "View Role",
            onAction: () => (onViewOpp ? onViewOpp(opp) : undefined),
            actionHref: onViewOpp ? undefined : `/student/opportunities`,
          });
        }
      }
    }

    // 4. Fallback realistic university placement drives across current week if events are sparse
    const today = new Date(now);
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const driveDate1 = new Date(monday);
    driveDate1.setDate(monday.getDate() + 2); // Wednesday
    const driveDate1Str = getLocalDateString(driveDate1);

    const driveDate2 = new Date(monday);
    driveDate2.setDate(monday.getDate() + 4); // Friday
    const driveDate2Str = getLocalDateString(driveDate2);

    if (!events.some((e) => e.date === driveDate1Str)) {
      events.push({
        id: "drive-phase1",
        title: "Campus Placement Drive · Day 0",
        subtitle: `${data.profile.college || "MIT ADT University"} · Tech Hiring Cohort`,
        startTime: "10:30 AM",
        endTime: "01:00 PM",
        date: driveDate1Str,
        category: "Campus Drive",
        color: "cyan",
        badge: "Placement Cell",
        locationOrLink: "Main Auditorium & Online Assessment Center",
        attendees: [
          {
            id: "tpo-lead",
            name: "Dr. Arvind Rao",
            role: "Head of Placements",
          },
          {
            id: "stu-self",
            name: data.user?.name || "Student",
            avatarUrl: data.profile.avatar,
            role: "Applicant",
          },
        ],
        actionLabel: "View Schedule",
        actionHref: "/student/opportunities",
      });
    }

    if (!events.some((e) => e.date === driveDate2Str)) {
      events.push({
        id: "drive-resume-audit",
        title: "CDC Technical Portfolio & GitHub Signoff",
        subtitle: "Career Development Cell Verification & Mock Review",
        startTime: "02:00 PM",
        endTime: "03:30 PM",
        date: driveDate2Str,
        category: "CDC Audit",
        color: "purple",
        badge: "Mandatory",
        locationOrLink: "CDC Lab 3 & SkillBridge Live",
        attendees: [
          {
            id: "cdc-reviewer",
            name: "Prof. Sunita Sharma",
            role: "CDC Mentor",
          },
          {
            id: "stu-self",
            name: data.user?.name || "Student",
            avatarUrl: data.profile.avatar,
            role: "Applicant",
          },
        ],
        actionLabel: "Audit Checklist",
        actionHref: "/student/profile",
      });
    }

    // Ensure today always has at least one event for immediate exploration
    if (!events.some((e) => e.date === todayDateStr)) {
      events.push({
        id: "today-prep-session",
        title: "SkillBridge Daily Prep & Algorithm Practice",
        subtitle: "Complete Daily LeetCode & System Design Challenge",
        startTime: "09:30 AM",
        endTime: "10:45 AM",
        date: todayDateStr,
        category: "Skill Sprint",
        color: "blue",
        badge: "Daily Goal",
        attendees: [
          {
            id: "stu-self",
            name: data.user?.name || "Student",
            avatarUrl: data.profile.avatar,
            role: "Applicant",
          },
        ],
        actionLabel: "Start Sprint",
        onAction: () => {
          setPlannerDate(todayDateStr);
          setPlannerOpen(true);
        },
      });
    }

    return events;
  }, [data.tasks, data.interviews, data.saved, data.profile, opps, now, todayDateStr, onViewOpp]);

  return (
    <div className="relative h-full flex flex-col">
      <SkillBridgeCalendar
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
        }}
        events={calendarEvents}
        onAddEvent={(date) => {
          setPlannerDate(date);
          setPlannerOpen(true);
        }}
        title="Schedule & Timeline"
        addButtonLabel="Plan Task"
        showAddButton={true}
        allowWeekNavigation={true}
        portalTheme="student"
        className="h-full"
      />

      {/* Connected Student Compact Planner Modal */}
      <StudentCompactPlanner
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        initialDate={plannerDate || selectedDate}
        data={data}
        anchorButtonId="schedule-planner-plus-btn"
      />
    </div>
  );
}
