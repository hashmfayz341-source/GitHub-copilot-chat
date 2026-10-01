import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/** Fonts are bundled locally (public/fonts) so renders are reproducible offline. */
let loaded: Promise<unknown> | null = null;

export const loadFonts = () => {
  if (!loaded) {
    loaded = Promise.all([
      loadFont({family: 'Inter', url: staticFile('fonts/Inter.woff2'), weight: '100 900'}),
      loadFont({family: 'Manrope', url: staticFile('fonts/Manrope.woff2'), weight: '200 800'}),
    ]);
  }
  return loaded;
};
