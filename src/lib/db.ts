import { supabase } from "./supabase";
import type { SpaceType } from "./catalog";
import type { DesignEntry, GeneratedImage } from "./store";

/**
 * Upload a render image to Supabase Storage and return the public URL.
 */
async function uploadRenderImage(
  userId: string,
  budget: number,
  spaceType: string,
  dataUri: string
): Promise<string> {
  // Convert data URI to Blob
  const res = await fetch(dataUri);
  const blob = await res.blob();

  const path = `${userId}/${spaceType}-${budget}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("designs")
    .upload(path, blob, {
      upsert: true,
      contentType: blob.type || "image/jpeg",
    });

  if (error) {
    console.error("Storage upload failed:", error.message);
    throw error;
  }

  const { data } = supabase.storage.from("designs").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Save a design to Supabase.
 * Uploads image to Storage, saves metadata to DB.
 */
export async function saveDesign(
  userId: string,
  budget: number,
  spaceType: SpaceType,
  render: GeneratedImage
): Promise<void> {
  try {
    // Upload image to storage first
    const imageUrl = await uploadRenderImage(
      userId,
      budget,
      spaceType,
      render.url
    );

    // Save metadata with storage URL to DB
    const { error } = await supabase.from("vatika_designs").upsert(
      {
        user_id: userId,
        budget,
        space_type: spaceType,
        render_url: imageUrl,
        prompt: render.prompt,
        created_at: new Date(render.timestamp).toISOString(),
      },
      { onConflict: "user_id,budget,space_type" }
    );

    if (error) {
      console.error("DB save failed:", error.message);
    }
  } catch (err) {
    console.error("Failed to save design:", err);
  }
}

/**
 * Load all designs for a user from Supabase.
 */
export async function loadDesigns(userId: string): Promise<DesignEntry[]> {
  const { data, error } = await supabase
    .from("vatika_designs")
    .select("budget, space_type, render_url, prompt, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load designs:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    budget: row.budget,
    spaceType: row.space_type as SpaceType,
    render: {
      url: row.render_url,
      prompt: row.prompt || "",
      timestamp: new Date(row.created_at).getTime(),
    },
  }));
}

/**
 * Delete a specific design.
 */
export async function deleteDesign(
  userId: string,
  budget: number,
  spaceType: SpaceType
): Promise<void> {
  const { error } = await supabase
    .from("vatika_designs")
    .delete()
    .eq("user_id", userId)
    .eq("budget", budget)
    .eq("space_type", spaceType);

  if (error) {
    console.error("Failed to delete design:", error.message);
  }
}
