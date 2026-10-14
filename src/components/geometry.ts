import type {Rect, Shot} from '../content';
import {PHONE} from '../theme';

export type Pose = {x: number; y: number; scale: number};

// Where a screenshot area sits on the canvas when shown in a phone at `pose`
// (rotation ignored — used as the start point of lift-out animations).
export const screenRectToCanvas = (pose: Pose, shot: Shot, r: Rect) => {
  const k = PHONE.screenW / shot.width;
  const lx = PHONE.bezel + r.x * k;
  const ly = PHONE.bezel + r.y * k;
  return {
    x: pose.x + (lx - PHONE.w / 2) * pose.scale,
    y: pose.y + (ly - PHONE.h / 2) * pose.scale,
    w: r.w * k * pose.scale,
    h: r.h * k * pose.scale,
  };
};

// Screen-local pixel position of a screenshot point (for tap ripples).
export const shotToScreen = (shot: Shot, px: number, py: number) => {
  const k = PHONE.screenW / shot.width;
  return {x: px * k, y: py * k};
};
