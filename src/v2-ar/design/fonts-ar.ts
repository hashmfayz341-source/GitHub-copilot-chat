import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Cairo is bundled locally (public/fonts) like the V1 faces, so Arabic renders
 * are reproducible offline and never depend on the Google Fonts CDN at render
 * time. Arabic and Latin subsets are loaded under one family so an English
 * medical term inside an Arabic line keeps a single typographic voice.
 */
let loaded: Promise<unknown> | null = null;

export const loadFontsAR = () => {
  if (!loaded) {
    loaded = Promise.all([
      loadFont({family: 'CairoAR', url: staticFile('fonts/Cairo-arabic.woff2'), weight: '200 1000'}),
      loadFont({family: 'CairoAR', url: staticFile('fonts/Cairo-latin.woff2'), weight: '200 1000'}),
    ]);
  }
  return loaded;
};
