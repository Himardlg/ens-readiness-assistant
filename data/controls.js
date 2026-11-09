/* Catálogo de controles del assessment.
 *
 * IMPORTANTE: las referencias `ref` son orientativas y su correspondencia con el
 * Anexo II del RD 311/2022 está marcada como NO verificada (`verified:false`)
 * hasta que se contraste con el texto vigente y las guías CCN-STIC.
 * `minCategory` indica, de forma orientativa, desde qué categoría suele ser
 * exigible la medida (basica < media < alta).
 */
const CATALOG_VERSION = "2.0.0";
const CATEGORY_ORDER = { basica: 1, media: 2, alta: 3 };

const _c = (id, ref, area, name, priority, minCategory, question, evidence, action) =>
  ({ id, ref, area, name, priority, minCategory, question, evidence, action, verified: false });

const CONTROLS = [
  /* --- Marco organizativo --- */
  _c("GOV-01","org.1","Gobernanza","Política de seguridad","alta","basica","¿Existe una política de seguridad aprobada, comunicada y revisada?",["Política aprobada","Registro de comunicación","Evidencia de revisión"],"Formalizar/aprobar la política y conservar evidencias de comunicación y revisión."),
  _c("GOV-02","org.1 (roles)","Gobernanza","Roles y responsabilidades ENS","alta","basica","¿Están definidos y formalizados los roles y responsabilidades de seguridad (responsable de información, servicio, seguridad, sistema)?",["Organigrama/RACI","Nombramientos","Descripción de responsabilidades"],"Documentar responsables, autoridad y segregación de funciones."),
  _c("GOV-03","org.2","Gobernanza","Normativa de seguridad","media","basica","¿Existe normativa de seguridad que regule el uso correcto de los sistemas y la información?",["Normas de uso","Registro de aceptación","Control de versiones"],"Elaborar y difundir normas de uso y conservar la aceptación del personal."),
  _c("GOV-04","org.3","Gobernanza","Procedimientos de seguridad","media","basica","¿Los procedimientos operativos de seguridad están documentados y se mantienen?",["Catálogo de procedimientos","Revisiones","Responsables"],"Documentar los procedimientos de operación y asignar propietarios y revisión."),
  _c("GOV-05","org.4","Gobernanza","Proceso de autorización","media","basica","¿Existe un proceso formal de autorización de nuevos sistemas, equipos, instalaciones o conexiones?",["Procedimiento de autorización","Registro de autorizaciones"],"Definir y aplicar un proceso de autorización previo a la puesta en servicio."),
  _c("AUD-01","art. 31 · op.mon.2","Verificación","Revisión y auditoría","media","basica","¿Se revisa periódicamente la eficacia de las medidas y se gestionan hallazgos?",["Plan de revisión","Informes","Hallazgos","Seguimiento"],"Establecer revisiones periódicas y seguimiento formal de hallazgos."),

  /* --- Marco operacional: planificación --- */
  _c("RSK-01","op.pl.1","Riesgo","Análisis de riesgos","alta","basica","¿Existe un análisis de riesgos actualizado que cubra el alcance evaluado?",["Metodología","Inventario","Análisis de riesgos","Aprobación"],"Realizar o actualizar el análisis de riesgos y vincularlo al sistema evaluado."),
  _c("ARC-01","op.pl.2","Riesgo","Arquitectura de seguridad","media","basica","¿Está documentada la arquitectura de seguridad (zonas, componentes, flujos y dependencias)?",["Diagramas de arquitectura","Documentación de zonas","Revisiones"],"Documentar y revisar la arquitectura de seguridad del sistema."),
  _c("ACQ-01","op.pl.3","Riesgo","Adquisición de nuevos componentes","media","basica","¿Se incorporan requisitos de seguridad al adquirir productos o servicios nuevos?",["Criterios de adquisición","Requisitos en pliegos/contratos","Evaluación previa"],"Incluir requisitos de seguridad y evaluación previa en las adquisiciones."),

  /* --- Control de acceso --- */
  _c("ACC-01","op.acc","Acceso","Control de acceso","alta","basica","¿El acceso se gestiona con mínimo privilegio, altas/bajas y revisiones?",["Política de acceso","Matriz de permisos","Revisiones periódicas","Registros"],"Establecer ciclo de vida de accesos y revisiones periódicas."),
  _c("ACC-02","op.acc.5 / op.acc.6","Acceso","Autenticación y MFA","alta","media","¿Se exige autenticación robusta (incluido doble factor en accesos críticos o remotos)?",["Política de autenticación","Configuración MFA","Cobertura de cuentas privilegiadas"],"Implantar MFA en accesos remotos y cuentas privilegiadas y documentar la cobertura."),
  _c("ACC-03","op.acc.8","Acceso","Acceso remoto","media","basica","¿El acceso remoto está controlado, autenticado y registrado?",["Política de acceso remoto","Configuración VPN/ZTNA","Registros"],"Controlar y registrar el acceso remoto con autenticación fuerte."),

  /* --- Explotación --- */
  _c("ASSET-01","op.exp.1","Activos","Inventario y alcance","alta","basica","¿Existe un inventario actualizado de sistemas, activos y dependencias del servicio?",["Inventario","Diagrama","Propietarios","Revisión"],"Crear inventario con propietario, criticidad, dependencia y estado."),
  _c("CFG-01","op.exp.2 / op.exp.3","Operación","Gestión de configuración","baja","basica","¿Existe una configuración de seguridad de referencia (baseline) para los sistemas y se mantiene actualizada?",["Baseline de configuración","Control de desviaciones","Registro de actualizaciones"],"Definir configuraciones de referencia y revisar periódicamente su cumplimiento."),
  _c("VUL-01","op.exp.4","Vulnerabilidades","Mantenimiento y gestión de vulnerabilidades","media","basica","¿Existe un proceso para identificar, priorizar y corregir vulnerabilidades y aplicar actualizaciones?",["Escaneos","Tickets","Criterios de priorización","Informes de cierre"],"Implantar ciclo de vulnerabilidades con responsables y plazos."),
  _c("CHG-01","op.exp.5","Operación","Gestión de cambios","baja","media","¿Los cambios en sistemas se planifican, prueban y aprueban de forma controlada?",["Procedimiento de cambios","Registro de cambios","Aprobaciones","Plan de rollback"],"Formalizar el procedimiento de gestión de cambios y conservar el registro de aprobaciones."),
  _c("MAL-01","op.exp.6","Operación","Protección frente a código dañino","alta","basica","¿Existe protección frente a código dañino (EDR/antimalware) en equipos y servidores, actualizada y monitorizada?",["Configuración EDR/antimalware","Cobertura de equipos","Alertas y respuesta"],"Desplegar y monitorizar protección frente a código dañino con cobertura medible."),
  _c("INC-01","op.exp.7","Incidentes","Gestión de incidentes","alta","basica","¿Existe un proceso de detección, registro, respuesta y aprendizaje de incidentes?",["Procedimiento","Registro de incidentes","Ejercicio/prueba","Lecciones aprendidas"],"Formalizar el ciclo de gestión y probarlo mediante ejercicios."),
  _c("LOG-01","op.exp.8","Operación","Registro y monitorización","media","basica","¿Los eventos relevantes se registran, protegen y revisan?",["Política de logs","Configuración","Alertas","Revisiones"],"Definir fuentes, retención, protección y revisión de registros."),
  _c("KEY-01","op.exp.10","Información","Protección de claves criptográficas","media","basica","¿Las claves criptográficas se generan, almacenan, rotan y destruyen de forma controlada?",["Procedimiento de gestión de claves","Inventario de claves","Evidencia de rotación"],"Definir el ciclo de vida de claves y proteger su almacenamiento."),
  _c("MON-01","op.mon.1","Operación","Detección de intrusión","media","media","¿Existen mecanismos de detección o prevención de intrusión sobre el tráfico y los sistemas críticos?",["Configuración IDS/IPS/EDR","Alertas","Procedimiento de tratamiento"],"Implantar detección de intrusión y un procedimiento de tratamiento de alertas."),

  /* --- Servicios externos y nube --- */
  _c("SUP-01","op.ext","Terceros","Gestión de proveedores","media","basica","¿Los proveedores críticos se evalúan y existen requisitos de seguridad contractuales?",["Inventario de proveedores","Evaluaciones","Contratos/SLA","Seguimiento"],"Clasificar proveedores críticos y formalizar requisitos y seguimiento."),
  _c("CLD-01","op.nub.1","Terceros","Servicios en la nube","media","basica","¿Los servicios en la nube cumplen los requisitos aplicables (p. ej. certificación ENS del proveedor, ubicación de datos)?",["Inventario de servicios cloud","Certificaciones del proveedor","Acuerdos de tratamiento"],"Inventariar servicios cloud y verificar certificaciones y condiciones del proveedor."),

  /* --- Continuidad --- */
  _c("BCP-01","op.cont","Continuidad","Continuidad y recuperación","media","media","¿Están definidos escenarios, RTO/RPO y pruebas de recuperación?",["BCP/DRP","RTO/RPO","Resultados de pruebas","Plan de mejoras"],"Definir objetivos de recuperación y ejecutar pruebas documentadas."),
  _c("BKP-01","mp.info.9 (verificar)","Continuidad","Copias de seguridad","media","basica","¿Las copias están definidas, protegidas y se prueba su restauración?",["Política de backup","Logs","Configuración","Pruebas de restauración"],"Documentar política y realizar pruebas de restauración periódicas."),

  /* --- Medidas de protección --- */
  _c("PHY-01","mp.if","Protección física","Seguridad física","media","basica","¿Las instalaciones y equipos están protegidos frente a accesos y eventos físicos?",["Controles de acceso","Registro de visitas","Procedimientos","Pruebas"],"Evaluar controles físicos del alcance y conservar evidencias."),
  _c("PER-01","mp.per.3 / mp.per.4","Personas","Formación y concienciación","media","basica","¿El personal recibe formación adecuada y existe evidencia?",["Plan formativo","Materiales","Asistencia","Evaluaciones"],"Implantar un plan anual con trazabilidad de asistencia y resultados."),
  _c("EQP-01","mp.eq","Protección de equipos","Protección de equipos y puesto de trabajo","media","basica","¿Los equipos (incluidos portátiles y móviles) están protegidos: bloqueo, cifrado de disco, puesto despejado?",["Política de puesto de trabajo","Configuración de bloqueo","Cifrado de disco","Gestión de dispositivos (MDM)"],"Aplicar y verificar medidas de protección de equipos y dispositivos móviles."),
  _c("NET-01","mp.com.1","Comunicaciones","Perímetro y segmentación de red","alta","basica","¿Existe un perímetro seguro (cortafuegos) y segmentación de redes y flujos?",["Reglas de cortafuegos","Diagrama de red","Revisión de reglas","Segmentación"],"Definir y revisar reglas de perímetro y segmentar según criticidad."),
  _c("COM-01","mp.com.2 / mp.com.3","Comunicaciones","Protección de comunicaciones","media","media","¿Las comunicaciones protegen confidencialidad, autenticidad e integridad (TLS, VPN)?",["Configuración TLS/VPN","Inventario de canales","Certificados"],"Proteger los canales de comunicación según la categoría y verificar su configuración."),
  _c("MED-01","mp.si","Soportes","Gestión de soportes de información","baja","basica","¿Los soportes (USB, discos, papel) se marcan, custodian, transportan y destruyen de forma segura?",["Procedimiento de soportes","Registros de borrado/destrucción","Inventario"],"Definir el ciclo de vida de soportes y conservar evidencia de borrado/destrucción."),
  _c("DEV-01","mp.sw","Desarrollo","Seguridad en el desarrollo","media","basica","¿El ciclo de desarrollo/adquisición de software incluye requisitos y pruebas de seguridad?",["Requisitos de seguridad","Revisión de código/pruebas","Gestión de dependencias","Entorno de pruebas separado"],"Incorporar controles de seguridad en el ciclo de vida del software y documentar su verificación."),
  _c("PRV-01","mp.info.1","Información","Datos personales","alta","basica","¿Se identifican los tratamientos de datos personales y se aplican las medidas correspondientes (coordinado con RGPD/LOPDGDD)?",["Registro de actividades de tratamiento","Evaluaciones de impacto","Medidas aplicadas"],"Coordinar ENS y protección de datos: identificar tratamientos y alinear medidas."),
  _c("DATA-01","mp.info.2","Información","Protección de la información","media","basica","¿La información está clasificada y existen medidas acordes a su sensibilidad?",["Clasificación","Reglas de manejo","Controles","Revisiones"],"Definir clasificación, reglas de manejo y controles asociados."),
  _c("CRY-01","mp.info.3","Información","Cifrado de información","alta","media","¿La información sensible se protege mediante cifrado en tránsito y en reposo cuando corresponde?",["Política de cifrado","Inventario de algoritmos/claves","Configuración","Gestión de claves"],"Definir requisitos de cifrado según categoría y aplicarlos a los flujos y repositorios afectados."),
  _c("SIG-01","mp.info.4 / mp.info.5","Información","Firma electrónica y sellos de tiempo","baja","media","¿Se utilizan firma electrónica y sellos de tiempo donde la integridad o el no repudio lo requieren?",["Política de firma","Certificados","Configuración de sellado"],"Identificar los procesos que requieren firma/sellado e implantarlos."),
  _c("MAIL-01","mp.s.1","Servicios","Protección del correo electrónico","media","basica","¿El correo está protegido frente a phishing, spam y suplantación (SPF/DKIM/DMARC, filtrado)?",["Configuración SPF/DKIM/DMARC","Filtrado antispam/antimalware","Informes"],"Configurar autenticación de dominio y filtrado de correo."),
  _c("WEB-01","mp.s.2","Servicios","Protección de servicios y aplicaciones web","media","basica","¿Los servicios y aplicaciones web expuestos están protegidos (WAF, pruebas, parcheo)?",["Inventario de servicios expuestos","Pruebas de seguridad","Configuración WAF"],"Inventariar y proteger los servicios web expuestos con pruebas periódicas.")
];

if (typeof module !== "undefined") module.exports = { CONTROLS, CATALOG_VERSION, CATEGORY_ORDER };
