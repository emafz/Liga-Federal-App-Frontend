import { API_URL } from "@/config/globals";

// ------------------------------------------------------------
// DELETE /users/:id → elimina un usuario existente
// Ruta protegida: solo ROOT puede eliminar usuarios
// ------------------------------------------------------------
export async function deleteUser(id: string): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message || "Error al eliminar el usuario");
  }
}
