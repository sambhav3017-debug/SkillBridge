"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { PersonalizedLearningPath, AssistantInteractionMessage } from "@/lib/student/personalized-path-types";

interface Props {
  path: PersonalizedLearningPath;
  onOpenSkillModal: (skillId: string) => void;
}

const QUICK_PROMPTS = [
  "What should I learn next?",
  "Why was this skill recommended?",
  "Which video should I watch first?",
  "What prerequisites do I need?",
  "Which project should I build?",
  "Am I progressing according to my plan?",
];

function createInitialMessages(role: string, context: string, goal: string): AssistantInteractionMessage[] {
  return [
    {
      id: "msg-welcome",
      sender: "assistant",
      content: `Hello! I am your SkillBridge Learning Assistant for the **${role}** path.\n\nI analyze your profile context (${context}) and track progress toward your goal: *"${goal}"*.\n\nAsk me anything or tap one of the suggested prompts below!`,
      timestamp: "Just now",
    },
  ];
}

let msgCounter = 0;
function getNextMsgId(prefix: string) {
  msgCounter += 1;
  return `${prefix}-${msgCounter}`;
}

export default function PersonalizedLearningAssistant({ path, onOpenSkillModal }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<AssistantInteractionMessage[]>(() =>
    createInitialMessages(path.targetRole, path.academicContextSummary, path.targetGoal3to6m)
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: AssistantInteractionMessage = {
      id: getNextMsgId("msg-user"),
      sender: "student",
      content: text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/student/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assistant_query",
          query: text,
        }),
      });
      const data = await res.json();
      if (data?.data?.message) {
        setMessages((prev) => [...prev, data.data.message]);
      }
    } catch (e) {
      console.error("Assistant request failed:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: getNextMsgId("msg-err"),
          sender: "assistant",
          content: "I'm having trouble retrieving your real-time path context right now. Please try again in a moment.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#11151F] backdrop-blur-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b border-black/[0.05] dark:border-white/[0.08] bg-gradient-to-r from-orange-50/60 via-white to-amber-50/40 dark:from-[#141824] dark:to-[#11151F]"
      >
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-amber-500 dark:from-sb-cyan dark:to-sb-blue text-white dark:text-[#090C12] shadow-xs">
            <Bot size={18} />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              Contextual Learning Assistant
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                Connected
              </span>
            </h3>
            <p className="text-[11px] text-sb-muted font-normal">
              Live guidance tailored to your {path.targetRole} milestones
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-sb-muted hover:text-black dark:hover:text-white transition"
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded Assistant Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Prompts Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-[11px] font-bold text-sb-muted shrink-0 flex items-center gap-1">
              <Sparkles size={12} className="text-[#FF6A00] dark:text-sb-cyan" /> Suggested:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="shrink-0 px-3.5 py-1.5 rounded-full border border-black/[0.07] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:border-[#FF6A00] dark:hover:border-sb-cyan hover:text-[#FF6A00] dark:hover:text-sb-cyan hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-180 cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {messages.map((m) => {
              const isAssistant = m.sender === "assistant";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <span className="h-7 w-7 rounded-xl bg-orange-500/10 dark:bg-sb-cyan/15 text-[#FF6A00] dark:text-sb-cyan flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} />
                    </span>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-xl space-y-2.5 ${
                      isAssistant
                        ? "bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200"
                        : "bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue text-white dark:text-[#090C12] font-semibold shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>

                    {/* Suggested Action Pill */}
                    {isAssistant && m.suggestedAction && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (m.suggestedAction?.targetId) {
                              onOpenSkillModal(m.suggestedAction.targetId);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-white bg-[#FF6A00] dark:bg-sb-cyan dark:text-[#090C12] hover:opacity-95 active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
                        >
                          <span>{m.suggestedAction.label}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-sb-muted pl-10">
                <span className="h-2 w-2 rounded-full bg-[#FF6A00] dark:bg-sb-cyan animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-sb-blue animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-orange-400 dark:bg-cyan-300 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1 font-mono">Analyzing learning path...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="relative flex items-center gap-2 pt-2 border-t border-black/[0.06] dark:border-white/10">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder={`Ask anything about your ${path.targetRole} journey...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#11151E] text-xs text-neutral-900 dark:text-white placeholder:text-sb-muted focus:outline-none focus:ring-2 focus:ring-[#FF6A00] dark:focus:ring-sb-cyan focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 rounded-xl text-white bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue dark:text-[#090C12] disabled:opacity-40 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
