import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import styles from "./Register.module.css";
import Button from "@/components/ui/Button/Button";
import { registerUser } from "@/api/register";
import logoImg from "@/assets/Portadas/Logo.webp";
import condorImg from "@/assets/Portadas/Condor_Register.webp";

const PROVINCIAS = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
  "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
  "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

interface FormState {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  provincia: string;
  fechaNacimiento: string;
  telefono: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  provincia?: string;
  fechaNacimiento?: string;
  telefono?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    provincia: "",
    fechaNacimiento: "",
    telefono: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al editar
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) errs.apellido = "El apellido es obligatorio.";
    if (!form.email.trim()) {
      errs.email = "El correo electrónico es obligatorio.";
    } else if (!validateEmail(form.email)) {
      errs.email = "El correo electrónico no tiene un formato válido.";
    }
    if (!form.password) errs.password = "La contraseña es obligatoria.";
    if (!form.provincia) errs.provincia = "La provincia es obligatoria.";
    if (!form.fechaNacimiento) errs.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    if (!form.telefono.trim()) errs.telefono = "El teléfono es obligatorio.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    // Calcular edad a partir de la fecha de nacimiento
    let edad = 25;
    if (form.fechaNacimiento) {
      const birthDate = new Date(form.fechaNacimiento);
      const today = new Date();
      edad = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        edad--;
      }
    }

    try {
      await registerUser({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        provincia: form.provincia,
        fechaNacimiento: form.fechaNacimiento,
        edad,
        telefono: form.telefono,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      setServerError(err.message || "Error al realizar el registro.");
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
            <h1 className={styles.title}>SUMA TU FUERZA</h1>
            <p className={styles.subtitle}>
              Registrate para sumar tu fuerza a la Liga Federal.
            </p>

            {success ? (
              <div className={styles.successMessage}>
                <svg className={styles.successIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>¡Registro exitoso! Redirigiendo a la base...</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>

                  {/* Fila 1: Nombre | Apellido */}
                  <div className={styles.inputGroup}>
                    <input
                      className={`${styles.input} ${errors.nombre ? styles.inputError : ""}`}
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Ingresá tu nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                    {errors.nombre && <span className={styles.fieldError}>{errors.nombre}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      className={`${styles.input} ${errors.apellido ? styles.inputError : ""}`}
                      id="apellido"
                      name="apellido"
                      type="text"
                      placeholder="Ingresá tu apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      required
                    />
                    {errors.apellido && <span className={styles.fieldError}>{errors.apellido}</span>}
                  </div>

                  {/* Fila 2: Email | Contraseña */}
                  <div className={styles.inputGroup}>
                    <input
                      className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nombre@correo.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Ingresá una contraseña"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                  </div>

                  {/* Fila 3: Provincia | Teléfono */}
                  <div className={styles.inputGroup}>
                    <select
                      className={`${styles.select} ${errors.provincia ? styles.inputError : ""}`}
                      id="provincia"
                      name="provincia"
                      value={form.provincia}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccioná tu provincia</option>
                      {PROVINCIAS.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {errors.provincia && <span className={styles.fieldError}>{errors.provincia}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      className={`${styles.input} ${errors.telefono ? styles.inputError : ""}`}
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="+54 9 11 1234 5678"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                    />
                    {errors.telefono && <span className={styles.fieldError}>{errors.telefono}</span>}
                  </div>

                  {/* Fila 4: Fecha de nacimiento (con label a la izquierda) */}
                  <div className={`${styles.inputGroupInline} ${styles.fullWidth}`}>
                    <label className={styles.labelInline} htmlFor="fechaNacimiento">
                      Fecha de nacimiento
                    </label>
                    <div className={styles.inlineInputWrapper}>
                      <input
                        className={`${styles.input} ${errors.fechaNacimiento ? styles.inputError : ""}`}
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={handleChange}
                        required
                      />
                      {errors.fechaNacimiento && <span className={styles.fieldError}>{errors.fechaNacimiento}</span>}
                    </div>
                  </div>

                </div>

                {serverError && <p className={styles.error}>{serverError}</p>}

                <div className={styles.buttonWrapper}>
                  <Button variant="primary" type="submit" disabled={loading}>
                    <span className={styles.btnContent}>
                      {loading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
                    </span>
                  </Button>
                </div>
              </form>
            )}

            <div className={styles.loginPrompt}>
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className={styles.loginLink}>
                ACCESO A LA BASE
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

export default Register;
