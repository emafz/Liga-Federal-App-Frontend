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
    alias?: string;
    provincia?: string;
    telefono?: string;
    fechaNacimiento?: string;
    edad?: number;
    avatarUrl?: string;
    avatarAlt?: string;
    tarjetaUrl?: string;
    tarjetaAlt?: string;
    poderNombre?: string;
    poderDescripcion?: string;
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
      alias: extraData?.alias || "",
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
      avatar: {
        url: extraData?.avatarUrl || "",
        alt: extraData?.avatarAlt || "",
      },
      tarjeta: {
        url: extraData?.tarjetaUrl || "",
        alt: extraData?.tarjetaAlt || "",
      },
      poder: {
        nombre: extraData?.poderNombre || "",
        descripcion: extraData?.poderDescripcion || "",
      },
    }),
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message); // ej: "El usuario ya existe", "Acceso denegado"
  }

  return body.data;
}

