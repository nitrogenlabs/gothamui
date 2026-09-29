export interface FluidSpringState {
  position: number;
  velocity: number;
}

/** Unit mass with spring force and fluid drag; small substeps remain stable after slow frames. */
export const advanceFluidSpring = (state: FluidSpringState, target: number, elapsed: number): FluidSpringState => {
  const duration = Math.min(Math.max(elapsed, 0), 0.064);
  const steps = Math.max(1, Math.ceil(duration / 0.004));
  const dt = duration / steps;
  let {position, velocity} = state;
  for(let step = 0; step < steps; step++) {
    velocity += ((-64 * (position - target)) - (13.8 * velocity)) * dt;
    position += velocity * dt;
  }
  return Math.abs(position - target) < 0.0005 && Math.abs(velocity) < 0.005
    ? {position: target, velocity: 0} : {position, velocity};
};
