// Shared classes for every dialog, so they all open, look and close the same way.
// Base UI sets data-starting-style while a dialog opens and data-ending-style
// while it closes. The fade and scale run on the motion tokens, so they turn
// off under reduced motion.

export const DIALOG_BACKDROP =
  "fixed inset-0 z-(--z-dialog) bg-overlay transition-opacity duration-(--duration-base) ease-out data-starting-style:opacity-0 data-ending-style:opacity-0";

export const DIALOG_POPUP =
  "fixed top-1/2 left-1/2 z-(--z-dialog) -translate-x-1/2 -translate-y-1/2 rounded-lg border border-default bg-raised text-primary shadow-lg outline-none " +
  "transition-[opacity,scale] duration-(--duration-base) ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 " +
  // A dialog opened on top of this one dims it slightly
  "data-nested-dialog-open:brightness-90";
