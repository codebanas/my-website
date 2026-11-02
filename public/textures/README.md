# Card textures

These are the user-supplied texture files. Their filename (without the extension)
defines the allowed CSS blend modes. A hyphen separates alternatives; only one
mode is chosen per card. `differences` is normalized to CSS `difference`.

To add a texture, copy it here and add its filename to `textureFiles` in
`lib/card-styles.ts`. Supported formats are MP4 and GIF. The seven color values
are defined on `:root` in `app/globals.css`.

Colors always repeat in this order: orange, blue, green, pink, yellow, purple,
teal. `getCardColor(position)` accepts positive or negative absolute slider
positions, so the cycle continues in both directions.

`getCardAppearance(record.id, position)` can run in either the UI or a future
backend. Color follows slider position; the texture and single permitted blend
mode are chosen deterministically from the record ID.

When saving a real record, its resulting `appearance` can be stored with the
record and passed to `CodeCards` with the rest of the data. Stored appearances
preserve texture and blend selections even if the registry grows. The slider
always applies its ordered color, including for records with saved appearances.

```ts
const card = {
  id: record.id,
  code: record.code,
  price: record.price,
  rate: record.rate,
  appearance: getCardAppearance(record.id, position),
};
```

For paginated data, render `<CodeCards cards={cards} startIndex={firstPosition} />`.
Start at position 0 for the initial orange card. When prepending N cards,
decrease `firstPosition` by N; when appending, leave it unchanged. Existing cards
then keep their positions and colors while new cards continue the cycle.

Video textures loop silently while visible and pause offscreen or in a hidden
tab. Reduced-motion mode shows only the base color.
