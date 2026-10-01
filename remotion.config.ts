import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(4);
// Use the pre-installed headless Chromium when available (offline-friendly).
const fs = require('fs');
const shell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(shell)) Config.setBrowserExecutable(shell);
