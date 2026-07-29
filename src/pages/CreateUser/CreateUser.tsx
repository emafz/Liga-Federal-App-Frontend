import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import styles from "./CreateUser.module.css";
import Button from "@/components/ui/Button/Button";
import { createUser } from "@/api/createUser";
import logoImg from "@/assets/Portadas/Logo.webp";
import condorImg from "@/assets/Portadas/Condor_Register.webp";

const PROVINCIAS = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
  "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
  "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

function CreateUser() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [provincia, setProvincia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let edad = 25;
    if (fechaNacimiento) {
      const birthDate = new Date(fechaNacimiento);
      const today = new Date();
      edad = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        edad--;
      }
    }

    try {
      await createUser(nombre, apellido, email, password, {
        provincia,
        telefono,
        fechaNacimiento,
        edad
      });
      navigate({ to: "/" });
    } catch (error: any) {
      setError(error.message || "Error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.left}>
        <div className={styles.contentWrapper}>
          <div className={styles.logoHeader}>
            <Link to="/">
              <img src={logoImg} className={styles.logo} alt="Liga Federal Logo" />
            </Link>
          </div>

          <div className={styles.registerCard}>
            <h1 className={styles.title}>CREAR USUARIO</h1>
            <p className={styles.subtitle}>
              Completá los datos para registrar un nuevo usuario en la Liga Federal.
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                {/* Fila 1: Nombre | Apellido */}
                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Ingresá nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    id="apellido"
                    name="apellido"
                    type="text"
                    placeholder="Ingresá apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>

                {/* Fila 2: Email | Contraseña */}
                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nombre@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Ingresá contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Fila 3: Provincia | Teléfono */}
                <div className={styles.inputGroup}>
                  <select
                    className={styles.select}
                    id="provincia"
                    name="provincia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    required
                  >
                    <option value="">Seleccioná provincia</option>
                    {PROVINCIAS.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="+54 9 11 1234 5678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                {/* Fila 4: Fecha de nacimiento (con label a la izquierda) */}
                <div className={`${styles.inputGroupInline} ${styles.fullWidth}`}>
                  <label className={styles.labelInline} htmlFor="fechaNacimiento">
                    Fecha de nacimiento
                  </label>
                  <div className={styles.inlineInputWrapper}>
                    <input
                      className={styles.input}
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonWrapper}>
                <Button variant="primary" type="submit" disabled={loading}>
                  <span className={styles.btnContent}>
                    {loading ? "CREANDO USUARIO..." : "CREAR USUARIO"}
                  </span>
                </Button>
              </div>
            </form>

            <div className={styles.loginPrompt}>
              <Link to="/" className={styles.loginLink}>
                VOLVER A LA LISTA DE USUARIOS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.right}>
        <div className={styles.characterContainer}>
          <img src={condorImg} className={styles.characterImage} alt="Condor character" />
        </div>
      </section>
    </main>
  );
}

export default CreateUser;
