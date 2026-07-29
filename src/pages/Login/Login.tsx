import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import styles from "./Login.module.css";
import Button from "@/components/ui/Button/Button";
import { login } from "@/api/login";
import logoImg from "@/assets/Portadas/Logo.webp";
import sudestadaImg from "@/assets/Portadas/SudestadaLLogin.webp";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      navigate({ to: "/" });
    } catch (error: any) {
      setError(error.message);
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

          <div className={styles.loginCard}>
            <span className={styles.welcomeText}>BIENVENIDO DE NUEVO</span>
            <h1 className={styles.title}>ACCESO A LA BASE</h1>
            <p className={styles.subtitle}>
              Ingresa tus credenciales para continuar tu misión en la Liga Federal.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                {/* Label oculto visualmente para accesibilidad */}
                <label className={styles.srOnly} htmlFor="email">
                  Correo electrónico
                </label>
                <div className={styles.inputWithIcon}>
                  <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <input
                    className={styles.input}
                    id="email"
                    type="email"
                    placeholder="ejemplo@ligafederal.com.ar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Correo electrónico"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                {/* Label oculto visualmente para accesibilidad */}
                <label className={styles.srOnly} htmlFor="password">
                  Contraseña
                </label>
                <div className={styles.inputWithIcon}>
                  <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    className={styles.input}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mi contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-label="Contraseña"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={styles.eyeIcon}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={styles.eyeIcon}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonWrapper}>
                <Button variant="primary" type="submit" disabled={loading}>
                  <span className={styles.btnContent}>
                    {loading ? "INGRESANDO..." : "INGRESAR A LA BASE"}
                  </span>
                </Button>
              </div>
            </form>

            <div className={styles.registerPrompt}>
              ¿No tenés cuenta?{" "}
              <Link to="/register" className={styles.registerLink}>
                REGISTRATE AHORA
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.right}>
        <div className={styles.characterContainer}>
          <img src={sudestadaImg} className={styles.characterImage} alt="Sudestada character" />
        </div>
      </section>
    </main>
  );
}

export default Login;
