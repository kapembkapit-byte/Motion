import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../timing';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Snappy, premium spring (little overshoot).
export const pop = (frame: number, delay = 0, damping = 16, mass = 0.7) =>
  spring({frame: frame - delay, fps: FPS, config: {damping, mass, stiffness: 170}});

// Soft spring for large moves (phone, camera).
export const glide = (frame: number, delay = 0) =>
  spring({frame: frame - delay, fps: FPS, config: {damping: 22, mass: 1, stiffness: 90}});

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// 0 → 1 between two frames with an easing.
export const ramp = (frame: number, from: number, to: number, easing = easeInOut) =>
  interpolate(frame, [from, to], [0, 1], {...clamp, easing});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
