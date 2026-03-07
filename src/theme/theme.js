// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WattWise — Eco-Modern Design System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Core Palette ─────────────────────────────────────────────────────────────
export const COLORS = {
  // ── Brand gradient anchors
  mint:          '#00BFA5',   // Emerald Mint  ← gradient start
  mintDark:      '#00897B',   // pressed / deep mint
  mintLight:     '#E0F2F1',   // mint tint
  mintPale:      '#F0FBF9',   // ultra-light mint surface
  spBlue:        '#005596',   // SP Blue        ← gradient end
  spBlueDark:    '#003F6E',

  // ── Surfaces
  background:    '#F7F9FC',   // Soft Pearl
  card:          '#FFFFFF',   // Pure white card
  cardGlass:     'rgba(255,255,255,0.88)',   // frosted glass card
  overlay:       'rgba(7,24,46,0.50)',

  // ── Typography
  textHeading:   '#1A1E2E',   // Bold Charcoal
  textBody:      '#4B5563',   // Medium Grey
  textMuted:     '#9CA3AF',   // Muted Grey
  textWhite:     '#FFFFFF',
  textWhiteSub:  'rgba(255,255,255,0.78)',

  // ── Semantic
  success:       '#00BFA5',
  successLight:  '#E0F2F1',
  warning:       '#F59E0B',
  warningLight:  '#FEF3C7',
  error:         '#EF4444',
  errorLight:    '#FEE2E2',

  // ── Accent chips
  orange:        '#FF7043',
  orangeLight:   '#FFF3E0',
  gold:          '#FFB300',
  goldLight:     '#FFF8E1',
  purple:        '#7C3AED',
  purpleLight:   '#EDE9FE',
  blue:          '#3B82F6',
  blueLight:     '#EFF6FF',

  // ── Chart
  chartBar:      '#00BFA5',   // active bar colour
  chartBarInactive: '#E0E0E0',

  // ── Borders
  border:        '#E5E7EB',
  borderLight:   '#F3F4F6',
  borderGlass:   'rgba(255,255,255,0.40)',
};

// ─── Gradient presets ─────────────────────────────────────────────────────────
export const GRADIENTS = {
  brand:   ['#00BFA5', '#005596'],          // Mint → SP Blue (135°)
  brandH:  ['#00BFA5', '#00897B'],          // Mint → Dark Mint (horizontal)
  mint:    ['#00BFA5', '#26C6DA'],          // Mint → Cyan
  pearl:   ['#F7F9FC', '#EEF2F7'],          // Soft pearl bg
  card:    ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)'],
  glass:   ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)'],
  overlay: ['rgba(0,191,165,0.90)', 'rgba(0,85,150,0.95)'],
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  card: 24,   // ← primary card radius per spec
  xl:   28,
  full: 999,
};

// ─── Elevation ────────────────────────────────────────────────────────────────
// All shadows use 0.1 opacity per spec ("soft shadows")
export const SHADOWS = {
  xs: {
    shadowColor: '#0A1628',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0A1628',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#0A1628',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0A1628',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
  mint: {
    // Coloured glow for featured cards
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:    4,
  sm:    8,
  md:    12,
  base:  16,
  lg:    20,   // ← default screen padding
  xl:    24,
  xxl:   32,
  xxxl:  48,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  display:     { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, color: '#1A1E2E' },
  h1:          { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, color: '#1A1E2E' },
  h2:          { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, color: '#1A1E2E' },
  h3:          { fontSize: 17, fontWeight: '700', color: '#1A1E2E' },
  h4:          { fontSize: 15, fontWeight: '600', color: '#1A1E2E' },
  body:        { fontSize: 14, fontWeight: '400', lineHeight: 20, color: '#4B5563' },
  bodyMd:      { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  bodySm:      { fontSize: 13, fontWeight: '400', lineHeight: 18, color: '#4B5563' },
  caption:     { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  captionBold: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  micro:       { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
};

// ─── Gamification Levels ──────────────────────────────────────────────────────
export const GP_LEVELS = [
  { level: 1, title: 'Energy Seedling',   min: 0,    max: 200,  color: '#8BC34A', icon: '🌱' },
  { level: 2, title: 'Energy Apprentice', min: 200,  max: 500,  color: '#00BFA5', icon: '🌿' },
  { level: 3, title: 'Energy Guardian',   min: 500,  max: 1000, color: '#00ACC1', icon: '🌳' },
  { level: 4, title: 'Eco Champion',      min: 1000, max: 2000, color: '#005596', icon: '⚡' },
  { level: 5, title: 'Green Master',      min: 2000, max: 2000, color: '#FFB300', icon: '🌍' },
];

export const getLevel = (gp) => {
  for (const l of GP_LEVELS) {
    if (gp < l.max || l.level === 5) return l;
  }
  return GP_LEVELS[0];
};

export const getLevelProgress = (gp) => {
  const lvl = getLevel(gp);
  if (lvl.level === 5) return 1;
  return Math.min((gp - lvl.min) / (lvl.max - lvl.min), 1);
};
