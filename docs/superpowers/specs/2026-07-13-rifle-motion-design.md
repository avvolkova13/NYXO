# NYXO Rifle Motion — Sutéra cadence

## Objective

Replace the current slow, layered rifle movement with the motion grammar used by Sutéra's Lab hero while keeping the NYXO rifle as a real-time 3D object. The rifle must remain fully visible at every angle and rotate with a deliberate, frame-authored cadence.

## Reference behavior

The Sutéra Lab hero uses a 111-frame image sequence. Its playback duration is calculated as `(111 - 10) / 24`, approximately 4.208 seconds, with frame snapping and linear timing. The camera and object center remain fixed. The motion does not add autonomous bobbing, pointer tilt, or hover scale.

## NYXO motion model

- One complete vertical-axis revolution lasts 4.208 seconds.
- Rotation is quantized to 111 visual phases to preserve the reference's frame-authored cadence.
- Timing is linear and the loop seam maps the final phase back to the first matching pose.
- The rifle keeps a fixed X and Z rotation throughout the loop.
- Autonomous vertical movement is removed.
- Pointer movement no longer tilts or translates the rifle.
- Hover and locked inspection do not scale the 3D rig.
- The existing click inspection pulse remains because it does not alter the rotation path.
- Reduced-motion mode shows one stable three-quarter pose.

## Safe framing

- The WebGL surface uses the full available object stage instead of the current 920 px maximum.
- Camera distance is calculated after both the rifle mesh and suppressor are present.
- The fit calculation samples the complete revolution and solves the minimum perspective-camera distance needed to keep every sampled bounding-box corner inside both horizontal and vertical frustums.
- A 12% visual safety margin is added after fitting.
- The fit is recalculated when the canvas aspect ratio changes.
- No model part may touch the WebGL surface boundary in any phase.

## Runtime behavior

- Rendering remains paused when the Hero is not visible.
- The loop uses the existing `requestAnimationFrame` renderer but only changes the visual phase when the reference-equivalent phase index changes.
- Lighting stays in world space so the rotating finish produces meaningful reflections.
- Loading fallback and WebGL handoff remain unchanged.

## Testing

- A pure motion helper exposes the 4.208-second duration, 111 phases, and deterministic phase-to-angle conversion.
- Tests verify the initial pose, half-turn, loop seam, and reduced-motion pose.
- Existing Hero interaction and marketplace tests must continue to pass.
- Desktop visual QA must inspect at least four quarter-cycle phases and confirm no clipping.
- Narrow-screen QA must confirm the model stays inside its scene.

## Non-goals

- No pre-rendered rifle image sequence.
- No new 3D model or texture redesign.
- No manual drag rotation in this pass.
- No changes to Hero composition, typography, callouts, or marketplace data.
