// Unified product catalog — KarmYog proprietary (LoRA-trained) + Ugaoo marketplace planters
// KarmYog: LoRA trigger words for AI generation (highest fidelity)
// Ugaoo: IP-Adapter reference images at inference time (no retraining needed)

export type PlanterSource = "karmyog" | "ugaoo";
export type PlanterSize = "small" | "medium" | "big";

export interface Planter {
  id: string;
  name: string;
  image: string;        // path in /public/planters/
  price: number;        // MRP / Target ASP
  size: PlanterSize;
  promptDesc: string;   // text description for AI prompt
  source: PlanterSource;
  category?: string;    // e.g. "Ceramic", "Metal", "3D Printed"
  material?: string;    // e.g. "ceramic", "metal", "cotton", "wood"
  color?: string;       // primary color/finish
}

export interface Plant {
  id: string;
  name: string;
  price: number;
}

// ─── KARMYOG PROPRIETARY PLANTERS (LoRA-trained, trigger word generation) ───

const KARMYOG_PLANTERS: Planter[] = [
  { id: "chevron", name: "Chevron", image: "/planters/chevron.png", price: 7500, size: "big", promptDesc: "a large egg-shaped matte grey fiberglass floor planter", source: "karmyog", category: "Fiberglass", material: "fiberglass", color: "grey" },
  { id: "willow", name: "Willow", image: "/planters/willow.png", price: 7500, size: "big", promptDesc: "a tall smooth rounded matte floor planter", source: "karmyog", category: "Fiberglass", material: "fiberglass", color: "grey" },
  { id: "allegra", name: "Allegra", image: "/planters/allegra.png", price: 7500, size: "big", promptDesc: "a tall marble-finish floor planter with copper veining", source: "karmyog", category: "Fiberglass", material: "fiberglass", color: "marble" },
  { id: "amalfi", name: "Amalfi", image: "/planters/amalfi.png", price: 7500, size: "big", promptDesc: "a dark grey urn-shaped floor planter", source: "karmyog", category: "Fiberglass", material: "fiberglass", color: "dark grey" },
  { id: "quebec-rect", name: "Quebec Rectangle", image: "/planters/quebec-rectangle.png", price: 7500, size: "big", promptDesc: "a grey rectangular concrete-look planter box", source: "karmyog", category: "Concrete", material: "concrete-look", color: "grey" },
  { id: "quebec-sq", name: "Quebec Square", image: "/planters/quebec-square.png", price: 7500, size: "big", promptDesc: "a grey cube-shaped concrete-look planter", source: "karmyog", category: "Concrete", material: "concrete-look", color: "grey" },
  { id: "go-hooked", name: "GoHooked Rectangular", image: "/planters/go-hooked-recta.png", price: 7500, size: "big", promptDesc: "a dark rectangular planter box with flowering plants", source: "karmyog", category: "Fiberglass", material: "fiberglass", color: "dark" },
  { id: "pine-skirting", name: "Pine Skirting Module", image: "/planters/pine-skirting.jpeg", price: 7500, size: "big", promptDesc: "a wooden wall-base skirting panel with integrated planter boxes and warm hanging lantern lights", source: "karmyog", category: "Wood", material: "pine wood", color: "natural wood" },
  { id: "tokyo-tall", name: "Tokyo Tall", image: "/planters/tokyo-tall.png", price: 4000, size: "medium", promptDesc: "a tall ribbed cylindrical grey planter", source: "karmyog", category: "Lightweight", material: "lightweight composite", color: "grey" },
  { id: "azziano", name: "Azziano", image: "/planters/azziano.png", price: 4000, size: "medium", promptDesc: "a textured dark green round planter with swirl pattern", source: "karmyog", category: "Ceramic", material: "ceramic", color: "dark green" },
  { id: "fox-bowl", name: "Fox Bowl", image: "/planters/fox-bowl.png", price: 4000, size: "medium", promptDesc: "a dark grey low wide bowl planter", source: "karmyog", category: "Fiberglass", material: "fiberglass", color: "dark grey" },
  { id: "ribbed-set", name: "Ribbed Planter", image: "/planters/ribbed-set.png", price: 4000, size: "medium", promptDesc: "a ribbed cylindrical tan/brown planter with vertical grooves", source: "karmyog", category: "Ceramic", material: "ceramic", color: "tan" },
  { id: "wrought-iron", name: "Wrought Iron Stand", image: "/planters/wrought-iron-stand.jpeg", price: 4000, size: "medium", promptDesc: "a black wrought iron plant stand with a small wooden shelter roof", source: "karmyog", category: "Metal", material: "wrought iron", color: "black" },
  { id: "b2-fabric", name: "B2 Fabric Box", image: "/planters/b2-fabric.jpg", price: 1500, size: "small", promptDesc: "a modular wooden planter box with green fabric grass mat top", source: "karmyog", category: "Wood", material: "wood + fabric", color: "green" },
  { id: "balcony-hanger", name: "Balcony Hanger", image: "/planters/balcony-hanger.jpeg", price: 1500, size: "small", promptDesc: "a small metal hook planter clipped onto the railing", source: "karmyog", category: "Metal", material: "metal", color: "black" },
];

// ─── UGAOO MARKETPLACE PLANTERS (IP-Adapter reference image generation) ───

const UGAOO_PLANTERS: Planter[] = [
  // 3D Printed Pots
  { id: "ug-crown", name: "Crown Planter", image: "/planters/ugaoo/Crown Planter_649_3D Printed.jpg", price: 649, size: "small", promptDesc: "a small 3D printed crown-shaped pot with geometric ridges", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "terracotta" },
  { id: "ug-erika", name: "Erika Planter", image: "/planters/ugaoo/Erika Planter_849_3D Printed.jpg", price: 849, size: "small", promptDesc: "a small 3D printed planter with layered wave texture", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "beige" },
  { id: "ug-faceted-3d", name: "Faceted Prism Pot", image: "/planters/ugaoo/Faceted prism Pot_1499_3D Printed.jpg", price: 1499, size: "small", promptDesc: "a geometric faceted prism-shaped 3D printed pot with diamond pattern", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "beige" },
  { id: "ug-imperia", name: "Imperia Planter", image: "/planters/ugaoo/Imperia Planter_1199_3D Printed.jpg", price: 1199, size: "small", promptDesc: "a 3D printed planter with interlocking geometric surface pattern", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "white" },
  { id: "ug-interlace-3d", name: "Interlace Charm Pot", image: "/planters/ugaoo/Interlace Charm Pot_1499_3D Printed.jpg", price: 1499, size: "small", promptDesc: "a 3D printed pot with interlaced woven-look surface texture", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "white" },
  { id: "ug-oblique-3d", name: "Oblique Elegance Pot", image: "/planters/ugaoo/Oblique Elegance Pot_1499_3D Printed.jpg", price: 1499, size: "small", promptDesc: "a 3D printed pot with diagonal oblique ridge pattern", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "grey" },
  { id: "ug-ridged-3d", name: "Ridged Waves Pot", image: "/planters/ugaoo/Ridged Waves Pot_1499_3D Printed.jpg", price: 1499, size: "small", promptDesc: "a 3D printed pot with horizontal ridged wave texture", source: "ugaoo", category: "3D Printed", material: "3D printed PLA", color: "beige" },

  // Basket Planters
  { id: "ug-belly-dance", name: "Belly Dance Cotton", image: "/planters/ugaoo/Belly Dance Cotton Planter_1499_Cotton.jpg", price: 1499, size: "medium", promptDesc: "a woven cotton basket planter with belly dance pattern and tassels", source: "ugaoo", category: "Basket", material: "cotton", color: "natural" },
  { id: "ug-ex-cotton", name: "Ex Cotton Planter", image: "/planters/ugaoo/Ex Cotton Planter_999_Cotton.jpg", price: 999, size: "small", promptDesc: "a simple woven cotton basket planter", source: "ugaoo", category: "Basket", material: "cotton", color: "natural" },
  { id: "ug-rays-cotton", name: "Rays Cotton Planter", image: "/planters/ugaoo/Rays Cotton Planter_1299_Cotton.jpg", price: 1299, size: "medium", promptDesc: "a woven cotton basket planter with radiating ray pattern", source: "ugaoo", category: "Basket", material: "cotton", color: "natural" },
  { id: "ug-seagrass", name: "Seagrass Planter", image: "/planters/ugaoo/Seagrass Planter_1299_Seagrass.jpg", price: 1299, size: "medium", promptDesc: "a natural seagrass woven basket planter", source: "ugaoo", category: "Basket", material: "seagrass", color: "natural" },
  { id: "ug-skyie", name: "Skyie Cotton Planter", image: "/planters/ugaoo/Skyie Cotton Planter_1299_Cotton.jpg", price: 1299, size: "medium", promptDesc: "a woven cotton basket planter with sky blue accent pattern", source: "ugaoo", category: "Basket", material: "cotton", color: "blue + natural" },
  { id: "ug-square-cane", name: "Square Cane Planter", image: "/planters/ugaoo/Square Cane Planter_999_Cane.jpg", price: 999, size: "small", promptDesc: "a square-shaped woven cane basket planter", source: "ugaoo", category: "Basket", material: "cane", color: "natural" },
  { id: "ug-tassel", name: "Tassel Cotton Planter", image: "/planters/ugaoo/Tassel Cotton Planter_1499_Cotton.jpg", price: 1499, size: "medium", promptDesc: "a cotton basket planter with decorative tassels", source: "ugaoo", category: "Basket", material: "cotton", color: "natural" },
  { id: "ug-trinket", name: "Trinket Cotton Planter", image: "/planters/ugaoo/Trinket Cotton Planter_999_Cotton.jpg", price: 999, size: "small", promptDesc: "a small woven cotton trinket basket planter", source: "ugaoo", category: "Basket", material: "cotton", color: "natural" },

  // Ceramic Planters
  { id: "ug-aurelius-prism", name: "Aurelius Prism Ceramic", image: "/planters/ugaoo/Aurelius Prism Ceramic Pot_999_Glossy.jpg", price: 999, size: "small", promptDesc: "a glossy ceramic pot with geometric prism facets and metallic gold rim", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "beige + gold" },
  { id: "ug-aurelius-round", name: "Aurelius Round Ceramic", image: "/planters/ugaoo/Aurelius Round Ceramic Pot_999_Glossy.jpg", price: 999, size: "small", promptDesc: "a glossy round ceramic pot with vertical ribbed texture and gold rim", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "beige + gold" },
  { id: "ug-fleeting-bliss", name: "Fleeting Bliss Ceramic", image: "/planters/ugaoo/Fleeting Bliss Ceramic Planter_5349_Glossy.jpg", price: 5349, size: "big", promptDesc: "a large premium glossy ceramic planter with artistic flowing pattern", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "white + blue" },
  { id: "ug-sunflower", name: "Sunflower Ceramic", image: "/planters/ugaoo/Flower Sunflower Ceramic Planter_3999_Glossy.jpg", price: 3999, size: "medium", promptDesc: "a glossy ceramic planter with embossed sunflower design", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "yellow + green" },
  { id: "ug-fluted", name: "Fluted Ceramic Pot", image: "/planters/ugaoo/Fluted ceramic pot 5 inch_999_Glossy.jpg", price: 999, size: "small", promptDesc: "a small glossy fluted ceramic pot with vertical grooves", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "white" },
  { id: "ug-grail", name: "Grail Ceramic Pot", image: "/planters/ugaoo/Grail Ceramic Pot_799_Glossy.jpg", price: 799, size: "small", promptDesc: "a small glossy ceramic grail-shaped pot", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "white" },
  { id: "ug-peacock", name: "Peacock Ceramic Pot", image: "/planters/ugaoo/Peacock ceramic pot 5 inch_799_Glossy.jpg", price: 799, size: "small", promptDesc: "a small ceramic pot with peacock feather design", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "blue + green" },
  { id: "ug-phoenix", name: "Phoenix Ceramic", image: "/planters/ugaoo/Phoenix ceramic Planter_2699_Glossy.jpg", price: 2699, size: "medium", promptDesc: "a medium glossy ceramic planter with phoenix motif", source: "ugaoo", category: "Ceramic", material: "ceramic", color: "multi" },

  // Hanging Planters
  { id: "ug-cosmic-hang", name: "Cosmic Stone Hanging", image: "/planters/ugaoo/Ceramic Hanging Pot Cosmic Stone_1449_Ceramic.jpg", price: 1449, size: "small", promptDesc: "a ceramic hanging pot with cosmic stone speckled finish", source: "ugaoo", category: "Hanging", material: "ceramic", color: "grey speckle" },
  { id: "ug-petrichor", name: "Petrichor Smite Hanging", image: "/planters/ugaoo/Hanging Ceramic Planters Petrichor Smite_1999_Ceramic.jpg", price: 1999, size: "medium", promptDesc: "a ceramic hanging planter with rustic petrichor-style glaze finish", source: "ugaoo", category: "Hanging", material: "ceramic", color: "brown" },
  { id: "ug-macrame-1", name: "Macrame Single Hanger", image: "/planters/ugaoo/Macrame Single Layer Hanger_599_Macrame.jpg", price: 599, size: "small", promptDesc: "a single-layer macrame rope plant hanger", source: "ugaoo", category: "Hanging", material: "macrame rope", color: "white" },
  { id: "ug-macrame-3", name: "Macrame Three Layer Hanger", image: "/planters/ugaoo/Macrame Three Layer Hanger_699_Macrame.jpg", price: 699, size: "medium", promptDesc: "a three-tier macrame rope plant hanger with multiple pot holders", source: "ugaoo", category: "Hanging", material: "macrame rope", color: "white" },
  { id: "ug-macrame-2", name: "Macrame Two Layer Hanger", image: "/planters/ugaoo/Macrame Two Layer Hanger_599_Macrame.jpg", price: 599, size: "small", promptDesc: "a two-tier macrame rope plant hanger", source: "ugaoo", category: "Hanging", material: "macrame rope", color: "white" },

  // Metal Planters
  { id: "ug-aurelian", name: "Aurelian Cylindrical", image: "/planters/ugaoo/Aurelian Cylindrical Planter_2999_Metal.jpg", price: 2999, size: "medium", promptDesc: "a cylindrical metal planter with brushed antique brass finish", source: "ugaoo", category: "Metal", material: "metal", color: "brass" },
  { id: "ug-elegance", name: "Elegance Planter", image: "/planters/ugaoo/Elegance Planter_3249_Metal.jpg", price: 3249, size: "medium", promptDesc: "a tall elegant metal planter with sleek tapered shape", source: "ugaoo", category: "Metal", material: "metal", color: "black" },
  { id: "ug-golden-opulence", name: "Golden Opulence", image: "/planters/ugaoo/Golden Opulence Planter_2499_Gold.jpg", price: 2499, size: "medium", promptDesc: "a polished gold metal planter with goblet shape", source: "ugaoo", category: "Metal", material: "metal", color: "gold" },
  { id: "ug-gunmetal", name: "Gunmetal Goblet", image: "/planters/ugaoo/Gunmetal Goblet Planter_4499_Gunmetal.jpg", price: 4499, size: "big", promptDesc: "a large gunmetal grey goblet-shaped metal planter", source: "ugaoo", category: "Metal", material: "metal", color: "gunmetal" },
  { id: "ug-pastel-ridge", name: "Pastel Ridge Heritage", image: "/planters/ugaoo/Pastel Ridge Heritage Planter_4499_Pastel.jpg", price: 4499, size: "big", promptDesc: "a large heritage-style metal planter with ridged surface in pastel finish", source: "ugaoo", category: "Metal", material: "metal", color: "pastel green" },
  { id: "ug-ridgecraft", name: "RidgeCraft Cylindrical", image: "/planters/ugaoo/RidgeCraft Cylindrical Planter_3249_Metal.jpg", price: 3249, size: "medium", promptDesc: "a cylindrical metal planter with ridged craft texture", source: "ugaoo", category: "Metal", material: "metal", color: "black" },

  // Plastic / Lightweight Pots
  { id: "ug-barca-round", name: "Barca Round", image: "/planters/ugaoo/Barca Round Planter_799_Plastic.jpg", price: 799, size: "small", promptDesc: "a round plastic planter with stone-finish texture", source: "ugaoo", category: "Plastic", material: "plastic stone-finish", color: "grey stone" },
  { id: "ug-barca-square", name: "Barca Square", image: "/planters/ugaoo/Barca Square Planter_999_Plastic.jpg", price: 999, size: "small", promptDesc: "a square plastic planter with stone-finish texture", source: "ugaoo", category: "Plastic", material: "plastic stone-finish", color: "grey stone" },
  { id: "ug-milano", name: "Milano Short", image: "/planters/ugaoo/Milano Short Planter_1499_Lightweight.jpg", price: 1499, size: "medium", promptDesc: "a short wide lightweight composite planter with ribbed texture", source: "ugaoo", category: "Lightweight", material: "lightweight composite", color: "grey" },
  { id: "ug-paris", name: "Paris Planter", image: "/planters/ugaoo/Paris Planter_3499_Plastic.jpg", price: 3499, size: "big", promptDesc: "a large Paris-style premium plastic planter", source: "ugaoo", category: "Plastic", material: "premium plastic", color: "grey" },
  { id: "ug-pebble", name: "Pebble Shaped", image: "/planters/ugaoo/Pebble Shaped Planter_799_Pebble.jpg", price: 799, size: "small", promptDesc: "a rounded pebble-shaped planter with smooth organic form", source: "ugaoo", category: "Plastic", material: "plastic", color: "grey" },
  { id: "ug-tokyo-high", name: "Tokyo High", image: "/planters/ugaoo/Tokyo High Planter_4999_Lightweight.jpg", price: 4999, size: "big", promptDesc: "a tall high ribbed cylindrical lightweight planter", source: "ugaoo", category: "Lightweight", material: "lightweight composite", color: "grey" },
  { id: "ug-tokyo-round", name: "Tokyo Round", image: "/planters/ugaoo/Tokyo Round Planter_1799_Lightweight.jpg", price: 1799, size: "medium", promptDesc: "a round ribbed lightweight composite planter", source: "ugaoo", category: "Lightweight", material: "lightweight composite", color: "grey" },
  { id: "ug-tulsi", name: "Tulsi Pot", image: "/planters/ugaoo/Tulsi Pot for Home_3999_Plastic.jpg", price: 3999, size: "medium", promptDesc: "a traditional tulsi pot for home with pedestal base", source: "ugaoo", category: "Plastic", material: "premium plastic", color: "stone" },

  // Wooden Planters
  { id: "ug-faceted-wood", name: "Faceted Prism Wooden", image: "/planters/ugaoo/Faceted prism Wooden Pot_1499_Wooden.jpg", price: 1499, size: "small", promptDesc: "a geometric faceted prism-shaped wooden pot", source: "ugaoo", category: "Wooden", material: "wood", color: "natural wood" },
  { id: "ug-interlace-wood", name: "Interlace Charm Wooden", image: "/planters/ugaoo/Interlace Charm Wooden Pot_1499_Wooden.jpg", price: 1499, size: "small", promptDesc: "a wooden pot with interlaced woven-look surface", source: "ugaoo", category: "Wooden", material: "wood", color: "natural wood" },
  { id: "ug-oblique-wood", name: "Oblique Elegance Wooden", image: "/planters/ugaoo/Oblique Elegance Wooden Pot_1499_Wooden.jpg", price: 1499, size: "small", promptDesc: "a wooden pot with diagonal oblique ridge pattern", source: "ugaoo", category: "Wooden", material: "wood", color: "natural wood" },
  { id: "ug-ridged-wood", name: "Ridged Waves Wooden", image: "/planters/ugaoo/Ridged Waves Wooden Pot_1499_Wooden.jpg", price: 1499, size: "small", promptDesc: "a wooden pot with horizontal ridged wave texture", source: "ugaoo", category: "Wooden", material: "wood", color: "natural wood" },
];

// ─── UNIFIED CATALOG ───

export const PLANTERS: Planter[] = [...KARMYOG_PLANTERS, ...UGAOO_PLANTERS];

// Filter helpers
export const getKarmyogPlanters = () => PLANTERS.filter(p => p.source === "karmyog");
export const getUgaooPlanters = () => PLANTERS.filter(p => p.source === "ugaoo");
export const getPlantersByCategory = (cat: string) => PLANTERS.filter(p => p.category === cat);
export const getCategories = () => Array.from(new Set(PLANTERS.map(p => p.category).filter(Boolean)));

export function isLoRATrained(planter: Planter): boolean {
  return planter.source === "karmyog";
}

// ─── DELIVERY TIERS ───
// Longer wait = direct from manufacturer = less waste = lower price

export interface DeliveryTier {
  days: number;
  label: string;
  discount: number;   // percentage off
  multiplier: number; // price multiplier (1 - discount/100)
  description: string;
}

export const DELIVERY_TIERS: DeliveryTier[] = [
  { days: 2,  label: "Express Delivery",                   discount: 0,  multiplier: 1.00, description: "Ready stock, shipped immediately" },
  { days: 7,  label: "Standard — Direct from Supplier",    discount: 15, multiplier: 0.85, description: "Ships direct from supplier warehouse, no middlemen" },
  { days: 15, label: "Made to Order",                      discount: 20, multiplier: 0.80, description: "Freshly manufactured for your order" },
  { days: 30, label: "Factory Direct, Zero Waste",         discount: 30, multiplier: 0.70, description: "Manufactured on demand, zero inventory waste" },
  { days: 45, label: "Manufacturer Direct, Maximum Savings", discount: 50, multiplier: 0.50, description: "Direct from factory floor, maximum savings passed to you" },
];

export function getDeliveryTier(days: number): DeliveryTier {
  // Find the tier whose days value is closest (pick the one <= days, or the first)
  for (let i = DELIVERY_TIERS.length - 1; i >= 0; i--) {
    if (days >= DELIVERY_TIERS[i].days) return DELIVERY_TIERS[i];
  }
  return DELIVERY_TIERS[0];
}

/** Smooth interpolated multiplier for any day value (not stepped) */
export function getDiscountMultiplier(days: number): number {
  if (days <= DELIVERY_TIERS[0].days) return DELIVERY_TIERS[0].multiplier;
  if (days >= DELIVERY_TIERS[DELIVERY_TIERS.length - 1].days)
    return DELIVERY_TIERS[DELIVERY_TIERS.length - 1].multiplier;
  for (let i = 0; i < DELIVERY_TIERS.length - 1; i++) {
    const lo = DELIVERY_TIERS[i];
    const hi = DELIVERY_TIERS[i + 1];
    if (days >= lo.days && days <= hi.days) {
      const t = (days - lo.days) / (hi.days - lo.days);
      return lo.multiplier + t * (hi.multiplier - lo.multiplier);
    }
  }
  return 1;
}

// ─── BUDGET TIERS ───
// Each tier has COMPLETELY different planters so every budget feels like a new catalog.

export type BudgetTier = "starter" | "classic" | "premium";

const PLANTER_TIER: Record<string, BudgetTier> = {
  // ── KarmYog Starter (affordable basics) ──
  "tokyo-tall": "starter",
  "azziano": "starter",
  "b2-fabric": "starter",
  // ── KarmYog Classic (curated mid-range) ──
  "chevron": "classic",
  "fox-bowl": "classic",
  "ribbed-set": "classic",
  // ── KarmYog Premium (statement pieces) ──
  "wrought-iron": "premium",
  "allegra": "premium",
  "willow": "premium",
  "amalfi": "premium",
  "quebec-rect": "premium",
  "quebec-sq": "premium",
  "go-hooked": "premium",
  "pine-skirting": "premium",
  // ── Railing hanger (handled separately, all tiers) ──
  "balcony-hanger": "starter",
  // ── Ugaoo Starter (cheerful, woven, accessible) ──
  "ug-crown": "starter",
  "ug-erika": "starter",
  "ug-barca-round": "starter",
  "ug-barca-square": "starter",
  "ug-pebble": "starter",
  "ug-macrame-1": "starter",
  "ug-macrame-2": "starter",
  "ug-macrame-3": "starter",
  "ug-cosmic-hang": "starter",
  "ug-aurelius-prism": "starter",
  "ug-aurelius-round": "starter",
  "ug-grail": "starter",
  "ug-peacock": "starter",
  "ug-fluted": "starter",
  "ug-ex-cotton": "starter",
  "ug-square-cane": "starter",
  "ug-trinket": "starter",
  "ug-tokyo-round": "starter",
  "ug-milano": "starter",
  "ug-belly-dance": "starter",
  "ug-rays-cotton": "starter",
  "ug-seagrass": "starter",
  "ug-skyie": "starter",
  // ── Ugaoo Classic (designer, mid-range) ──
  "ug-sunflower": "classic",
  "ug-elegance": "classic",
  "ug-ridgecraft": "classic",
  "ug-aurelian": "classic",
  "ug-phoenix": "classic",
  "ug-petrichor": "classic",
  "ug-tassel": "classic",
  "ug-paris": "classic",
  "ug-faceted-3d": "classic",
  "ug-interlace-3d": "classic",
  "ug-oblique-3d": "classic",
  "ug-ridged-3d": "classic",
  "ug-faceted-wood": "classic",
  "ug-interlace-wood": "classic",
  "ug-oblique-wood": "classic",
  "ug-ridged-wood": "classic",
  "ug-imperia": "classic",
  // ── Ugaoo Premium (luxury statement pieces) ──
  "ug-fleeting-bliss": "premium",
  "ug-gunmetal": "premium",
  "ug-pastel-ridge": "premium",
  "ug-tokyo-high": "premium",
  "ug-golden-opulence": "premium",
  "ug-tulsi": "premium",
};

export function getBudgetTier(budget: number): BudgetTier {
  if (budget <= 30000) return "starter";
  if (budget <= 60000) return "classic";
  return "premium";
}

function getPlantersForTier(tier: BudgetTier): Planter[] {
  return PLANTERS.filter(
    (p) => p.id !== "balcony-hanger" && PLANTER_TIER[p.id] === tier
  );
}

// ─── PLANTS ───

export const PLANTS: Plant[] = [
  { id: "areca-palm", name: "Areca Palm", price: 800 },
  { id: "bougainvillea", name: "Bougainvillea", price: 600 },
  { id: "snake-plant", name: "Snake Plant", price: 400 },
  { id: "golden-pothos", name: "Golden Pothos", price: 250 },
  { id: "fern-boston", name: "Boston Fern", price: 300 },
  { id: "peace-lily", name: "Peace Lily", price: 350 },
  { id: "rubber-plant", name: "Rubber Plant", price: 600 },
  { id: "money-plant", name: "Money Plant", price: 200 },
  { id: "jade-plant", name: "Jade Plant", price: 350 },
  { id: "spider-plant", name: "Spider Plant", price: 250 },
  { id: "tulsi", name: "Tulsi", price: 150 },
  { id: "croton", name: "Croton", price: 400 },
  { id: "petunia-mix", name: "Petunia Mix", price: 200 },
];

// ─── PLANT CYCLING ───

const PLANT_CYCLES: Record<PlanterSize, string[]> = {
  big: ["areca-palm", "rubber-plant", "bougainvillea"],
  medium: ["snake-plant", "peace-lily", "fern-boston", "croton", "rubber-plant"],
  small: ["golden-pothos", "money-plant", "jade-plant", "spider-plant"],
};

export type SpaceType = "balcony" | "living-room" | "terrace";

export interface SelectedItem {
  planter: Planter;
  plant: Plant;
  qty: number;
}

export interface Recommendation {
  items: SelectedItem[];
  grandTotal: number;
  hasIpAdapterItems: boolean;
}

/**
 * Budget-aware, tier-based recommendation engine.
 *
 * Core principles:
 * - Each budget tier uses COMPLETELY DIFFERENT planters (no overlap)
 * - Higher budget = premium individual pieces, NOT more volume
 * - Max qty 2 per item (elegant pairs, never monotonous triples)
 * - KarmYog + Ugaoo interleaved for variety
 * - Plants cycled so no two adjacent items share the same plant
 * - Railing hangers only for balconies, scale with budget
 */
export function recommendProducts(
  budget: number,
  spaceType: SpaceType = "balcony"
): Recommendation {
  const selected: SelectedItem[] = [];
  let remaining = budget;
  const tier = getBudgetTier(budget);

  // ─── Parameters ───
  const maxMediumTypes =
    budget <= 30000 ? 2 : budget <= 50000 ? 3 : budget <= 75000 ? 4 : 5;

  // Plant cycling
  const pIdx: Record<string, number> = { big: 0, medium: 0, small: 0 };
  function nextPlant(size: PlanterSize): Plant {
    const cycle = PLANT_CYCLES[size];
    const id = cycle[pIdx[size] % cycle.length];
    pIdx[size]++;
    return PLANTS.find((p) => p.id === id)!;
  }

  // ═══ PHASE 0: Railing hangers (balcony only) ═══
  if (spaceType === "balcony") {
    const railingQty =
      budget <= 25000 ? 3 : budget <= 50000 ? 4 : budget <= 75000 ? 5 : 6;
    const hanger = PLANTERS.find((p) => p.id === "balcony-hanger")!;
    const petunia = PLANTS.find((p) => p.id === "petunia-mix")!;
    selected.push({ planter: hanger, plant: petunia, qty: railingQty });
    remaining -= (hanger.price + petunia.price) * railingQty;
  }

  // Get planters for this tier only — completely different catalog per tier
  const tierPlanters = getPlantersForTier(tier).sort(
    (a, b) => b.price - a.price
  );

  // ═══ PHASE 1: Big anchor piece(s) ═══
  const allBigs = tierPlanters.filter((p) => p.size === "big");
  const maxBigs = budget >= 50000 ? 2 : 1;
  let bigCount = 0;
  const bigSources = new Set<string>();

  for (const pick of allBigs) {
    if (bigCount >= maxBigs) break;
    if (bigCount > 0 && bigSources.has(pick.source)) {
      const otherAvail = allBigs.some(
        (p) =>
          !bigSources.has(p.source) &&
          !selected.some((s) => s.planter.id === p.id) &&
          p.price + 800 <= remaining * 0.5
      );
      if (otherAvail) continue;
    }
    const plant = nextPlant("big");
    const unit = pick.price + plant.price;
    if (unit > remaining * 0.5) continue;
    selected.push({ planter: pick, plant, qty: 1 });
    remaining -= unit;
    bigSources.add(pick.source);
    bigCount++;
  }

  // ═══ PHASE 2: Medium pieces — interleave KarmYog + Ugaoo ═══
  const kyMeds = tierPlanters.filter(
    (p) => p.size === "medium" && p.source === "karmyog"
  );
  const ugMeds = tierPlanters.filter(
    (p) => p.size === "medium" && p.source === "ugaoo"
  );
  const mediums: Planter[] = [];
  const maxLen = Math.max(kyMeds.length, ugMeds.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < kyMeds.length) mediums.push(kyMeds[i]);
    if (i < ugMeds.length) mediums.push(ugMeds[i]);
  }

  let medCount = 0;
  for (const pick of mediums) {
    if (medCount >= maxMediumTypes) break;
    if (selected.some((s) => s.planter.id === pick.id)) continue;
    const plant = nextPlant("medium");
    const unit = pick.price + plant.price;
    if (unit > remaining) continue;
    selected.push({ planter: pick, plant, qty: 1 });
    remaining -= unit;
    medCount++;
  }

  // ═══ PHASE 3: Small accents (starter/classic only) ═══
  if (tier !== "premium" && remaining > 500) {
    const smalls = tierPlanters.filter(
      (p) =>
        p.size === "small" && !selected.some((s) => s.planter.id === p.id)
    );
    for (const pick of smalls) {
      const plant = nextPlant("small");
      const unit = pick.price + plant.price;
      if (unit > remaining) continue;
      selected.push({ planter: pick, plant, qty: 1 });
      remaining -= unit;
      break;
    }
  }

  // ═══ PHASE 4: Upgrade to pairs (max qty 2) ═══
  for (const item of selected) {
    if (item.planter.id === "balcony-hanger") continue;
    if (item.qty >= 2) continue;
    const unit = item.planter.price + item.plant.price;
    if (unit <= remaining) {
      item.qty = 2;
      remaining -= unit;
    }
  }

  // ═══ PHASE 5: Add more unique products if budget remains ═══
  if (remaining > 3000) {
    const unused = tierPlanters.filter(
      (p) => !selected.some((s) => s.planter.id === p.id)
    );
    for (const pick of unused) {
      const plant = nextPlant(pick.size);
      const unit = pick.price + plant.price;
      if (unit > remaining) continue;
      selected.push({ planter: pick, plant, qty: 1 });
      remaining -= unit;
      if (remaining < 3000) break;
    }
  }

  const grandTotal = selected.reduce(
    (sum, s) => sum + (s.planter.price + s.plant.price) * s.qty,
    0
  );

  const hasIpAdapterItems = selected.some(
    (s) => s.planter.source === "ugaoo"
  );

  return { items: selected, grandTotal, hasIpAdapterItems };
}
