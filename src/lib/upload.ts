"use client";

import { uploadImageAction } from "@/app/recipes/actions";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const result = await uploadImageAction(formData);
    if (!result.success || !result.imageUrl) {
      throw new Error(result.error || "Upload failed");
    }
    return result.imageUrl;
  } catch (error) {
    console.error(error);
    throw new Error("Image upload failed");
  }
}
