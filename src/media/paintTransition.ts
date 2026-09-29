import {transitionDefinition, transitionPixelRank, TRANSITION_STYLE} from './transitions.js';

/** Composite decoded frames without reading pixels back to the CPU or allocating canvases per tick. */
export const paintTransition = (
  context: CanvasRenderingContext2D, width: number, height: number, type: string, progress: number,
  outgoing: () => void, incoming: () => void
): void => {
  const p = Math.max(0, Math.min(1, progress));
  const {color, direction, family} = transitionDefinition(type);
  const draw = (paint: () => void, alpha = 1, x = 0, y = 0, scale = 1): void => {
    context.save();
    context.globalAlpha = alpha;
    context.translate(x + (width * (1 - scale) / 2), y + (height * (1 - scale) / 2));
    context.scale(scale, scale);
    // Clip transforms at the padded source edges, just like the export sampler.
    context.beginPath();
    context.rect(0, 0, width, height);
    context.clip();
    paint();
    context.restore();
  };
  const mask = (path: () => void, paint: () => void): void => {
    context.save();
    context.beginPath();
    path();
    context.clip();
    paint();
    context.restore();
  };
  if(p === 0) {
    outgoing();
    return;
  }
  if(p === 1 || family === 'cut') {
    incoming();
    return;
  }
  switch(family) {
    case 'dissolve':
      outgoing();
      draw(incoming, p);
      break;
    case 'dip':
      context.fillStyle = color || 'black';
      context.fillRect(0, 0, width, height);
      draw(p < 0.5 ? outgoing : incoming, Math.abs((p * 2) - 1));
      break;
    case 'wipe':
      outgoing();
      mask(() => {
        if(direction === 'left') {
          context.rect(width * (1 - p), 0, width * p, height);
        } else if(direction === 'right') {
          context.rect(0, 0, width * p, height);
        } else if(direction === 'up') {
          context.rect(0, height * (1 - p), width, height * p);
        } else {
          context.rect(0, 0, width, height * p);
        }
      }, incoming);
      break;
    case 'slide':
    case 'push': {
      const horizontal = direction === 'left' || direction === 'right';
      const sign = direction === 'left' || direction === 'up' ? 1 : -1;
      const size = horizontal ? width : height;
      const offset = Math.round(size * (1 - p));
      const out = family === 'push' ? -sign * (size - offset) : 0;
      draw(outgoing, 1, horizontal ? out : 0, horizontal ? 0 : out);
      draw(incoming, 1, horizontal ? sign * offset : 0, horizontal ? 0 : sign * offset);
      break;
    }
    case 'zoom':
      // Additive weighted layers keep the fade correct outside a shrunken incoming image too.
      context.save();
      context.globalCompositeOperation = 'lighter';
      draw(outgoing, 1 - p);
      draw(incoming, p, 0, 0, 1 + ((direction === 'in' ? -1 : 1) * TRANSITION_STYLE.zoom * (1 - p)));
      context.restore();
      break;
    case 'iris': {
      const opening = direction === 'out';
      (opening ? outgoing : incoming)();
      mask(() => context.arc(width / 2, height / 2, Math.hypot(width, height) / 2 * (opening ? p : 1 - p),
        0, Math.PI * 2), opening ? incoming : outgoing);
      break;
    }
    case 'pixel': {
      outgoing();
      const {pixelColumns: columns, pixelRows: rows} = TRANSITION_STYLE;
      mask(() => {
        for(let y = 0; y < rows; y++) {
          for(let x = 0; x < columns; x++) {
            if(transitionPixelRank(x, y) < p) {
              const left = Math.ceil(x * width / columns);
              const top = Math.ceil(y * height / rows);
              context.rect(left, top, Math.ceil((x + 1) * width / columns) - left,
                Math.ceil((y + 1) * height / rows) - top);
            }
          }
        }
      }, incoming);
      break;
    }
    case 'blur': {
      const {blurRadius, blurSteps} = TRANSITION_STYLE;
      context.save();
      context.globalCompositeOperation = 'lighter';
      for(let i = -blurSteps; i <= blurSteps; i++) {
        const x = Math.round(width * blurRadius * 4 * p * (1 - p) * i / blurSteps);
        draw(outgoing, (1 - p) / ((blurSteps * 2) + 1), x);
        draw(incoming, p / ((blurSteps * 2) + 1), x);
      }
      context.restore();
      break;
    }
  }
};
