"use client";

import { Activity as ReactActivity } from "react";

type ActivityMode = "visible" | "hidden";

type ActivityProps = {
  /** When false, children are hidden and effects are cleaned up; state is preserved when shown again. */
  visible?: boolean;
  /** Direct mode control. Takes precedence over `visible` when both are used. */
  mode?: ActivityMode;
  /** Optional name for React DevTools. */
  name?: string;
  children: React.ReactNode;
};

/**
 * Wraps React's Activity for consistent hide/show of modals and overlays.
 * Use wherever you need to hide content while preserving state and cleaning up effects.
 */
export function Activity({
  visible = true,
  mode,
  name,
  children,
}: ActivityProps) {
  const resolvedMode: ActivityMode = mode ?? (visible ? "visible" : "hidden");
  return (
    <ReactActivity mode={resolvedMode} name={name}>
      {children}
    </ReactActivity>
  );
}
