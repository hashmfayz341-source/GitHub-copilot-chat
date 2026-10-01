import {useId} from 'react';

/** Unique, url()-safe id for SVG defs (clipPath, mask, gradient) — safe with many instances on screen. */
export const useSvgId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
