# Algorithm Studio visual identity

## Core idea
The mark turns a capital A into an executable path: two stable rails establish the letterform, while a cyan route indents, branches, and exits as a run arrow. It connects academic algorithm structure with execution without using generic code brackets.

## Palette
| Token | HEX | Use | Accessibility |
|---|---|---|---|
| Ink | `#101820` | Primary text, mark on light | 17.7:1 on Paper White (AAA) |
| Deep surface | `#172129` | App and presentation backgrounds | 14.7:1 with Paper White (AAA) |
| Algorithm blue | `#247BA0` | Links and structural accents | Use for large text/graphics on Paper White; not body copy |
| Bright cyan | `#55B5D9` | Run path, focus, key actions | 7.1:1 on Deep Surface (AAA); avoid as small text on white |
| Paper white | `#F5F7F8` | Light surfaces and text on dark | Primary high-contrast surface |
| Success green | `#5FAF78` | Success states only | Pair with Ink text or use as non-text indicator |

Contrast figures are approximate WCAG sRGB ratios. Test final UI combinations at implementation time. Never rely on color alone for status.

## Typography
- Product/interface: **Atkinson Hyperlegible Next** (400, 500, 700). Humanist, highly readable, open-source. Fallback: Inter, system-ui, sans-serif.
- Code: **JetBrains Mono** (400, 500, 700). Clear punctuation and generous differentiation. Fallback: ui-monospace, SFMono-Regular, Consolas, monospace.
- Wordmark: Algorithm 700; Studio 400; no tracking; compact spacing. Use outlined wordmark artwork when exact consistency is essential.

## Clear space and size
- Clear space: at least **1/4 of the symbol width** on every side (equivalent to the width of the cyan arrowhead).
- Standalone symbol minimum: **16 px** digital / **6 mm** print.
- Horizontal logo minimum: **140 px** digital / **35 mm** print.
- Compact lockup minimum: **96 px** wide.
- App icon artwork sits inside a 75% safe area, suitable for Windows tiles and macOS masks. Do not pre-mask platform assets unless the platform requires it.

## Correct use
- Use the light logo on Paper White or similarly light neutral surfaces.
- Use the dark logo on Ink or Deep Surface.
- Keep the rails and execution path in the supplied color relationship.
- Use monochrome variants when production is limited to one ink.

## Incorrect use
- Do not stretch, skew, rotate, outline, or add shadows.
- Do not recolor the cyan execution path with arbitrary colors.
- Do not place the mark on low-contrast or visually noisy imagery.
- Do not rearrange the symbol geometry or typeset a substitute wordmark.
- Do not add gradients, glows, circuit traces, brackets, or decorative code.

## Asset naming
`algorithm-studio-[asset]-[arrangement]-[background].[ext]`
Examples: `algorithm-studio-logo-horizontal-dark.svg`, `algorithm-studio-symbol-light.png`, `algorithm-studio-social-preview.svg`. “Light” means intended for a light background; “dark” means intended for a dark background.

## Master artwork
SVG files are the editable masters. They contain flat vector paths and text only, with no filters, raster effects, linked images, or gradients. PNG, ICO, and ICNS files are exports.
