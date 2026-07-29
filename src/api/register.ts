import { API_URL } from "@/config/globals";
import type { User } from "@/api/types";

export async function registerUser(payload: Partial<User> & { password?: string }) {
  // Enviar los datos de registro al backend
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      role: payload.role || "USER",
      pais: payload.pais || "Argentina",
      codigoPostal: payload.codigoPostal || "0000",
      // Si no vienen algunos de estos campos requeridos, mandamos valores por defecto
      fechaNacimiento: payload.fechaNacimiento || "2000-01-01",
      edad: payload.edad || 25,
      genero: payload.genero || "No especificado",
      telefono: payload.telefono || "000000",
      direccion: payload.direccion || "Sin dirección",
      localidad: payload.localidad || "Sin localidad",
      provincia: payload.provincia || "Sin provincia",
    }),
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message || "Error al registrar el usuario");
  }

  return body.data;
}
