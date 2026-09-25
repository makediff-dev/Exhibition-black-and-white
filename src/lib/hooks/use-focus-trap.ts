"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visibleFocusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (item) => item.offsetParent !== null || item === document.activeElement
  );
}

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onEscape?: () => void
) {
  const openerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!active) return;
    const current = document.activeElement;
    if (current instanceof HTMLElement) {
      openerRef.current = current;
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener && document.contains(opener)) {
        opener.focus();
      }
      return;
    }

    const root = containerRef.current;
    if (!root) return;

    const focusFirst = () => {
      visibleFocusable(root)[0]?.focus();
    };
    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = visibleFocusable(root);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, containerRef, onEscape]);
}

export function useInertSiblings(active: boolean, rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const overlay = rootRef.current;
    const siblings = [...document.body.children].filter((node) => node !== overlay);
    siblings.forEach((node) => node.setAttribute("inert", ""));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      siblings.forEach((node) => node.removeAttribute("inert"));
    };
  }, [active, rootRef]);
}
