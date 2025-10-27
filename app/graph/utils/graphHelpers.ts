import type { PersonData } from "../types";

export const NODE_DIAM = 80;
export const CENTER = { x: 600, y: 360 };
export const GAP = 80;
export const RING_STEP = NODE_DIAM + GAP;

export const fullName = (d?: Partial<PersonData>) =>
  `${d?.firstName ?? ""} ${d?.lastName ?? ""}`.trim() || d?.label || "Unnamed";

export const initials = (d?: Partial<PersonData>) => {
  const fn = (d?.firstName ?? "").trim();
  const ln = (d?.lastName ?? "").trim();
  const i = (fn[0] || "") + (ln[0] || "");
  return i.toUpperCase() || "•";
};

export function ringCapacity(r: number) {
  if (r <= 0) return 0;
  const radius = r * RING_STEP;
  const perSlot = NODE_DIAM + GAP;
  return Math.max(6, Math.floor((2 * Math.PI * radius) / perSlot));
}

export function ringPosition(r: number, index: number, count: number, centerAngle = 0) {
  if (r <= 0) return { x: CENTER.x, y: CENTER.y };
  const rad = r * RING_STEP;
  const capacity = Math.max(1, ringCapacity(r));
  const angleStep = (2 * Math.PI) / Math.max(capacity, count);
  const totalSpan = angleStep * (count - 1);
  const startAngle = centerAngle - totalSpan / 2;
  const angle = startAngle + index * angleStep;
  return { x: CENTER.x + rad * Math.cos(angle), y: CENTER.y + rad * Math.sin(angle) };
}

export function angleOfPos(pos: { x: number; y: number }) {
  return Math.atan2(pos.y - CENTER.y, pos.x - CENTER.x);
}