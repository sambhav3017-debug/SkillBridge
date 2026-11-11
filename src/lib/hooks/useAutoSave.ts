"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type AutoSaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<{ ok: boolean; error?: string } | void>;
  delayMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delayMs = 1200,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialRender = useRef(true);
  const latestData = useRef(data);
  const onSaveRef = useRef(onSave);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedJson = useRef<string>(JSON.stringify(data));

  useEffect(() => {
    latestData.current = data;
    onSaveRef.current = onSave;
  }, [data, onSave]);

  const executeSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const currentJson = JSON.stringify(latestData.current);
    if (currentJson === lastSavedJson.current) {
      setStatus("idle");
      return;
    }

    setStatus("saving");
    setErrorMessage(null);

    try {
      const result = await onSaveRef.current(latestData.current);
      if (result && !result.ok) {
        setStatus("error");
        setErrorMessage(result.error ?? "Failed to save automatically");
      } else {
        lastSavedJson.current = currentJson;
        setStatus("saved");
        setLastSavedAt(new Date());
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Network error while auto-saving");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const currentJson = JSON.stringify(data);
    if (currentJson === lastSavedJson.current) {
      return;
    }

    setStatus("unsaved");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      executeSave();
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, delayMs, enabled, executeSave]);

  return {
    status,
    lastSavedAt,
    errorMessage,
    saveNow: executeSave,
  };
}
