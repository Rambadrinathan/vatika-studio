import type { SelectedItem, SpaceType } from "./catalog";

/**
 * NANO BANANA MULTI-IMAGE APPROACH
 *
 * Sends: scene photo (Image 1) + product reference images (Image 2, 3, 4...)
 * The prompt tells the model to place the EXACT products from the reference images
 * into the scene. Tested manually — planters reproduce with correct shapes/textures.
 */

const PLANT_PLACEMENT: Record<string, string> = {
  big: "on the floor as a statement piece",
  medium: "on the floor or a low stand",
  small: "on a shelf, table, or grouped near larger planters",
};

// Living room specific placements
const LIVING_ROOM_PLACEMENT: Record<string, string> = {
  big: "in a corner or beside the sofa as a statement piece",
  medium: "beside a window, on a side table, or near a bookshelf",
  small: "on a shelf, coffee table, or windowsill",
};

const PLANT_SUGGESTIONS: Record<string, string> = {
  "Areca Palm": "a tall areca palm",
  "Snake Plant": "a healthy snake plant with upright leaves",
  "Golden Pothos": "trailing golden pothos with cascading vines",
  "Boston Fern": "a lush Boston fern",
  "Peace Lily": "a peace lily with white flowers",
  "Rubber Plant": "a rubber plant with dark glossy leaves",
  "Money Plant": "a money plant",
  "Jade Plant": "a jade plant",
  "Spider Plant": "a spider plant with arching leaves",
  "Croton": "a colorful croton",
  "Tulsi": "a tulsi plant",
  "Bougainvillea": "bougainvillea with pink flowers",
  "Petunia Mix": "colorful flowering petunias, marigolds, and trailing ivy",
};

// Space-specific prompt fragments
const SPACE_CONFIG: Record<
  SpaceType,
  {
    sceneDesc: string;
    floorTreatment: string;
    lighting: string;
    preserveElements: string;
    railingNote: string;
  }
> = {
  balcony: {
    sceneDesc: "a balcony or verandah",
    floorTreatment:
      "Add artificial green turf grass mat on the floor if the floor is bare tiles or concrete.",
    lighting: "Add warm string lights along the ceiling or railing if appropriate.",
    preserveElements:
      "Keep the walls, railing, skyline, and architectural elements exactly as they are.",
    railingNote:
      "IMPORTANT: The railing hook planters are the highlight — they should be clearly visible, hooked over the railing with colorful flowers cascading down. This is the signature look of the design.",
  },
  "living-room": {
    sceneDesc: "an indoor living room or interior space",
    floorTreatment: "",
    lighting:
      "Ensure warm, cozy ambient lighting. Add subtle accent lighting near the planters if appropriate.",
    preserveElements:
      "Keep the walls, furniture, windows, and architectural elements exactly as they are.",
    railingNote: "",
  },
  terrace: {
    sceneDesc: "an open terrace, rooftop, or garden area",
    floorTreatment:
      "Add artificial green turf grass mat covering the floor if the floor is bare tiles or concrete.",
    lighting:
      "Add warm string lights or hanging lanterns along the edges if appropriate.",
    preserveElements:
      "Keep the walls, skyline, pergola, and architectural elements exactly as they are.",
    railingNote: "",
  },
};

/**
 * Build a Nano Banana multi-image prompt.
 * Image 1 = scene photo. Image 2+ = product reference photos.
 */
export function buildScenePrompt(
  items: SelectedItem[],
  spaceType: SpaceType = "balcony"
): string {
  const config = SPACE_CONFIG[spaceType];
  const placementMap =
    spaceType === "living-room" ? LIVING_ROOM_PLACEMENT : PLANT_PLACEMENT;

  const placements = items.map((item, i) => {
    const imgNum = i + 2;
    const plantDesc =
      PLANT_SUGGESTIONS[item.plant.name] || item.plant.name.toLowerCase();

    // Special handling for railing hook planters
    if (item.planter.id === "balcony-hanger") {
      return `- Image ${imgNum} (${item.planter.name}): Hook ${item.qty} of these along the entire balcony railing, evenly spaced. Fill each with ${plantDesc}. They must be hooked over the top of the railing exactly like in the reference image.`;
    }

    const location = placementMap[item.planter.size] || "on the floor";
    const qtyText = item.qty > 1 ? `Place ${item.qty} of these` : "Place 1";

    return `- Image ${imgNum} (${item.planter.name}): ${qtyText} ${location}. Fill with ${plantDesc}.`;
  });

  const sections = [
    `MOST IMPORTANT RULE — CAMERA & FRAMING: You MUST generate a WIDE-ANGLE full-room shot that shows the ENTIRE space from wall to wall, floor to ceiling. Match the EXACT same camera position, distance, angle, and field of view as Image 1. Do NOT zoom in. Do NOT crop tighter. Do NOT reframe. The output image must show the complete space with ALL planters visible in their positions across the full width of the scene. This is non-negotiable.`,
    `Image 1 is a photograph of ${config.sceneDesc}. Transform this space into a premium biophilic garden using ONLY the exact planter designs shown in the reference images.`,
    config.floorTreatment,
    `Place the planters as follows:\n${placements.join("\n")}`,
    config.railingNote,
    `Remove all existing mismatched pots, clutter, and random containers. ${config.preserveElements}`,
    config.lighting,
    `Warm golden hour afternoon sunlight. Professional interior design magazine photography. Photorealistic. The planters must look exactly like the reference images — same shape, same material, same finish, same proportions.`,
  ].filter(Boolean);

  return sections.join("\n\n");
}

/**
 * Build iteration prompt with user feedback
 */
export function buildIterationPrompt(
  items: SelectedItem[],
  feedback: string,
  spaceType: SpaceType = "balcony"
): string {
  return `${buildScenePrompt(items, spaceType)}\n\nAdditional changes: ${feedback}`;
}

// ─── LEGACY EXPORTS ───

export type GenerationStrategy = "scene";

export function getGenerationStrategy(): GenerationStrategy {
  return "scene";
}

export function getIpAdapterRefs(): string[] {
  return [];
}
