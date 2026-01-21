import axios from "axios";

export async function downloadImageAsFile(
  imageUrl: string
): Promise<File> {
  const res = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const contentType =
    res.headers["content-type"] || "image/jpeg";

  const extension = contentType.split("/")[1] || "jpg";

  return new File([res.data], `recipe.${extension}`, {
    type: contentType,
  });
}
