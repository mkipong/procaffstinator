// All patterns are white strokes/fills at low opacity so they overlay any gradient without affecting its colour.

export const BILUM_PATTERN = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='white' stroke-linecap='square'%3E%3Cpath d='M20,1 L39,20 L20,39 L1,20 Z' stroke-opacity='0.22' stroke-width='1.2'/%3E%3Cpath d='M20,11 L29,20 L20,29 L11,20 Z' stroke-opacity='0.15' stroke-width='0.8'/%3E%3Cpath d='M20,1 L16,8 M20,1 L24,8' stroke-opacity='0.18' stroke-width='0.8'/%3E%3Cpath d='M39,20 L32,16 M39,20 L32,24' stroke-opacity='0.18' stroke-width='0.8'/%3E%3Cpath d='M20,39 L16,32 M20,39 L24,32' stroke-opacity='0.18' stroke-width='0.8'/%3E%3Cpath d='M1,20 L8,16 M1,20 L8,24' stroke-opacity='0.18' stroke-width='0.8'/%3E%3Cpath d='M18,20 L20,18 L22,20 L20,22 Z' stroke-opacity='0.2' stroke-width='0.8' fill='white' fill-opacity='0.15'/%3E%3C/g%3E%3C/svg%3E")`;

export interface PatternOption {
  label: string;
  value: string; // 'none' | data URL
}

export const PATTERNS: PatternOption[] = [
  {
    label: 'None',
    value: 'none',
  },
  {
    // PNG bilum weave — concentric diamonds + tribal chevron marks
    label: 'Bilum (PNG)',
    value: BILUM_PATTERN,
  },
  {
    // Regular dot grid
    label: 'Polka Dots',
    value: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='white' fill-opacity='0.22'/%3E%3C/svg%3E")`,
  },
  {
    // 45-degree diagonal stripes
    label: 'Diagonal Lines',
    value: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 2l4-4zM0 8l8-8zM6 10l4-4z' stroke='white' stroke-opacity='0.2' stroke-width='1'/%3E%3C/svg%3E")`,
  },
  {
    // Square grid lines
    label: 'Square Grid',
    value: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L0 0 0 20' fill='none' stroke='white' stroke-opacity='0.15' stroke-width='0.5'/%3E%3C/svg%3E")`,
  },
  {
    // Plus / cross symbols in a grid
    label: 'Plus Signs',
    value: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 4v12M4 10h12' stroke='white' stroke-opacity='0.25' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  },
  {
    // Horizontal chevron / zigzag rows
    label: 'Zigzag',
    value: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5L5 0 10 5M0 10L5 5 10 10' fill='none' stroke='white' stroke-opacity='0.22' stroke-width='1'/%3E%3C/svg%3E")`,
  },
  {
    // Horizontal sine-wave stripes
    label: 'Waves',
    value: `url("data:image/svg+xml,%3Csvg width='24' height='20' viewBox='0 0 24 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 C4 1 8 1 12 5 S20 9 24 5M0 15 C4 11 8 11 12 15 S20 19 24 15' fill='none' stroke='white' stroke-opacity='0.2' stroke-width='1'/%3E%3C/svg%3E")`,
  },
  {
    // Circuit-board traces and nodes
    label: 'Circuit',
    value: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10L50 10L50 50M90 50L50 50M10 70L30 70L30 90M70 10L70 30L90 30M10 30L30 30M70 70L70 90M90 70L70 70' fill='none' stroke='white' stroke-opacity='0.18' stroke-width='1.5' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='10' r='2' fill='white' fill-opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='2' fill='white' fill-opacity='0.2'/%3E%3Ccircle cx='30' cy='70' r='2' fill='white' fill-opacity='0.2'/%3E%3Ccircle cx='70' cy='30' r='2' fill='white' fill-opacity='0.2'/%3E%3Ccircle cx='70' cy='70' r='2' fill='white' fill-opacity='0.2'/%3E%3C/svg%3E")`,
  },
  {
    // Honeycomb hexagonal grid
    label: 'Hexagons',
    value: `url("data:image/svg+xml,%3Csvg width='28' height='50' viewBox='0 0 28 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 33L0 25V8L14 0l14 8v17L14 33zM14 50L0 42V33l14 8 14-8v9L14 50z' fill='none' stroke='white' stroke-opacity='0.2' stroke-width='1'/%3E%3C/svg%3E")`,
  },
];

export function buildBackground(color: string, pattern?: string): string {
  const gradient = color?.startsWith('linear-gradient')
    ? color
    : 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)';

  // undefined pattern → default bilum; 'none' → no pattern overlay
  const pat = pattern === undefined ? BILUM_PATTERN : pattern;
  if (pat === 'none') return gradient;
  return `${pat}, ${gradient}`;
}
