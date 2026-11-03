# Quick-links final screen

The final screen contains the three-row link window and a centered
"Terms & Conditions" line below it. It has no GIF, artwork, or local fade layer.
The page's navigation and card side fades remain separate.

The "Scrollable Quick Links" label uses 13px Helvetica Neue Medium with normal
letter spacing. The intro occupies at least the initial viewport, ending with
48px below the resting card bottoms; the full-width cue begins below that
screen and enters naturally on scroll. On shorter screens the intro grows to
fit its content instead of squeezing the hero or cards.
The label and expanding arrow stay centered together as the arrow draws on scroll,
retracts when the page reaches the terms, then reveals the supplied circular
up-arrow icon in the same spot while the label fades out. The button has a 44px hit area and smoothly
returns to the top. Scrolling upward restores the cue. This swap uses fixed
layout bounds so it cannot change the scroll endpoint. Reduced motion makes
the swap and return-to-top immediate.

The terms line reuses `hero-description`: 14px Helvetica Neue Medium, normal
letter spacing, and 150% line height on desktop or 125% below 1024px. It sits
48px below the menu, with 32px beneath it. No terms destination or agreement
text has been provided, so this is a plain label rather than a placeholder link.

The menu and terms line form one sticky final block. Its measured row and line
heights replace the old media panel's reserved space. Dynamic viewport units
keep the ending compact on desktop, tablet, and mobile.

At the end of page scrolling, vertical wheel or touch gestures anywhere on the
screen move only the link window. Scrolling up from Home returns to the page.
The gallery toolbar is fully hidden while this final screen is active.

The document does not use vertical scroll snapping: it must not jump to the
footer on load or after favorite cards reorder. An early head script starts
fresh navigation and reloads at the top, while leaving back/forward navigation
and deliberate URL anchors to native restoration.
