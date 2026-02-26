import { NextRequest, NextResponse } from "next/server";

/**
 * Nano Banana 2 (Gemini 3.1 Flash Image) — Multi-image generation pipeline
 *
 * Sends: scene photo + product reference images + placement prompt
 * Returns: AI-generated scene with products placed naturally
 *
 * This is the approach that WORKS — tested manually on Google AI Studio:
 * - Chevron planter reproduced with herringbone texture
 * - Willow shape matched perfectly
 * - Tokyo Tall ribbed cylinder correct
 * - Even wrought iron stand with wooden roof recognized
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp-image-generation";

// Fallback to Replicate Flux Depth if no Gemini key
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || "";

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string };
}

function dataUriToBase64(dataUri: string): { mimeType: string; data: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URI");
  return { mimeType: match[1], data: match[2] };
}

async function generateWithGemini(
  prompt: string,
  sceneImageDataUri: string,
  productImageDataUris: string[]
): Promise<string> {
  // Build multimodal parts: text prompt + scene image + product reference images
  const parts: GeminiPart[] = [];

  // Text prompt first
  parts.push({ text: prompt });

  // Scene image (Image 1)
  const scene = dataUriToBase64(sceneImageDataUri);
  parts.push({ inlineData: { mimeType: scene.mimeType, data: scene.data } });

  // Product reference images (Image 2, 3, 4, ...)
  for (const uri of productImageDataUris) {
    const img = dataUriToBase64(uri);
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data: GeminiResponse = await res.json();

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  // Extract the generated image from response
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No candidates in Gemini response");
  }

  const responseParts = candidates[0].content?.parts || [];
  for (const part of responseParts) {
    if (part.inlineData) {
      // Return as data URI for the frontend
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image in Gemini response. Model may have refused generation.");
}

// ─── Fallback: Replicate Flux Depth (text-only, no product matching) ───

interface ReplicateResponse {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
  urls: { get: string };
}

async function generateWithFluxDepth(prompt: string, imageDataUri: string): Promise<string> {
  const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-depth-dev/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        prompt,
        control_image: imageDataUri,
        num_outputs: 1,
        guidance_scale: 15,
        num_inference_steps: 28,
        strength: 0.80,
      },
    }),
  });

  if (!res.ok) throw new Error(`Replicate error ${res.status}: ${await res.text()}`);
  const pred: ReplicateResponse = await res.json();

  // Poll for result
  const start = Date.now();
  while (Date.now() - start < 180000) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(pred.urls.get, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const data: ReplicateResponse = await pollRes.json();
    if (data.status === "succeeded") {
      const output = data.output;
      return Array.isArray(output) ? output[0] : output || "";
    }
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${data.status}: ${data.error || "unknown"}`);
    }
  }
  throw new Error("Prediction timed out");
}

// ─── Main handler ───

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, imageDataUri, productImageDataUris } = body as {
      prompt: string;
      imageDataUri?: string;
      productImageDataUris?: string[];
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    let imageUrl: string;
    let model: string;

    // Use Gemini Nano Banana if we have an API key AND product reference images
    if (GEMINI_API_KEY && imageDataUri && productImageDataUris && productImageDataUris.length > 0) {
      imageUrl = await generateWithGemini(prompt, imageDataUri, productImageDataUris);
      model = "nano-banana";
    } else if (imageDataUri) {
      // Fallback to Flux Depth (text-only, no product matching)
      imageUrl = await generateWithFluxDepth(prompt, imageDataUri);
      model = "flux-depth";
    } else {
      // Text-only: plain Flux Schnell
      const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { prompt, num_outputs: 1, aspect_ratio: "16:9", output_format: "webp", output_quality: 90 },
        }),
      });
      if (!res.ok) throw new Error(`Replicate error: ${await res.text()}`);
      const pred: ReplicateResponse = await res.json();
      const start = Date.now();
      let output: string | string[] | undefined;
      while (Date.now() - start < 120000) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await fetch(pred.urls.get, { headers: { Authorization: `Token ${REPLICATE_TOKEN}` } });
        const data: ReplicateResponse = await pollRes.json();
        if (data.status === "succeeded") { output = data.output; break; }
        if (data.status === "failed") throw new Error(data.error || "Failed");
      }
      imageUrl = Array.isArray(output) ? output[0] : output || "";
      model = "flux-schnell";
    }

    return NextResponse.json({ imageUrl, model });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
