import { API_URL } from "@/config/globals";

export type UploadType = "avatar" | "tarjeta";

export interface UploadResult {
  url: string;
  public_id: string;
}

// -------------------------------------------------------
// Sube un archivo de imagen al backend, que a su vez lo
// sube a Cloudinary en la carpeta correspondiente.
//
// type "avatar"  → Liga_Federal/Avatar
// type "tarjeta" → Liga_Federal/Tarjetas
//
// Devuelve: { url, public_id }
// -------------------------------------------------------
export async function uploadImage(
  file: File,
  type: UploadType
): Promise<UploadResult> {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", file);

  const endpoint = type === "avatar" ? "/upload/avatar" : "/upload/tarjeta";

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      // NO incluir Content-Type aquí: el browser lo setea automáticamente
      // con el boundary correcto para multipart/form-data
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message || "Error al subir la imagen");
  }

  return body.data as UploadResult;
}
