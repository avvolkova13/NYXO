# NYXO Hero — spatial scan hover design

## Goal

Add a restrained interactive scan layer to the central Hero inspection zone. The behavior should echo the spatial responsiveness of Sutera without copying its imagery, palette, content, or exact composition.

## Approved direction

The interaction activates across the central inspection zone rather than requiring the pointer to land precisely on the rifle. It becomes slightly more pronounced near the rifle and settles completely after the pointer leaves the zone.

## Translucent scan cells

- Render three to five square cells around the local pointer position and the visible rifle area.
- Cells use the existing NYXO plum/black environment with low-opacity paper and orange edge light; they must not become bright white panels.
- Each cell has a distinct size and a short lifetime. Cells appear in a stagger, hold briefly, then disappear in stepped opacity changes.
- Positions are bounded to the central inspection zone so cells never cover the headline, primary action, price window, or index panel.
- The behavior is deterministic enough to avoid visual noise: a small fixed set of cell positions is selected from the pointer quadrant rather than generating unrestricted random coordinates.
- Cells do not intercept pointer events and carry no content.

## Moving line shelves

- Existing SVG callout lines remain connected to their current information panels and markers.
- On entry into the central inspection zone, the horizontal line segments extend or retract by a small distance while elbow segments make a compensating movement.
- Markers shift with their connected line endpoints; they never detach or float independently.
- The four callouts respond with short staggered delays, creating a coordinated calibration rather than simultaneous mechanical motion.
- On pointer movement, line positions receive only a small directional bias. They do not continuously chase the cursor.
- On exit, all lines return smoothly to their original geometry.

## Interaction states

1. **Idle:** cells are absent; lines retain the current geometry and entrance animation.
2. **Zone active:** scan cells begin their staggered cycle and line shelves calibrate once.
3. **Rifle proximity:** cells gain a small amount of contrast and the existing rifle inspection response remains active.
4. **Zone exit:** cells complete their current fade and line shelves return to idle geometry.
5. **Inspection locked:** the scan cycle repeats at a slower cadence while the locked inspection state remains active.

## Motion character

- Cell appearance: approximately 140–220 ms per cell, using stepped opacity rather than smooth floating.
- Cell hold: approximately 180–320 ms.
- Cell exit: approximately 220–360 ms with a short stagger.
- Line calibration: approximately 520–720 ms with the existing NYXO easing.
- No continuous high-frequency flicker, glitch tearing, RGB separation, particles, or random jitter.
- Transform and opacity are preferred for animation; SVG path geometry may be driven through grouped transforms to avoid expensive layout work.

## Responsive and accessibility behavior

- Fine pointer devices receive cursor-positioned scan cells and directional line bias.
- Coarse pointer devices receive a quiet periodic scan pulse centered on the rifle; no touch-following effect is required.
- `prefers-reduced-motion: reduce` disables positional movement and staggered cycling, leaving only a brief opacity change on interaction.
- Decorative cells are hidden from assistive technologies.
- Existing keyboard inspection controls and focus states remain unchanged.

## Component boundaries

- A dedicated decorative scan-cell layer lives inside the existing Hero workstation.
- The Hero component owns zone activity and pointer coordinates because it already manages those values.
- Existing callout SVGs gain shared state hooks for their shelf transforms; marketplace data and accessible labels remain untouched.
- No new animation dependency is introduced.

## Testing

- Component test verifies that the decorative scan layer and its fixed cell set render.
- Component test verifies zone-active state changes when pointer enters and leaves the inspection zone.
- Existing rifle hover, inspection lock, data, catalogue action, and thumbnail tests remain green.
- Browser verification covers desktop fine-pointer behavior, mobile fallback, reduced-motion behavior, and confirms that cells do not overlap primary UI panels.

## Out of scope

- Reworking the rifle model or its rotation.
- Changing Hero layout, typography, copy, palette, information architecture, or panel content.
- Adding particles, glitch effects, HUD reticles, audio, or new product interactions.
