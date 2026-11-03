# Helvetica Neue typography

The installed Helvetica Neue family is registered in `app/layout.tsx` with real
font files for every weight and italic style. Weight values were checked against
each file's OS/2 metadata. Synthetic bold and italic are disabled in the global
styles. Font faces load on demand rather than preloading all sixteen files.

| Figma style | CSS weight | Root token |
| --- | --- | --- |
| Ultra Light | 100 | `--font-weight-ultra-light` |
| Thin | 200 | `--font-weight-thin` |
| Light | 300 | `--font-weight-light` |
| Regular | 400 | `--font-weight-regular` |
| Medium | 500 | `--font-weight-medium` |
| Bold | 700 | `--font-weight-bold` |
| Heavy | 800 | `--font-weight-heavy` |
| Black | 900 | `--font-weight-black` |

Italic versions use the same weight with `font-style: italic`. Figma's unqualified
"Italic" style is Regular (400) Italic.

Use Figma's font size in CSS pixels. Match its weight, line height, and letter
spacing separately; do not resize text to compensate for a different weight.
The card code uses 14px Bold with 100% line height. The account button label uses
13px Bold with 100% line height. Card prices and percentages use 20px Heavy with
86% line height, matching the supplied Figma typography references.
The hero uses 56px Heavy with 95% line height on desktop, scaling down on
smaller screens.

```css
.example {
  font-size: 20px;
  font-weight: var(--font-weight-heavy);
  line-height: 24px;
}
```

## Browser rendering

Card text and controls share the surface's alternating rotation and pivot at
the center of the card. The text panel has its own opaque background and stays
separate from the texture's blending and filtering. Real font faces render at
their design sizes, with native browser antialiasing. The 8px hover lift uses
relative positioning, preserving the rotation without scaling text or moving
neighboring cards. The slider fades use edge overlays rather than a mask
on the entire text-bearing scroll layer. Initial scrolling is aligned to a
device pixel.

These choices reduce rendering effects that can change text antialiasing.
Browser and Figma rasterization can still differ. See Chromium's
[LCD text eligibility logic](https://chromium.googlesource.com/chromium/src/+/master/cc/layers/picture_layer_impl.cc)
and [Chrome's text antialiasing explanation](https://web.dev/articles/antialiasing-101).
