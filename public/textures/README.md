# Card textures

These are the user-supplied texture files. Their filename (without the extension)
defines the allowed CSS blend modes. A hyphen separates alternatives; only one
mode is chosen per card. `differences` is normalized to CSS `difference`.

To add a texture, copy it here and add its filename to `textureFiles` in
`lib/card-styles.ts`. Supported formats are MP4 and GIF. The seven color values
are defined on `:root` in `app/globals.css`.

`getCardAppearance(record.id)` can run in either the UI or a future backend. It
chooses a color, texture, and single permitted blend mode deterministically from
the record ID, so rendering and reloads do not change a card's appearance.

When saving a real record, its resulting `appearance` can be stored with the
record and passed to `CodeCards` with the rest of the data. Stored appearances
take precedence, preserving the selection even if the palette or registry grows.

```ts
const card = {
  id: record.id,
  code: record.code,
  price: record.price,
  rate: record.rate,
  appearance: getCardAppearance(record.id),
};
```

Video textures loop silently while visible and pause offscreen or in a hidden
tab. Reduced-motion mode shows only the base color.
