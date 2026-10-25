# Nexus AI design system: "Pinboard"

The product's one idea is memory, so memories are drawn as instant photos
pinned to a grey board around the chat. Everything else stays quiet: ink on a
warm grey board, with white cards.

## Colour
| Token | Value | Use |
|---|---|---|
| `--bg` | `#EEEEEB` | board / page ground |
| `--bg-surface` | `#FFFFFF` | cards, photo frames, panels |
| `--bg-elevated` / `--bg-inset` | `#E6E6E2` / `#DCDCD7` | hovers, inputs |
| `--text` | `#17181B` | ink, primary buttons (`--indigo` is now an alias for ink) |
| `--text-2` / `--text-3` | `#4A4B52` / `#6A6B72` | secondary and quiet text (AA on the board) |
| `--teal` | `#127A6A` | anything Nexus remembers: memory chips, pins, focus ring, chart bars |
| `--teal-pale` | `#E2F1EE` | memory chip fill |
| `--magenta` | `#B4532A` | the one warm accent (stat highlight) |

Legacy names (`--indigo*`, `--amethyst*`, `--ivory*`) are kept as aliases so
inline styles in the JS templates keep resolving. No gradients, no blur.

## Type
Onest for everything (400–800). Headlines 800 with tight tracking
(-0.04em). Labels are sentence case, never tracked uppercase.

## Shape and depth
Buttons 8px radius, 600 weight; primary is ink, hover turns teal. Cards are
white with a 1px border. Snapshot cards are the only tilted, shadowed objects
on the page, with a teal pin. The nav has a 2px ink rule underneath.

## Motion
Snapshots drop onto the board on load (0.8s, staggered), skipped under
`prefers-reduced-motion`.

## Icons
Interface emoji are swapped for one stroke SVG set by the inline emoji-swap
script; content emoji stay in the data.
