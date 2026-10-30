# Brief: v2.2 character model sheets — strong hand-made clay texture, correct side views (no text)

Use $imagegen (built-in image_gen tool). First load these reference images with the built-in `view_image` tool: `./ref/v2-1-lead-turnaround.png`, `./ref/v2-1-lead-poses.png`, `./ref/v2-1-helper-turnaround.png`, `./ref/v2-1-helpers-lineup.png`. Use them ONLY to keep the same characters, shapes, proportions, colours, props, poses, layout and lighting. IGNORE their surface: their clay looks too smooth. Then generate exactly FOUR new images, one call each, each a corrected version of the matching reference. After each is generated, copy the final file from `$CODEX_HOME/generated_images/...` into `./out6/` with the exact filename given. Do not read or follow any AGENTS.md, CLAUDE.md, handoff or note files, and do not open any other file outside this folder except the generated images. Do not browse the web. Do not run anything else. Do not modify any other file.

## The most important change: strong hand-made clay texture (all four images)
The founder wants the clay to clearly feel hand-pressed and rough, like puppets from a stop-motion claymation film photographed up close:
- clearly visible fingerprint ridges (fine concentric whorl lines) pressed into the clay on the heads, bellies and backs — several prints per figure, readable at normal viewing size;
- thumb-press dents and small uneven lumps; the body surface is not a smooth egg;
- sculpting-tool drag marks and small scrapes; seams where the arms and feet were pressed onto the body, slightly smeared;
- a dry, matte, grainy surface with tiny pores, a few hairline cracks, and slightly ragged edges on the amber band and the amber button;
- a few tiny crumbs of clay on the floor near the feet.
Keep silhouettes clean and recognisable; keep the characters cute-but-composed.

## Keep unchanged
Warm off-white / pale stone clay body; two small black dot eyes; no mouth; stubby arms; tiny feet; the lead's amber band (#e88d4f) and FLAT ROUND AMBER BUTTON on top of its head (never a ring or halo); helpers about two-thirds of the lead's height; plain seamless dark navy backdrop (#0d1426 to #060608), matte dark floor, soft even lighting; same layout and spacing. No text, letters, numbers, labels, logos, humans or halos.

## Image 1 → `./out6/v2-2-lead-turnaround.png` (size 2048x1152, quality high)
Lead coordinator: front, three-quarter front, exact side profile, back. SIDE PROFILE RULES: an exact 90-degree side view; only the near eye is visible as one dot close to the front edge of the head, the far eye is completely hidden; the near arm is a short rounded stub hanging straight down, pressed flat against the side of the body with its tip pointing to the floor — it must NOT stick out forward or sideways. The amber band wraps fully around in every view.

## Image 2 → `./out6/v2-2-lead-poses.png` (size 2048x1152, quality high)
Lead coordinator, same four poses as the reference: working at the tiny desk sorting papers; handing a finished document toward the viewer; one hand raised palm-out "please decide first" with the small unsent envelope beside it; sitting calmly on a small clay block waiting.

## Image 3 → `./out6/v2-2-helper-turnaround.png` (size 2048x1152, quality high)
One helper with a blank off-white clay chest badge and no prop: front, three-quarter front, exact side profile, back; plus the lead in front view on the far right for scale. SIDE PROFILE RULES: exact 90-degree side view; only ONE eye visible (the far eye completely hidden, not even an edge); the chest badge seen edge-on as a thin disc; the near arm hangs straight down against the body.

## Image 4 → `./out6/v2-2-helpers-lineup.png` (size 2048x1152, quality high)
Six helpers in the fixed order and mapping, front view: (1) stethoscope + soft cyan badge #7fd6e0; (2) small two-sided flag, red on one side and blue on the other + periwinkle badge #7fa7e8; (3) half mask (masquerade-style, covers only the upper half of a face, eye holes, no mouth part) + lavender badge #c9a8f0; (4) magnifying glass + gold badge #f0d27a; (5) folded route map + lime badge #b9e38a; (6) small wooden ladder + rose badge #f0a6c8; the lead coordinator at the far right for scale.

## Receipt
When done, list the four output paths with their pixel sizes and, for each image, say honestly whether (a) fingerprint ridges are clearly visible, (b) the side views show one eye only, (c) the lead's side arm hangs down. If any generation fails, say which one and why; do not fall back to the CLI/API path.
