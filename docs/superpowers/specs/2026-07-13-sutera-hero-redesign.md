# NYXO Sutera-mechanics Hero design

## Goal

Replace only the current NYXO Hero with a spatial gaming workstation that transfers the first-screen mechanics of Sutera without copying its content, object, color system, or typography.

## Approved direction

The user's brief is the approval for this single direction. The Hero uses a four-column by three-row coordinate field, a large top-left title, a crossed two-item composition occupying the center-right field, peripheral real-data annotations, segmented connector lines, small markers, and one clipped system window. It remains recognizably NYXO through the plum-black palette, acid orange activity, toxic-yellow signal, Alumni Sans, Golos Text, and marketplace data.

## Central composition

- Use the supplied M4A1-S rifle and M9 bayonet PNGs with their native transparency.
- Cross the rifle and knife into one composition. Do not animate either as an independent orbit.
- The group performs a restrained 12-16 second yoyo drift with less than 4 degrees of rotation and less than 12 pixels of vertical travel. There is no continuous 360-degree rotation.
- Pointer movement adds at most 3 degrees of perspective tilt. Pointer exit returns the group to neutral.
- Hovering either item raises it slightly and activates its corresponding data annotation.

## Spatial system

- Coordinate field: vertical lines at 25%, 50%, and 75%; horizontal lines at 33.333% and 66.666%; small cross marks at intersections.
- Title and introductory copy occupy the upper-left field.
- The crossed composition occupies the center and right-middle fields and can overlap grid lines.
- Four annotations sit around the composition. Their lines use orthogonal or single-elbow geometry, not HUD reticles.
- A compact system window at the right carries the combined comparison and total value.
- All displayed values are meaningful marketplace data: game, item name, rarity, condition, collection, float, and price.

## Entry sequence

1. The coordinate field appears at low contrast.
2. The central composition resolves from a clipped, slightly smaller state.
3. Annotation markers blink briefly.
4. Connector segments draw from item toward label.
5. Panels reveal by clip-path; text appears without permanent scrambling.
6. Header and CTA remain stable while the sequence runs.

The sequence lasts roughly 1.5 seconds and does not loop. Only the restrained central drift continues.

## Responsive behavior

- Desktop: full Sutera-like spatial field with all connector geometry.
- Tablet: preserve central composition and two primary annotations; system cards move to the lower band.
- Mobile: title, object composition, and compact data modules form a vertical workstation. Decorative long connector segments are suppressed, but terminal markers and real-data relationships remain.
- No horizontal overflow at 320 pixels.

## Accessibility and performance

- Both item images have descriptive Russian alt text.
- Hover states have focus-equivalent behavior where an interactive control exists.
- `prefers-reduced-motion` disables entry motion, idle drift, and pointer tilt.
- Use React, CSS transforms, SVG, and the existing stack only. No animation dependency and no WebGL requirement.

## Scope

Only `Hero`, its tests, Hero-specific styles, and two supplied image assets change. The remaining landing sections are not redesigned in this task.
