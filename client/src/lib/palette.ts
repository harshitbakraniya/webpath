/**
 * WebPath brand palette
 * Bright Grey → Reversed Grey (light to dark)
 */
export const palette = {
  brightGrey: '#EBEDF1',
  shyBlunt: '#D4D8DF',
  timberWolf: '#ACADB1',
  smokedPearl: '#706F70',
  jetBlack: '#353536',
  reversedGrey: '#080808',
} as const;

export type PaletteColor = keyof typeof palette;

export const paletteLight = {
  bg: palette.brightGrey,
  bgMuted: palette.shyBlunt,
  bgAccent: palette.timberWolf,
  surface: '#FFFFFF',
  surface2: palette.brightGrey,
  border: palette.shyBlunt,
  text: palette.reversedGrey,
  textMuted: palette.smokedPearl,
  textSubtle: palette.timberWolf,
  hover: 'rgba(212, 216, 223, 0.55)',
  active: palette.shyBlunt,
} as const;

export const paletteDark = {
  bg: palette.reversedGrey,
  bgMuted: palette.jetBlack,
  bgAccent: palette.smokedPearl,
  surface: palette.jetBlack,
  surface2: '#2a2a2b',
  border: '#454546',
  text: palette.brightGrey,
  textMuted: palette.timberWolf,
  textSubtle: palette.smokedPearl,
  hover: 'rgba(112, 111, 112, 0.35)',
  active: palette.smokedPearl,
} as const;

/** CSS gradient stacks — use with class `webpath-app-bg` */
export const lightBackgroundGradient = `
  radial-gradient(ellipse 100% 80% at 0% 0%, rgba(212, 216, 223, 0.85) 0%, transparent 50%),
  radial-gradient(ellipse 80% 60% at 100% 0%, rgba(172, 173, 177, 0.22) 0%, transparent 45%),
  radial-gradient(ellipse 90% 70% at 50% 100%, rgba(212, 216, 223, 0.65) 0%, transparent 55%),
  radial-gradient(ellipse 50% 45% at 68% 38%, rgba(235, 237, 241, 0.95) 0%, transparent 50%),
  radial-gradient(ellipse 35% 30% at 22% 72%, rgba(212, 216, 223, 0.5) 0%, transparent 60%),
  linear-gradient(145deg, #EBEDF1 0%, #D4D8DF 32%, #EBEDF1 55%, #D4D8DF 78%, #EBEDF1 100%)
`.trim();

export const darkBackgroundGradient = `
  radial-gradient(ellipse 80% 50% at 12% -5%, rgba(112, 111, 112, 0.35) 0%, transparent 50%),
  radial-gradient(ellipse 65% 45% at 88% 8%, rgba(53, 53, 54, 0.9) 0%, transparent 45%),
  radial-gradient(ellipse 90% 60% at 50% 105%, rgba(112, 111, 112, 0.2) 0%, transparent 55%),
  linear-gradient(165deg, #080808 0%, #353536 42%, #080808 78%, #353536 100%)
`.trim();
