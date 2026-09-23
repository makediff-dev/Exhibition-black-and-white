"use client";

import { useEffect } from "react";

export function useUnsavedChanges(isDirty: boolean, message = "Есть несохранённые изменения. Уйти со страницы?") {
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, message]);
}
