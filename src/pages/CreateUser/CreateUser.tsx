import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import styles from "./CreateUser.module.css";
import Button from "@/components/ui/Button/Button";
import { createUser } from "@/api/createUser";
import { uploadImage } from "@/api/uploadImage";
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
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [provincia, setProvincia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarAlt, setAvatarAlt] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [tarjetaUrl, setTarjetaUrl] = useState("");
  const [tarjetaAlt, setTarjetaAlt] = useState("");
  const [tarjetaPreview, setTarjetaPreview] = useState<string | null>(null);
  const [tarjetaUploading, setTarjetaUploading] = useState(false);

  const [poderNombre, setPoderNombre] = useState("");
  const [poderDescripcion, setPoderDescripcion] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const tarjetaInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarAlt(file.name.replace(/\.[^.]+$/, ""));
    setAvatarUploading(true);
    setError(null);
    try {
      const result = await uploadImage(file, "avatar");
      setAvatarUrl(result.url);
    } catch (err: any) {
      setError(`Error al subir avatar: ${err.message}`);
      setAvatarPreview(null);
      setAvatarUrl("");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleTarjetaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTarjetaPreview(URL.createObjectURL(file));
    setTarjetaAlt(file.name.replace(/\.[^.]+$/, ""));
    setTarjetaUploading(true);
    setError(null);
    try {
      const result = await uploadImage(file, "tarjeta");
      setTarjetaUrl(result.url);
    } catch (err: any) {
      setError(`Error al subir tarjeta: ${err.message}`);
      setTarjetaPreview(null);
      setTarjetaUrl("");
    } finally {
      setTarjetaUploading(false);
    }
  }

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
        alias,
        provincia,
        telefono,
        fechaNacimiento,
        edad,
        avatarUrl,
        avatarAlt,
        tarjetaUrl,
        tarjetaAlt,
        poderNombre,
        poderDescripcion,
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

                {/* Fila 2: Alias (full width) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <input
                    className={styles.input}
                    id="alias"
                    name="alias"
                    type="text"
                    placeholder="Alias o apodo del personaje (ej: El Payé)"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                  />
                </div>

                {/* Fila 3: Email | Contraseña */}
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

                {/* Fila 4: Provincia | Teléfono */}
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

                {/* Fila 5: Fecha de nacimiento (con label a la izquierda) */}
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

                {/* Fila 6: Avatar (upload real a Cloudinary) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div className={styles.uploadWidget}>
                    <div className={styles.uploadPreviewBox}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview avatar" className={styles.uploadPreviewImg} />
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Sin avatar</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.uploadActions}>
                      <span className={styles.uploadLabel}>Avatar del personaje</span>
                      {avatarUrl && (
                        <span className={styles.uploadSuccess}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Subido a Cloudinary
                        </span>
                      )}
                      <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                      >
                        {avatarUploading ? "Subiendo..." : avatarPreview ? "Cambiar Avatar" : "Cargar Avatar"}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={handleAvatarSelect}
                      />
                      {avatarAlt && (
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="Descripción del avatar (alt)"
                          value={avatarAlt}
                          onChange={(e) => setAvatarAlt(e.target.value)}
                          style={{ marginTop: "6px" }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Fila 7: Tarjeta (upload real a Cloudinary) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div className={styles.uploadWidget}>
                    <div className={styles.uploadPreviewBox}>
                      {tarjetaPreview ? (
                        <img src={tarjetaPreview} alt="Preview tarjeta" className={styles.uploadPreviewImg} />
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                          <span>Sin tarjeta</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.uploadActions}>
                      <span className={styles.uploadLabel}>Tarjeta del personaje</span>
                      {tarjetaUrl && (
                        <span className={styles.uploadSuccess}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Subida a Cloudinary
                        </span>
                      )}
                      <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => tarjetaInputRef.current?.click()}
                        disabled={tarjetaUploading}
                      >
                        {tarjetaUploading ? "Subiendo..." : tarjetaPreview ? "Cambiar Tarjeta" : "Cargar Tarjeta"}
                      </button>
                      <input
                        ref={tarjetaInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={handleTarjetaSelect}
                      />
                      {tarjetaAlt && (
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="Descripción de la tarjeta (alt)"
                          value={tarjetaAlt}
                          onChange={(e) => setTarjetaAlt(e.target.value)}
                          style={{ marginTop: "6px" }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Fila 8: Nombre del Poder (full width) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <input
                    className={styles.input}
                    id="poderNombre"
                    name="poderNombre"
                    type="text"
                    placeholder="Nombre del poder especial"
                    value={poderNombre}
                    onChange={(e) => setPoderNombre(e.target.value)}
                  />
                </div>

                {/* Fila 9: Descripción del Poder (full width) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <textarea
                    className={styles.input}
                    id="poderDescripcion"
                    name="poderDescripcion"
                    placeholder="Descripción detallada del poder"
                    value={poderDescripcion}
                    onChange={(e) => setPoderDescripcion(e.target.value)}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
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

