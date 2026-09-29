import {describe, expect, it} from 'vitest';

import {advanceFluidSpring} from './fluidSpring.js';

import type {FluidSpringState} from './fluidSpring.js';

const settle = (initial: FluidSpringState, target: number, frameDuration = 1 / 60): FluidSpringState => {
  let state = initial;
  for(let frame = 0; frame < 600; frame++) {
    state = advanceFluidSpring(state, target, frameDuration);

    expect(Number.isFinite(state.position)).toBe(true);
  }
  return state;
};

describe('fluid surface spring', () => {
  it('settles at the exact endpoint for both arrival and departure', () => {
    expect(settle({position: 1, velocity: 0}, 0)).toEqual({position: 0, velocity: 0});
    expect(settle({position: 0, velocity: 0}, 1)).toEqual({position: 1, velocity: 0});
  });

  it('retains momentum when the surface reverses during arrival', () => {
    let state = {position: 1, velocity: 0};
    for(let frame = 0; frame < 12; frame++) {
      state = advanceFluidSpring(state, 0, 1 / 60);
    }
    const reversed = advanceFluidSpring(state, 1, 1 / 60);

    expect(Math.abs(reversed.position - state.position)).toBeLessThan(0.08);
    expect(settle(reversed, 1)).toEqual({position: 1, velocity: 0});
  });

  it('remains stable across low refresh rates and delayed background frames', () => {
    for(const duration of [1 / 30, 1 / 120, 4]) {
      expect(settle({position: 1, velocity: 0}, 0, duration)).toEqual({position: 0, velocity: 0});
    }
  });
});
