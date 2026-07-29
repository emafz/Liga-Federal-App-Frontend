import { API_URL } from "@/config/globals";

// ------------------------------------------------------------
// POST /users → crea un usuario nuevo
// Es una ruta protegida: solo un admin ya logueado puede crear usuarios
// ------------------------------------------------------------
export async function createUser(
  nombre: string,
  apellido: string,
  email: string,
  password: string,
  extraData?: {
    provincia?: string;
    telefono?: string;
    fechaNacimiento?: string;
    edad?: number;
  }
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre,
      apellido,
      email,
      password,
      role: "USER",
      fechaNacimiento: extraData?.fechaNacimiento || "2000-01-01",
      edad: extraData?.edad || 25,
      genero: "No especificado",
      telefono: extraData?.telefono || "000000",
      direccion: "Sin dirección",
      localidad: "Sin localidad",
      provincia: extraData?.provincia || "Sin provincia",
      pais: "Argentina",
      codigoPostal: "0000",
    }),
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message); // ej: "El usuario ya existe", "Acceso denegado"
  }

  return body.data;
}
