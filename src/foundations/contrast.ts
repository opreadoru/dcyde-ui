// WCAG 2.2 contrast ratio between two CSS colors, read from the live page so
// the numbers always match the current tokens and theme.

type RGBA = [number, number, number, number];

/** Resolves any CSS color (including var(--token)) to RGBA using the browser. */
export function resolveColor(value: string, scope: HTMLElement): RGBA {
  const probe = document.createElement("span");
  probe.style.color = value;
  scope.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  const parts = rgb.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

/** Paints a see-through color over an opaque background, like the screen does. */
function flatten(fg: RGBA, bg: RGBA): RGBA {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
    1,
  ];
}

function luminance([r, g, b]: RGBA): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * A see-through background (like a tinted chip) is first painted over `base`,
 * the opaque surface it sits on, then the foreground is painted over that.
 */
export function contrastRatio(fg: RGBA, bg: RGBA, base: RGBA): number {
  const solidBg = flatten(bg, base);
  const a = luminance(flatten(fg, solidBg));
  const b = luminance(solidBg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
