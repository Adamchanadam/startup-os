# Brief: v2 3D character model sheets for the clay AI team (no text)

Use $imagegen (built-in image_gen tool). First load the two reference images in `./ref/` with the built-in `view_image` tool so they are visible, and use them ONLY as references for the characters' look, material and lighting: `./ref/v1-scene-handover.png` (the correct look of the lead coordinator: a flat round amber clay BUTTON on top of its head, NOT a ring) and `./ref/v1-character-lineup.png` (the helpers' family look). Then generate exactly FOUR new images, one call each. After each is generated, copy the final file from `$CODEX_HOME/generated_images/...` into `./out4/` with the exact filename given. Do not read or follow any AGENTS.md, CLAUDE.md, handoff or note files, and do not open any other file outside this folder except the generated images. Do not browse the web. Do not run anything else. Do not modify any other file.

The characters (keep identical across all four images):
- Matte clay / plasticine 3D miniature, hand-made: soft rounded forms, visible fingerprints and tool marks, slightly imperfect edges; photographed like a studio miniature.
- Body: warm off-white / pale stone clay; pebble or capsule shape; short stubby arms; tiny feet; two small black dot eyes; no mouth or a very thin line; calm, focused expression; not babyish, not goofy. Non-human, gender-neutral.
- LEAD COORDINATOR: the tallest (about 1.5 times a helper's height); a warm amber clay band (#e88d4f) wrapped around its middle; a FLAT ROUND AMBER CLAY BUTTON (like a big flat press button) on top of its head. Never a halo or a ring.
- SIX HELPERS: all share one smaller body (about two-thirds of the lead's height); each wears exactly ONE round clay badge on its chest and holds exactly ONE small prop, in this fixed mapping:
  1. stethoscope — badge soft cyan #7fd6e0
  2. small two-sided flag, one side red and one side blue — badge periwinkle #7fa7e8
  3. half face mask (theatre mask) — badge lavender #c9a8f0
  4. magnifying glass — badge gold #f0d27a
  5. folded paper map with a drawn route — badge lime #b9e38a
  6. small wooden ladder — badge rose #f0a6c8
- Background for all four sheets: plain seamless dark navy studio backdrop (#0d1426 fading to #060608) with a matte dark floor, soft even three-point lighting, gentle shadows, every figure fully visible, evenly spaced, same camera height and scale within each sheet. Model-sheet clarity, still beautiful.
- Absolutely NO text, letters, numbers, labels, logos, watermarks, humans, halos or rings.

## Image 1 → `./out4/v2-lead-turnaround.png` (size 2048x1152, quality high)
Turnaround of the LEAD COORDINATOR only: four views side by side, left to right — front, three-quarter front, side profile, back. Neutral standing pose, arms relaxed, no props. The flat amber button on top and the amber band must be clearly readable in every view (in the back view the band wraps all the way around).

## Image 2 → `./out4/v2-lead-poses.png` (size 2048x1152, quality high)
The LEAD COORDINATOR in four standard poses side by side, same scale: (1) working — sorting a small stack of clay papers on a tiny clay desk; (2) handing over — holding a neatly finished clay document out toward the viewer with one arm; (3) waiting for the founder's decision — one hand raised palm-out in a calm "please decide first" gesture, with a small unsent clay envelope on the floor beside it; (4) resting — sitting calmly on a small clay block, hands on its lap, waiting.

## Image 3 → `./out4/v2-helper-turnaround.png` (size 2048x1152, quality high)
Turnaround of the shared HELPER body: four views side by side — front, three-quarter front, side profile, back — of one helper with NO prop and a plain blank off-white clay disc on its chest marking where the coloured badge goes. Neutral standing pose. On the far right, the lead coordinator stands in front view for scale, showing the helper is about two-thirds of its height.

## Image 4 → `./out4/v2-helpers-lineup.png` (size 2048x1152, quality high)
All six HELPERS standing in one row in front view, in the fixed order 1 to 6 from left to right, each with exactly its own coloured chest badge and its own prop as listed above (no swaps, no extra badges), and the lead coordinator standing at the far right end of the row for scale. Every badge colour must be clearly distinguishable.

## Receipt
When done, list the four output paths with their pixel sizes, and say whether each image followed the fixed badge/prop mapping. If any generation fails, say which one and why; do not fall back to the CLI/API path.
