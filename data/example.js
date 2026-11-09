/* Caso de ejemplo: empresa FICTICIA. Cualquier parecido con una organización real es casual.
 * Formato por control: [estado, evidencia, responsable, fecha objetivo, observaciones, estado de la acción, esfuerzo] */
const EXAMPLE_CASE = {
  org: {
    name: "Tecnosur Servicios Digitales, S.L.",
    type: "proveedor",
    sector: "Servicios tecnológicos",
    size: "Mediana",
    service: "Plataforma SaaS de administración electrónica para ayuntamientos (sede electrónica, registro y gestión de expedientes). Infraestructura en la nube, 45 empleados.",
    publicRelation: "Contratos de prestación de servicio con 12 ayuntamientos y una diputación provincial."
  },
  context: { publicContract: "si", availability: "medio", confidentiality: "medio", integrity: "medio", info: ["personal", "sensible"] },
  controls: {
    "GOV-01": ["si", "suficiente", "Dirección", "", "Política v2.1 aprobada por el comité de dirección en febrero de 2026 y comunicada a toda la plantilla.", "pendiente", ""],
    "GOV-02": ["parcial", "parcial", "Dirección", "2026-12-15", "Responsable de seguridad nombrado; falta formalizar al responsable del sistema.", "en_curso", "S"],
    "GOV-03": ["si", "parcial", "Calidad", "", "Normas de uso aceptadas en el alta; falta registro de aceptación de los últimos 12 meses.", "pendiente", ""],
    "GOV-04": ["parcial", "parcial", "Calidad", "2027-01-31", "Procedimientos en la wiki interna, sin control de versiones.", "pendiente", "M"],
    "GOV-05": ["no", "ninguna", "CISO", "2026-09-30", "No existe un proceso formal de autorización de nuevos sistemas o conexiones.", "pendiente", "M"],
    "AUD-01": ["no", "ninguna", "CISO", "2027-03-31", "Todavía no se ha realizado ninguna auditoría interna.", "pendiente", "M"],
    "RSK-01": ["parcial", "parcial", "CISO", "2026-10-31", "El análisis de riesgos es de 2024; hay que actualizarlo con el nuevo módulo de registro.", "en_curso", "L"],
    "ARC-01": ["parcial", "parcial", "Arquitectura", "2027-02-28", "Diagramas de red actualizados; falta documentar zonas y flujos.", "pendiente", "M"],
    "ACQ-01": ["no", "ninguna", "Compras", "2027-03-15", "", "pendiente", "S"],
    "ACC-01": ["si", "parcial", "TI", "", "Altas y bajas con ticket; la revisión de permisos es solo anual.", "pendiente", ""],
    "ACC-02": ["parcial", "suficiente", "TI", "2026-12-31", "MFA en administradores y VPN; falta extenderlo al resto de usuarios.", "en_curso", "M"],
    "ACC-03": ["si", "suficiente", "TI", "", "", "pendiente", ""],
    "ASSET-01": ["parcial", "parcial", "TI", "2026-12-20", "Inventario en hoja de cálculo, sin dependencias entre activos.", "pendiente", "M"],
    "CFG-01": ["no", "ninguna", "TI", "2027-04-30", "", "pendiente", "L"],
    "VUL-01": ["parcial", "parcial", "TI", "2026-11-30", "Escaneo trimestral; no hay plazos (SLA) de corrección.", "en_curso", "M"],
    "CHG-01": ["si", "parcial", "TI", "", "Cambios con ticket y aprobación; falta plan de rollback documentado.", "pendiente", ""],
    "MAL-01": ["si", "suficiente", "TI", "", "", "pendiente", ""],
    "INC-01": ["parcial", "parcial", "CISO", "2026-12-10", "Existe el procedimiento, pero nunca se ha hecho un ejercicio de simulación.", "pendiente", "M"],
    "LOG-01": ["parcial", "parcial", "TI", "2027-01-15", "Logs centralizados con 30 días de retención; sin revisión periódica.", "pendiente", "M"],
    "KEY-01": ["no_sabe", "ninguna", "", "", "Hay que averiguar quién gestiona las claves y dónde se almacenan.", "pendiente", ""],
    "MON-01": ["no", "ninguna", "TI", "2027-06-30", "Valorar un EDR gestionado o un SOC externo.", "pendiente", "L"],
    "SUP-01": ["parcial", "parcial", "Compras", "2027-01-31", "Cláusulas de seguridad solo en los proveedores críticos.", "pendiente", "M"],
    "CLD-01": ["si", "parcial", "TI", "", "Proveedor cloud con certificación ENS de categoría Media; falta archivar el certificado.", "pendiente", ""],
    "BCP-01": ["parcial", "ninguna", "Dirección", "2027-02-15", "Hay un plan de continuidad genérico, sin RTO/RPO ni pruebas.", "pendiente", "L"],
    "BKP-01": ["si", "parcial", "TI", "", "Copias diarias; la última prueba de restauración fue hace 14 meses.", "pendiente", ""],
    "PHY-01": ["si", "suficiente", "Administración", "", "", "pendiente", ""],
    "PER-01": ["parcial", "parcial", "RRHH", "2026-12-31", "La formación se da solo en el alta.", "pendiente", "S"],
    "EQP-01": ["si", "parcial", "TI", "", "Cifrado de disco y bloqueo automático; sin MDM en móviles.", "pendiente", ""],
    "NET-01": ["si", "suficiente", "TI", "", "", "pendiente", ""],
    "COM-01": ["si", "suficiente", "TI", "", "", "pendiente", ""],
    "MED-01": ["no_sabe", "ninguna", "", "", "", "pendiente", ""],
    "DEV-01": ["parcial", "parcial", "Desarrollo", "2027-02-28", "Hay revisión de código; faltan análisis estático (SAST) y gestión de dependencias.", "pendiente", "M"],
    "PRV-01": ["si", "suficiente", "DPD", "", "Registro de actividades de tratamiento al día.", "pendiente", ""],
    "DATA-01": ["no", "ninguna", "CISO", "2027-02-28", "No hay un esquema de clasificación de la información.", "pendiente", "M"],
    "CRY-01": ["parcial", "parcial", "TI", "2026-12-31", "Cifrado en tránsito sí; el cifrado en reposo de las bases de datos está pendiente.", "en_curso", "M"],
    "SIG-01": ["na", "ninguna", "", "", "No se usan firma ni sellado propios; los gestiona el proveedor de la sede electrónica.", "pendiente", ""],
    "MAIL-01": ["si", "suficiente", "TI", "", "", "pendiente", ""],
    "WEB-01": ["parcial", "parcial", "Desarrollo", "2026-11-30", "WAF en producción; sin pruebas de intrusión recientes.", "pendiente", "M"]
  }
};
if (typeof module !== "undefined") module.exports = { EXAMPLE_CASE };
