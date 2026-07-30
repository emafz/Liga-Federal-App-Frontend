import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/blocks/Modal/Modal";
import ModalMaps from "@/components/ModalMaps/ModalMaps";
import styles from "./Home.module.css";
import { getUsers } from "@/api/getUsers";
import { updateUser } from "@/api/updateUser";
import type { User } from "@/api/types";
import logoImg from "@/assets/Portadas/Logo.webp";
import personajesImg from "@/assets/Portadas/Personajes-Home.webp";
import defaultPhoto from "@/assets/Tarjetas/01_El_Paye.png";
import avatarImg from "@/assets/Avatar/Avatar_01_El_Paye.png";

const ROLES = ["ROOT", "ADMIN", "USER", "GUEST"];

function getGenderBadge(genero?: string) {
  const g = genero?.toLowerCase() || "";
  if (g.includes("masculino") || g.includes("♂")) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <svg style={{ display: "inline-block", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="14" r="5" />
          <line x1="19" y1="5" x2="13.5" y2="10.5" />
          <polyline points="14 5 19 5 19 10" />
        </svg>
        <span>{genero}</span>
      </span>
    );
  }
  if (g.includes("femenino") || g.includes("♀")) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <svg style={{ display: "inline-block", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="5" />
          <line x1="12" y1="14" x2="12" y2="21" />
          <line x1="9" y1="18" x2="15" y2="18" />
        </svg>
        <span>{genero}</span>
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <svg style={{ display: "inline-block", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>{genero || "No especificado"}</span>
    </span>
  );
}

function Home() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rol del usuario logueado
  const currentUserRole = (localStorage.getItem("role") || "").toUpperCase();
  const isRootOrAdmin = currentUserRole === "ROOT" || currentUserRole === "ADMIN";

  // Estado para la barra de búsqueda universal
  const [searchQuery, setSearchQuery] = useState("");

  // Usuario seleccionado para ver o editar en el modal
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);

  // Estado para el modal de Google Maps
  const [mapModalData, setMapModalData] = useState<{
    isOpen: boolean;
    locationName: string;
    fullAddress: string;
  }>({
    isOpen: false,
    locationName: "",
    fullAddress: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
  }

  function openView(user: User) {
    setModalUser(user);
    setModalMode("view");
  }

  function openEdit(user: User) {
    setModalUser(user);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setModalUser(null);
  }

  function openMap(user: User) {
    const locationName = user.localidad || "";
    const addressParts = [user.direccion, user.localidad, user.provincia, "Argentina"].filter(Boolean);
    const fullAddress = addressParts.join(", ");
    setMapModalData({
      isOpen: true,
      locationName,
      fullAddress,
    });
  }

  function closeMap() {
    setMapModalData((prev) => ({ ...prev, isOpen: false }));
  }

  function handleUserUpdated(updated: User) {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    closeModal();
  }

  // CÁLCULOS PARA TARJETAS DASHBOARD
  const totalUsers = users.length;
  const maleCount = users.filter(
    (u) => u.genero?.toLowerCase().includes("masculino") || u.genero?.includes("♂")
  ).length;
  const femaleCount = users.filter(
    (u) => u.genero?.toLowerCase().includes("femenino") || u.genero?.includes("♀")
  ).length;

  const rolesCount = users.reduce((acc, u) => {
    const r = (u.role || "USER").toUpperCase();
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueProvincesCount = new Set(
    users.map((u) => u.provincia?.trim()).filter(Boolean)
  ).size;

  const usersWithAge = users.filter((u) => typeof u.edad === "number" && u.edad > 0);
  const avgAge =
    usersWithAge.length > 0
      ? (usersWithAge.reduce((sum, u) => sum + (u.edad || 0), 0) / usersWithAge.length).toFixed(1)
      : "-";

  // FILTRADO MULTI-CAMPO UNIVERSAL
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fieldsToSearch = [
      user.nombre,
      user.apellido,
      user.alias,
      user.email,
      user.genero,
      user.edad ? String(user.edad) : "",
      user.fechaNacimiento,
      user.telefono,
      user.direccion,
      user.localidad,
      user.provincia,
      user.pais,
      user.codigoPostal,
      user.role,
      user.poder?.nombre,
      user.poder?.descripcion,
    ];
    return fieldsToSearch.some((field) => field && String(field).toLowerCase().includes(q));
  });

  // Si no está autenticado, mostramos la Landing Page pública
  if (!isAuthenticated) {
    return (
      <div className={styles.landingContainer}>
        <main className={styles.heroSection}>
          <section className={styles.heroLeft}>
            <div className={styles.heroLogoWrapper}>
              <img src={logoImg} className={styles.heroLogo} alt="Liga Federal Logo" />
            </div>

            <div className={styles.heroTagline}>
              <span>UNIDOS POR LO QUE SOMOS,</span>
              <span>IMPARABLES POR LO QUE PODEMOS SER.</span>
            </div>

            <div className={styles.heroActions}>
              <div className={styles.btnWrapperBlue}>
                <Button variant="secondary" onClick={() => navigate({ to: "/login" })}>
                  ACCESO A LA BASE
                </Button>
              </div>
              <div className={styles.btnWrapperGold}>
                <Button variant="primary" onClick={() => navigate({ to: "/register" })}>
                  CREAR CUENTA
                </Button>
              </div>
            </div>
          </section>

          <section className={styles.heroRight}>
            <div className={styles.charactersWrapper}>
              <img src={personajesImg} className={styles.charactersImg} alt="Personajes de la Liga Federal" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Si está autenticado, mostramos el Panel de Administración de Usuarios
  return (
    <main className={styles.container}>
      {/* HEADER CON BARRA DE BÚSQUEDA EXCLUSIVA PARA ROOT Y ADMIN */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <img src={logoImg} className={styles.dashboardLogo} alt="Logo" />
          <h1 className={styles.title}>Usuarios Registrados</h1>
        </div>

        {isRootOrAdmin && (
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <svg
                className={styles.searchIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar por cualquier campo (nombre, alias, ciudad, rol...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery("")}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => navigate({ to: "/create-user" })}>
            + Agregar Usuario
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* TARJETAS RESUMEN DE DASHBOARD */}
      {!loading && !error && users.length > 0 && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Usuarios Totales</span>
            <h3 className={styles.statValue}>{totalUsers}</h3>
            <span className={styles.statSubtext}>Registrados en la base</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Género</span>
            <div className={styles.statValue}>
              <span style={{ color: "#3b82f6", fontSize: "18px" }}>♂ {maleCount}</span>
              <span style={{ color: "#ec4899", fontSize: "18px" }}>♀ {femaleCount}</span>
            </div>
            <span className={styles.statSubtext}>Distribución total</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Usuarios por Rol</span>
            <div className={styles.statBadgeGroup}>
              {Object.entries(rolesCount).map(([role, count]) => (
                <span key={role} className={role === "ROOT" ? styles.miniBadgeGold : styles.miniBadge}>
                  {role}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Provincias</span>
            <h3 className={styles.statValue}>{uniqueProvincesCount}</h3>
            <span className={styles.statSubtext}>Provincias representadas</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Edad Promedio</span>
            <h3 className={styles.statValue}>
              {avgAge} <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>años</span>
            </h3>
            <span className={styles.statSubtext}>Promedio de usuarios</span>
          </div>
        </div>
      )}

      {loading && <p className={styles.message}>Cargando usuarios...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && users.length === 0 && <p className={styles.message}>No hay usuarios para mostrar</p>}

      {!loading && !error && users.length > 0 && filteredUsers.length === 0 && (
        <p className={styles.message}>No se encontraron usuarios coincidentes con "{searchQuery}"</p>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Usuario</th>
                <th className={styles.th}>Alias</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Género</th>
                <th className={styles.th}>Localidad</th>
                <th className={styles.th}>Provincia</th>
                <th className={styles.th}>Rol</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredUsers]
                .sort((a, b) => {
                  const roleOrder: Record<string, number> = { ROOT: 1, ADMIN: 2, USER: 3, GUEST: 4 };
                  const orderA = roleOrder[a.role?.toUpperCase()] ?? 99;
                  const orderB = roleOrder[b.role?.toUpperCase()] ?? 99;
                  return orderA - orderB;
                })
                .map((user) => (
                  <tr key={user._id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <img
                          className={styles.avatar}
                          src={user.avatar?.url || avatarImg}
                          alt={user.avatar?.alt || `${user.nombre} ${user.apellido}`}
                        />
                        <span>
                          {user.nombre} {user.apellido}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td} style={{ color: "#94a3b8" }}>{user.alias || "-"}</td>
                    <td className={styles.td}>{user.email}</td>
                    <td className={styles.td}>{getGenderBadge(user.genero)}</td>
                    <td className={styles.td}>
                      {user.localidad ? (
                        <button
                          type="button"
                          onClick={() => openMap(user)}
                          className={styles.mapLink}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
                          title={`Ver mapa de ${user.localidad}`}
                        >
                          {user.localidad}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className={styles.td}>{user.provincia || "-"}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${styles[`badge__${user.role.toLowerCase()}`] ?? ""}`}>{user.role}</span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openView(user)}>
                          Ver
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} onClick={() => openEdit(user)}>
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalMode !== null} onClose={closeModal}>
        {modalMode === "view" && modalUser && <UserDetails user={modalUser} />}
        {modalMode === "edit" && modalUser && <UserEditForm user={modalUser} onCancel={closeModal} onSaved={handleUserUpdated} />}
      </Modal>

      <ModalMaps
        isOpen={mapModalData.isOpen}
        onClose={closeMap}
        locationName={mapModalData.locationName}
        fullAddress={mapModalData.fullAddress}
      />
    </main>
  );
}

// ------------------------------------------------------------
// Vista "Ver": detalle de usuario en modo solo lectura
// ------------------------------------------------------------
function UserDetails({ user }: { user: User }) {
  const [photoUrl, setPhotoUrl] = useState<string>(defaultPhoto);

  const fields: [string, string][] = [
    ["Nombre", `${user.nombre} ${user.apellido}`],
    ["Email", user.email],
    ["Rol", user.role],
    ["Género", user.genero],
    ["Edad", String(user.edad)],
    ["Fecha de nacimiento", user.fechaNacimiento?.slice(0, 10)],
    ["Teléfono", user.telefono],
    ["Dirección", user.direccion],
    ["Localidad", user.localidad],
    ["Provincia", user.provincia],
    ["País", user.pais],
    ["Código postal", user.codigoPostal],
  ];

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  }

  return (
    <div className={styles.userDetailsWrapper}>
      {/* COLUMNA IZQUIERDA: fotografía */}
      <div className={styles.userPhotoSection}>
        <div className={styles.photoContainer}>
          <img src={photoUrl} alt="Fotografía del usuario" className={styles.userPhotoImg} />
        </div>
        <label htmlFor="user-photo-upload" className={styles.editPhotoBtn} title="Cambiar fotografía">
          {/* Ícono lápiz */}
          <svg className={styles.editPhotoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </label>
        <input
          id="user-photo-upload"
          type="file"
          accept="image/*"
          className={styles.hiddenFileInput}
          onChange={handleImageChange}
        />
      </div>

      {/* COLUMNA DERECHA: campos de datos */}
      <div className={styles.viewFieldsWrapper}>
        {/* Alias arriba de todo en dorado */}
        <h2 className={styles.aliasHeader}>
          {user.alias || `${user.nombre} ${user.apellido}`}
        </h2>

        {/* Sección del Poder */}
        <div className={styles.poderSection}>
          <div className={styles.poderTitleRow}>
            <span className={styles.poderLabel}>PODER:</span>
            <span className={styles.poderName}>
              {user.poder?.nombre ? user.poder.nombre : "SIN PODER"}
            </span>
          </div>
          <p className={styles.poderDesc}>
            {user.poder?.descripcion || "Sin descripción de poder disponible."}
          </p>
        </div>

        {/* Grid con los demás datos */}
        <dl className={styles.viewGrid}>
          {fields.map(([label, value]) => (
            <div className={styles.viewRow} key={label}>
              <dt className={styles.viewLabel}>{label}</dt>
              <dd className={styles.viewValue}>
                {label === "Género" ? getGenderBadge(value) : value || "-"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Vista "Editar": formulario que guarda cambios con updateUser
// ------------------------------------------------------------
function UserEditForm({ user, onCancel, onSaved }: { user: User; onCancel: () => void; onSaved: (user: User) => void }) {
  const [nombre, setNombre] = useState(user.nombre);
  const [apellido, setApellido] = useState(user.apellido);
  const [alias, setAlias] = useState(user.alias || "");
  const [genero, setGenero] = useState(user.genero);
  const [edad, setEdad] = useState(String(user.edad));
  const [fechaNacimiento, setFechaNacimiento] = useState(user.fechaNacimiento?.slice(0, 10) ?? "");
  const [telefono, setTelefono] = useState(user.telefono);
  const [direccion, setDireccion] = useState(user.direccion);
  const [localidad, setLocalidad] = useState(user.localidad);
  const [provincia, setProvincia] = useState(user.provincia);
  const [pais, setPais] = useState(user.pais);
  const [codigoPostal, setCodigoPostal] = useState(user.codigoPostal);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar?.url || "");
  const [avatarAlt, setAvatarAlt] = useState(user.avatar?.alt || "");
  const [tarjetaUrl, setTarjetaUrl] = useState(user.tarjeta?.url || "");
  const [tarjetaAlt, setTarjetaAlt] = useState(user.tarjeta?.alt || "");
  const [poderNombre, setPoderNombre] = useState(user.poder?.nombre || "");
  const [poderDescripcion, setPoderDescripcion] = useState(user.poder?.descripcion || "");
  const [role, setRole] = useState(user.role);
  const [avatarPhoto, setAvatarPhoto] = useState<string>(user.avatar?.url || avatarImg);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPhoto(url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await updateUser(user._id, {
        nombre,
        apellido,
        alias,
        genero,
        edad: Number(edad),
        fechaNacimiento,
        telefono,
        direccion,
        localidad,
        provincia,
        pais,
        codigoPostal,
        avatar: { url: avatarUrl, alt: avatarAlt },
        tarjeta: { url: tarjetaUrl, alt: tarjetaAlt },
        poder: { nombre: poderNombre, descripcion: poderDescripcion },
        role,
      });
      onSaved(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.editFormCompact} onSubmit={handleSubmit}>
      {/* Header del formulario de edición: Título a la izquierda, Avatar al centro */}
      <div className={styles.editHeaderGroup}>
        <h2 className={styles.viewTitle} style={{ margin: 0 }}>EDITAR USUARIO</h2>

        <div className={styles.editAvatarWrapper}>
          <img src={avatarPhoto} alt="Avatar de usuario" className={styles.editAvatarImg} />
          <label htmlFor="edit-avatar-upload" className={styles.editAvatarBtn} title="Cambiar avatar">
            <svg className={styles.editPhotoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </label>
          <input
            id="edit-avatar-upload"
            type="file"
            accept="image/*"
            className={styles.hiddenFileInput}
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Grid de campos con etiquetas a la izquierda */}
      <div className={styles.editFormGrid}>
        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-nombre">Nombre</label>
          <input className={styles.inputCompact} id="edit-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-apellido">Apellido</label>
          <input className={styles.inputCompact} id="edit-apellido" type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-alias">Alias</label>
          <input className={styles.inputCompact} id="edit-alias" type="text" value={alias} onChange={(e) => setAlias(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-genero">Género</label>
          <input className={styles.inputCompact} id="edit-genero" type="text" value={genero} onChange={(e) => setGenero(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-edad">Edad</label>
          <input className={styles.inputCompact} id="edit-edad" type="number" min={1} max={120} value={edad} onChange={(e) => setEdad(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-fechaNacimiento">F. Nacimiento</label>
          <input className={styles.inputCompact} id="edit-fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-telefono">Teléfono</label>
          <input className={styles.inputCompact} id="edit-telefono" type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-direccion">Dirección</label>
          <input className={styles.inputCompact} id="edit-direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-localidad">Localidad</label>
          <input className={styles.inputCompact} id="edit-localidad" type="text" value={localidad} onChange={(e) => setLocalidad(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-provincia">Provincia</label>
          <input className={styles.inputCompact} id="edit-provincia" type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-pais">País</label>
          <input className={styles.inputCompact} id="edit-pais" type="text" value={pais} onChange={(e) => setPais(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-codigoPostal">C. Postal</label>
          <input className={styles.inputCompact} id="edit-codigoPostal" type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-avatarUrl">Avatar URL</label>
          <input className={styles.inputCompact} id="edit-avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-avatarAlt">Avatar Alt</label>
          <input className={styles.inputCompact} id="edit-avatarAlt" type="text" value={avatarAlt} onChange={(e) => setAvatarAlt(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-tarjetaUrl">Tarjeta URL</label>
          <input className={styles.inputCompact} id="edit-tarjetaUrl" type="url" value={tarjetaUrl} onChange={(e) => setTarjetaUrl(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-tarjetaAlt">Tarjeta Alt</label>
          <input className={styles.inputCompact} id="edit-tarjetaAlt" type="text" value={tarjetaAlt} onChange={(e) => setTarjetaAlt(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-poderNombre">Poder</label>
          <input className={styles.inputCompact} id="edit-poderNombre" type="text" value={poderNombre} onChange={(e) => setPoderNombre(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-poderDescripcion">Desc. Poder</label>
          <input className={styles.inputCompact} id="edit-poderDescripcion" type="text" value={poderDescripcion} onChange={(e) => setPoderDescripcion(e.target.value)} />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.labelInline} htmlFor="edit-role">Rol</label>
          <select className={styles.selectCompact} id="edit-role" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.modalActions}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <button className={styles.btnSaveGold} type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

export default Home;
