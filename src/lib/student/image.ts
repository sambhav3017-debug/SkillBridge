/**
 * Client-side helper: processes an uploaded image for high-definition rendering
 * across high-density Retina displays, My Profile, full-size photo viewer, and the Dashboard welcome banner.
 *
 * Requirements met:
 * - Preserves natural aspect ratio (does not force an aggressive or small square crop).
 * - Avoids downscaling unless the image exceeds a modern high-resolution ceiling (1600px).
 * - Uses high-quality canvas bicubic smoothing with high-fidelity encoding (WebP 0.92 or JPEG 0.92).
 * - Validates file types and sizes safely (up to 15 MB).
 */
export async function imageToAvatar(file: File, maxDimension = 1600, quality = 0.92): Promise<string> {
  if (!file) throw new Error("Please select an image file.");
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
    throw new Error("Please choose a PNG, JPEG or WebP image.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("That image is too large (max 15 MB).");
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read that image. Please choose another file."));
      i.src = url;
    });

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    if (!origW || !origH) {
      throw new Error("Invalid image dimensions.");
    }

    // Determine target dimensions preserving the original aspect ratio
    let targetW = origW;
    let targetH = origH;
    const largestSide = Math.max(origW, origH);

    if (largestSide > maxDimension) {
      const scale = maxDimension / largestSide;
      targetW = Math.round(origW * scale);
      targetH = Math.round(origH * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Could not process the image.");

    // Enable high-quality smoothing for pristine scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Try modern WebP first (supports alpha, higher compression efficiency, sharp edges)
    // Fall back to JPEG for opaque photos if WebP is not supported by older canvas implementations
    let mimeType = "image/webp";
    let dataUrl = canvas.toDataURL(mimeType, quality);
    if (!dataUrl.startsWith("data:image/webp")) {
      mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      dataUrl = canvas.toDataURL(mimeType, quality);
    }

    // If data URL is unexpectedly large (> 3,800,000 chars ~ 2.8 MB), do a gentle pass to ensure reliability
    if (dataUrl.length > 3_800_000) {
      dataUrl = canvas.toDataURL(mimeType, 0.85);
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}
