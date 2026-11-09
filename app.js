"use strict";
/* ENS Readiness Assistant — UI. La lógica de puntuación vive en logic.js (testeable). */

const L = ENSLogic;
const STORAGE_KEY = "ensReadinessV2";
const STATUS_LABEL = { si: "Sí", parcial: "Parcialmente", no: "No", no_sabe: "No sé", na: "No aplica" };
const EVIDENCE_LABEL = { ninguna: "Ninguna", parcial: "Parcial", suficiente: "Suficiente" };
const ACTION_LABEL = { pendiente: "Pendiente", en_curso: "En curso", hecho: "Hecho" };
const CAT_NAME = { basica: "Básica", media: "Media", alta: "Alta" };

let state = newState();
let dirty = false;
let draftPending = false;
let exampleMode = false; // datos ficticios: no se autoguardan ni se mezclan con los reales
let autosaveTimer = null;

function newState() {
  return { answers: {}, evidence: {}, actions: {}, generated: false, options: { excludeAboveCategory: true } };
}
const $ = (id) => document.getElementById(id);
const field = (kind, id) => document.querySelector(`[data-${kind}="${id}"]`);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const fmtTime = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
const todayISO = () => new Date().toISOString().slice(0, 10);


/* ---------- Preferencias: tema, idioma y biblioteca de controles ---------- */
let uiLanguage = localStorage.getItem("ensLanguage") || "es";
const translations = {
  "Inicio":"Home", "Guardar":"Save", "Cargar":"Load", "Biblioteca de controles":"Control library",
  "Nueva evaluación":"New assessment", "Importar evaluación":"Import assessment", "Ver un ejemplo":"View example",
  "Cómo funciona":"How it works", "Organización":"Organization", "Aplicabilidad":"Applicability", "Assessment":"Assessment",
  "Resultado ejecutivo":"Executive results", "De la primera evaluación al plan de acción.":"From initial assessment to action plan.",
  "Continuar →":"Continue →", "← Atrás":"← Back", "Generar assessment →":"Generate assessment →",
  "Área":"Area", "Todas las áreas":"All areas", "Prioridad":"Priority", "Todas":"All", "Solo sin responder":"Unanswered only",
  "Evidencia disponible":"Available evidence", "Responsable":"Owner", "Fecha objetivo":"Target date", "Estado de la acción":"Action status",
  "Observaciones":"Notes", "Evidencias esperadas":"Expected evidence", "Sí":"Yes", "Parcialmente":"Partially", "No sé":"I don't know",
  "Ninguna":"None", "Parcial":"Partial", "Suficiente":"Sufficient", "Pendiente":"Pending", "En curso":"In progress", "Hecho":"Done"
};

// Complete ES -> EN dictionary for static and dynamically generated UI text.
// Keys are kept in Spanish so imported assessments and stored data remain unchanged.
Object.assign(translations, {
  "Sin guardar":"Unsaved", "Modo ejemplo.":"Example mode.", "Estás viendo una empresa ficticia. Recorre los pasos libremente: nada de esto se guarda ni toca tus datos.":"You are viewing a fictional company. Explore the steps freely: nothing here is saved or affects your data.",
  "Salir del ejemplo":"Exit example", "Prepara tu organización para el Esquema Nacional de Seguridad":"Prepare your organization for the National Security Framework",
  "Una evaluación guiada de unos 15–20 minutos que te dice si el ENS probablemente te aplica, en qué punto estás, qué evidencias puedes aportar y qué hacer primero. Es una herramienta de":"A guided 15–20 minute assessment that tells you whether the ENS likely applies, where you stand, what evidence you can provide, and what to do first. It is a",
  "readiness":"readiness", "no sustituye una auditoría ni una certificación.":"tool; it does not replace an audit or certification.",
  "Aplicabilidad y categoría":"Applicability and category", "Orientación preliminar sobre si el ENS aplica a tu servicio y con qué categoría empezar.":"Preliminary guidance on whether the ENS applies to your service and which category to start with.",
  "Estado y evidencias":"Status and evidence", "Distingue lo que dices que haces de lo que puedes demostrar, y lo que aún no sabes.":"Distinguish what you say you do from what you can demonstrate, and what you do not yet know.",
  "Plan de acción":"Action plan", "Gaps priorizados con responsable, fecha y estado, exportables a Excel (CSV).":"Prioritized gaps with owner, date and status, exportable to Excel (CSV).",
  "¿Qué quieres hacer?":"What would you like to do?", "Empieza desde cero en 4 pasos.":"Start from scratch in 4 steps.", "Volver a la evaluación en curso":"Return to the current assessment",
  "Borrador guardado":"Saved draft", "Recuperar":"Recover", "Descartar":"Discard", "Carga un fichero":"Load a file",
  "Ver un ejemplo":"View an example", "Carga una empresa ficticia para recorrer la herramienta.":"Load a fictional company to explore the tool.",
  "Pasos, indicadores y límites.":"Steps, indicators and limitations.", "Organización.":"Organization.", "Nombre, tipo, sector y servicio.":"Name, type, sector and service.",
  "Relación con el sector público e impacto en disponibilidad, confidencialidad e integridad.":"Relationship with the public sector and impact on availability, confidentiality and integrity.",
  "Estado de cada control + evidencia disponible + responsable y fecha. «No sé» es una respuesta válida.":"Status of each control + available evidence + owner and date. “I don't know” is a valid answer.",
  "Readiness declarado y verificable, gaps, desglose por área y plan de acción.":"Declared and verifiable readiness, gaps, breakdown by area and action plan.",
  "¿Qué es el ENS?":"What is the ENS?", "El Esquema Nacional de Seguridad (RD 311/2022) fija los principios y requisitos de seguridad de la información y los servicios del sector público español y de las entidades que les prestan servicios.":"The National Security Framework (RD 311/2022) sets information and service security principles and requirements for the Spanish public sector and entities providing services to it.",
  "¿Qué NO es esta herramienta?":"What this tool is NOT", "No es una auditoría, no emite certificación ni dictamen jurídico, y sus porcentajes no equivalen a un «% de cumplimiento ENS». Las referencias a medidas son orientativas y deben contrastarse con el texto vigente.":"It is not an audit, it does not issue certification or legal opinions, and its percentages do not equal an “ENS compliance %”. Measure references are indicative and must be checked against the current text.",
  "Privacidad de los datos":"Data privacy", "Todo se procesa en tu navegador. No hay servidor: los datos solo se guardan en este navegador (autoguardado) o en los ficheros que tú exportes.":"Everything is processed in your browser. There is no server: data is only stored in this browser (autosave) or in files you export.",
  "De la primera evaluación al plan de acción.":"From initial assessment to action plan.",
  "Una evaluación GRC sencilla para identificar aplicabilidad, situación actual, evidencias y próximos pasos. No sustituye una auditoría ni una certificación ENS.":"A simple GRC assessment to identify applicability, current status, evidence and next steps. It does not replace an ENS audit or certification.",
  "Organización *":"Organization *", "Tipo de organización *":"Organization type *", "Selecciona…":"Select…", "Administración Pública":"Public administration",
  "Universidad pública":"Public university", "Proveedor tecnológico / contratista":"Technology provider / contractor", "Entidad privada sin prestación ENS identificada":"Private entity with no identified ENS service", "Otro":"Other",
  "Administración pública":"Public administration", "Salud":"Healthcare", "Educación":"Education", "Servicios tecnológicos":"Technology services", "Finanzas":"Finance", "Industria":"Industry", "Otros":"Other",
  "Tamaño":"Size", "Micro / pequeña":"Micro / small", "Mediana":"Medium", "Grande":"Large", "Servicio principal":"Main service", "Relación con el sector público":"Relationship with the public sector",
  "Aplicabilidad y contexto":"Applicability and context", "El resultado es orientativo: la aplicabilidad real debe contrastarse con el supuesto jurídico y el alcance concreto del servicio/sistema.":"The result is indicative: actual applicability must be checked against the legal basis and the specific scope of the service/system.",
  "¿Existe una prestación o relación contractual con el sector público que afecte al servicio evaluado?":"Is there a service or contractual relationship with the public sector that affects the assessed service?",
  "Impacto preliminar del sistema":"Preliminary system impact", "Disponibilidad":"Availability", "Confidencialidad":"Confidentiality", "Integridad":"Integrity",
  "Bajo":"Low", "Medio":"Medium", "Alto":"High", "Tipos de información relevantes":"Relevant information types", "Pública":"Public", "Datos personales":"Personal data",
  "Información sensible":"Sensitive information", "Información/servicio crítico":"Critical information/service", "Información financiera":"Financial information",
  "Assessment GRC":"GRC assessment", "Para cada área indica el estado y, sobre todo, si puedes demostrarlo con evidencia. Categoría preliminar:":"For each area, indicate the status and, above all, whether you can demonstrate it with evidence. Preliminary category:",
  "Área":"Area", "Prioridad":"Priority", "Todas":"All", "Alta":"High", "Media":"Medium", "Baja":"Low", "Solo sin responder":"Unanswered only",
  "Excluir del cálculo controles exigibles solo en categorías superiores":"Exclude controls required only in higher categories from the calculation",
  "Ningún control coincide con los filtros.":"No controls match the filters.", "Resultado ejecutivo":"Executive results",
  "Imprimir / PDF":"Print / PDF", "Exportar plan (CSV)":"Export plan (CSV)", "Exportar proyecto":"Export project",
  "← Revisar assessment":"← Review assessment", "BIBLIOTECA GRC":"GRC LIBRARY", "Biblioteca de controles":"Control library",
  "Catálogo de controles de evaluación disponibles, con referencias ENS orientativas, categoría y evidencias esperadas.":"Available assessment control catalogue, with indicative ENS references, category and expected evidence.",
  "Buscar control":"Search controls", "Estado de verificación normativa":"Regulatory verification status",
  "Las referencias del catálogo original están marcadas como pendientes de contraste individual. Esta biblioteca no debe presentarse como catálogo completo ni como matriz de cumplimiento del Anexo II hasta validar cada código, submedida, dimensión y categoría contra el texto consolidado del RD 311/2022 y las guías CCN-STIC aplicables.":"References in the original catalogue are marked as pending individual verification. This library must not be presented as a complete catalogue or as an Annex II compliance matrix until each code, sub-measure, dimension and category has been checked against the consolidated RD 311/2022 text and applicable CCN-STIC guides.",
  "Fuente normativa:":"Regulatory source:", "Real Decreto 311/2022, de 3 de mayo, especialmente sus Anexos I y II. Consulta el texto oficial en el BOE.":"Royal Decree 311/2022 of 3 May, especially Annexes I and II. Consult the official text in the BOE.",
  "Texto consolidado del RD 311/2022":"Consolidated text of RD 311/2022", "ENS Readiness Assistant v2 · Evaluación orientativa · RD 311/2022 · La herramienta no constituye certificación ni dictamen jurídico.":"ENS Readiness Assistant v2 · Indicative assessment · RD 311/2022 · This tool does not constitute certification or a legal opinion.",
  "Responsable":"Owner", "Fecha objetivo":"Target date", "Estado de la acción":"Action status", "Esfuerzo":"Effort",
  "Bajo (S)":"Low (S)", "Medio (M)":"Medium (M)", "Alto (L)":"High (L)", "Evidencias esperadas":"Expected evidence",
  "Observaciones":"Notes", "Evidencia disponible":"Available evidence", "Contexto, limitaciones o evidencia que falta…":"Context, limitations or missing evidence…",
  "Área / rol":"Department / role", "Buscar control, medida, área o palabra clave":"Search control, measure, area or keyword",
  "Verificada":"Verified", "Pendiente de verificar":"Pending verification", "No hay controles coincidentes.":"No matching controls.",
  "Básica":"Basic", "Básica (preliminar)":"Basic (preliminary)", "Media (preliminar)":"Medium (preliminary)", "Alta (preliminar)":"High (preliminary)",
  "Desde categoría ":"From category ", "Validar (No sé)":"Validate (I don't know)", "No aplica":"Not applicable",
  "Sin acciones pendientes según las respuestas actuales.":"No pending actions based on the current answers.",
  "Metodología y límites":"Methodology and limitations", "El assessment es una herramienta de readiness, no una auditoría.":"The assessment is a readiness tool, not an audit.",
  "Las respuestas «No sé» se tratan como incertidumbre y no como cumplimiento.":"“I don't know” answers are treated as uncertainty, not compliance.",
  "Guardar":"Save", "Cargar":"Load", "Evaluación guardada en este navegador.":"Assessment saved in this browser.", "Evaluación cargada.":"Assessment loaded.",
  "No hay una evaluación guardada.":"There is no saved assessment.", "Has salido del ejemplo.":"You have exited example mode.",
  "Ejemplo cargado: Tecnosur Servicios Digitales (ficticia). Pulsa «Continuar» en cada paso para recorrerlo.":"Example loaded: Tecnosur Servicios Digitales (fictional). Press “Continue” at each step to explore it.",
  "Estás en el modo ejemplo: no se guarda. Pulsa «Salir del ejemplo» para empezar la tuya.":"You are in example mode: it is not saved. Press “Exit example” to start your own.",
  "Indica el nombre de la organización.":"Enter the organization name.", "Selecciona un tipo de organización.":"Select an organization type.",
  "El fichero seleccionado no es un JSON válido.":"The selected file is not valid JSON.", "No se pudo importar el fichero: formato no válido.":"The file could not be imported: invalid format.",
  "Evaluación sin nombre":"Unnamed assessment", "EJEMPLO con datos ficticios":"EXAMPLE with fictional data", "Evaluación orientativa":"Indicative assessment",
  "Readiness por área":"Readiness by area", "Categoría preliminar":"Preliminary category", "Plan de acción":"Action plan",
  "No respondido":"Unanswered", "No sé":"I don't know", "No":"No", "Sí":"Yes", "Parcialmente":"Partially",
  "Ninguna":"None", "Parcial":"Partial", "Suficiente":"Sufficient", "Pendiente":"Pending", "En curso":"In progress", "Hecho":"Done"
});

const CONTROL_EN = {
  "GOV-01": {area:"Governance", name:"Security policy", question:"Does an approved, communicated and reviewed security policy exist?", evidence:["Approved policy","Communication record","Review evidence"], action:"Formalize/approve the policy and retain evidence of communication and review."},
  "GOV-02": {area:"Governance", name:"ENS roles and responsibilities", question:"Are security roles and responsibilities (information, service, security and system owners) defined and formalized?", evidence:["Organization chart/RACI","Appointments","Responsibility descriptions"], action:"Document owners, authority and segregation of duties."},
  "GOV-03": {area:"Governance", name:"Security regulations", question:"Are there security rules governing the proper use of systems and information?", evidence:["Usage rules","Acceptance record","Version control"], action:"Create and distribute usage rules and retain staff acceptance."},
  "GOV-04": {area:"Governance", name:"Security procedures", question:"Are operational security procedures documented and maintained?", evidence:["Procedure catalogue","Reviews","Owners"], action:"Document operating procedures and assign owners and review dates."},
  "GOV-05": {area:"Governance", name:"Authorization process", question:"Is there a formal authorization process for new systems, equipment, facilities or connections?", evidence:["Authorization procedure","Authorization records"], action:"Define and apply an authorization process before go-live."},
  "AUD-01": {area:"Verification", name:"Review and audit", question:"Is the effectiveness of security measures reviewed periodically and are findings managed?", evidence:["Review plan","Reports","Findings","Follow-up"], action:"Establish periodic reviews and formal follow-up of findings."},
  "RSK-01": {area:"Risk", name:"Risk analysis", question:"Is there an up-to-date risk analysis covering the assessed scope?", evidence:["Methodology","Inventory","Risk analysis","Approval"], action:"Perform or update the risk analysis and link it to the assessed system."},
  "ARC-01": {area:"Risk", name:"Security architecture", question:"Is the security architecture (zones, components, flows and dependencies) documented?", evidence:["Architecture diagrams","Zone documentation","Reviews"], action:"Document and review the system security architecture."},
  "ACQ-01": {area:"Risk", name:"Acquisition of new components", question:"Are security requirements included when acquiring new products or services?", evidence:["Acquisition criteria","Requirements in tenders/contracts","Prior assessment"], action:"Include security requirements and prior assessment in acquisitions."},
  "ACC-01": {area:"Access", name:"Access control", question:"Is access managed using least privilege, joiner/leaver processes and reviews?", evidence:["Access policy","Permission matrix","Periodic reviews","Logs"], action:"Establish an access lifecycle and periodic reviews."},
  "ACC-02": {area:"Access", name:"Authentication and MFA", question:"Is strong authentication required, including multi-factor authentication for critical or remote access?", evidence:["Authentication policy","MFA configuration","Privileged account coverage"], action:"Deploy MFA for remote access and privileged accounts and document coverage."},
  "ACC-03": {area:"Access", name:"Remote access", question:"Is remote access controlled, authenticated and logged?", evidence:["Remote access policy","VPN/ZTNA configuration","Logs"], action:"Control and log remote access using strong authentication."},
  "ASSET-01": {area:"Assets", name:"Inventory and scope", question:"Is there an up-to-date inventory of systems, assets and service dependencies?", evidence:["Inventory","Diagram","Owners","Review"], action:"Create an inventory with owner, criticality, dependency and status."},
  "CFG-01": {area:"Operations", name:"Configuration management", question:"Is there a security configuration baseline for systems and is it kept up to date?", evidence:["Configuration baseline","Deviation management","Update records"], action:"Define baseline configurations and periodically review compliance."},
  "VUL-01": {area:"Vulnerabilities", name:"Vulnerability management", question:"Is there a process to identify, prioritize and remediate vulnerabilities and apply updates?", evidence:["Scans","Tickets","Prioritization criteria","Closure reports"], action:"Implement a vulnerability lifecycle with owners and deadlines."},
  "CHG-01": {area:"Operations", name:"Change management", question:"Are system changes planned, tested and approved in a controlled manner?", evidence:["Change procedure","Change records","Approvals","Rollback plan"], action:"Formalize change management and retain approval records."},
  "MAL-01": {area:"Operations", name:"Protection against malicious code", question:"Is protection against malicious code (EDR/antimalware) deployed, updated and monitored on endpoints and servers?", evidence:["EDR/antimalware configuration","Endpoint coverage","Alerts and response"], action:"Deploy and monitor malicious-code protection with measurable coverage."},
  "INC-01": {area:"Incidents", name:"Incident management", question:"Is there a process for incident detection, recording, response and learning?", evidence:["Procedure","Incident register","Exercise/test","Lessons learned"], action:"Formalize the incident management lifecycle and test it through exercises."},
  "LOG-01": {area:"Operations", name:"Logging and monitoring", question:"Are relevant events logged, protected and reviewed?", evidence:["Logging policy","Configuration","Alerts","Reviews"], action:"Define sources, retention, protection and review of logs."},
  "KEY-01": {area:"Information", name:"Cryptographic key protection", question:"Are cryptographic keys generated, stored, rotated and destroyed in a controlled manner?", evidence:["Key management procedure","Key inventory","Rotation evidence"], action:"Define the key lifecycle and protect key storage."},
  "MON-01": {area:"Operations", name:"Intrusion detection", question:"Are intrusion detection or prevention mechanisms deployed for traffic and critical systems?", evidence:["IDS/IPS/EDR configuration","Alerts","Alert-handling procedure"], action:"Deploy intrusion detection and an alert-handling procedure."},
  "SUP-01": {area:"Third parties", name:"Supplier management", question:"Are critical suppliers assessed and are contractual security requirements in place?", evidence:["Supplier inventory","Assessments","Contracts/SLAs","Monitoring"], action:"Classify critical suppliers and formalize requirements and monitoring."},
  "CLD-01": {area:"Third parties", name:"Cloud services", question:"Do cloud services meet applicable requirements (e.g. provider ENS certification, data location)?", evidence:["Cloud service inventory","Provider certifications","Processing agreements"], action:"Inventory cloud services and verify provider certifications and conditions."},
  "BCP-01": {area:"Continuity", name:"Business continuity and recovery", question:"Are scenarios, RTO/RPO targets and recovery tests defined?", evidence:["BCP/DRP","RTO/RPO","Test results","Improvement plan"], action:"Define recovery objectives and execute documented tests."},
  "BKP-01": {area:"Continuity", name:"Backups", question:"Are backups defined, protected and restoration tested?", evidence:["Backup policy","Logs","Configuration","Restoration tests"], action:"Document the backup policy and perform periodic restoration tests."},
  "PHY-01": {area:"Physical protection", name:"Physical security", question:"Are facilities and equipment protected against unauthorized access and physical events?", evidence:["Access controls","Visitor records","Procedures","Tests"], action:"Assess physical controls within scope and retain evidence."},
  "PER-01": {area:"People", name:"Training and awareness", question:"Does staff receive appropriate training and is evidence retained?", evidence:["Training plan","Materials","Attendance","Assessments"], action:"Implement an annual plan with traceable attendance and results."},
  "EQP-01": {area:"Equipment protection", name:"Equipment and workstation protection", question:"Are equipment (including laptops and mobiles) protected through locking, disk encryption and clear-desk controls?", evidence:["Workstation policy","Lock configuration","Disk encryption","Mobile device management (MDM)"], action:"Apply and verify equipment and mobile-device protection measures."},
  "NET-01": {area:"Communications", name:"Network perimeter and segmentation", question:"Is there a secure perimeter (firewall) and network/flow segmentation?", evidence:["Firewall rules","Network diagram","Rule review","Segmentation"], action:"Define and review perimeter rules and segment according to criticality."},
  "COM-01": {area:"Communications", name:"Communications protection", question:"Do communications protect confidentiality, authenticity and integrity (TLS, VPN)?", evidence:["TLS/VPN configuration","Channel inventory","Certificates"], action:"Protect communication channels according to category and verify configuration."},
  "MED-01": {area:"Media", name:"Information media management", question:"Are media (USB, disks, paper) securely marked, controlled, transported and destroyed?", evidence:["Media procedure","Erasure/destruction records","Inventory"], action:"Define the media lifecycle and retain evidence of erasure/destruction."},
  "DEV-01": {area:"Development", name:"Secure development", question:"Does the software development/acquisition lifecycle include security requirements and testing?", evidence:["Security requirements","Code review/testing","Dependency management","Separate test environment"], action:"Integrate security controls into the software lifecycle and document verification."},
  "PRV-01": {area:"Information", name:"Personal data", question:"Are personal-data processing activities identified and the applicable measures implemented (coordinated with GDPR/LOPDGDD)?", evidence:["Records of processing activities","Impact assessments","Implemented measures"], action:"Coordinate ENS and data protection: identify processing and align measures."},
  "DATA-01": {area:"Information", name:"Information protection", question:"Is information classified and protected according to its sensitivity?", evidence:["Classification","Handling rules","Controls","Reviews"], action:"Define classification, handling rules and associated controls."},
  "CRY-01": {area:"Information", name:"Information encryption", question:"Is sensitive information protected with encryption in transit and at rest where appropriate?", evidence:["Encryption policy","Algorithm/key inventory","Configuration","Key management"], action:"Define encryption requirements by category and apply them to affected flows and repositories."},
  "SIG-01": {area:"Information", name:"Electronic signatures and timestamps", question:"Are electronic signatures and timestamps used where integrity or non-repudiation requires them?", evidence:["Signature policy","Certificates","Timestamping configuration"], action:"Identify processes requiring signatures/timestamps and implement them."},
  "MAIL-01": {area:"Services", name:"Email protection", question:"Is email protected against phishing, spam and spoofing (SPF/DKIM/DMARC, filtering)?", evidence:["SPF/DKIM/DMARC configuration","Antispam/antimalware filtering","Reports"], action:"Configure domain authentication and email filtering."},
  "WEB-01": {area:"Services", name:"Web services and application protection", question:"Are exposed web services and applications protected (WAF, testing, patching)?", evidence:["Exposed service inventory","Security testing","WAF configuration"], action:"Inventory and protect exposed web services with periodic testing."}
};


function ctl(c) {
  if (uiLanguage !== "en") return c;
  const x = CONTROL_EN[c.id];
  return x ? {...c, ...x, area: x.area || c.area} : c;
}

const STATUS_LABEL_EN = { si:"Yes", parcial:"Partially", no:"No", no_sabe:"I don't know", na:"Not applicable" };
const EVIDENCE_LABEL_EN = { ninguna:"None", parcial:"Partial", suficiente:"Sufficient" };
const ACTION_LABEL_EN = { pendiente:"Pending", en_curso:"In progress", hecho:"Done" };
const PRIORITY_LABEL_EN = { alta:"High", media:"Medium", baja:"Low" };
const CAT_NAME_EN = { basica:"Basic", media:"Medium", alta:"High" };
const uiStatusLabel = v => uiLanguage === "en" ? STATUS_LABEL_EN[v] : STATUS_LABEL[v];
const uiEvidenceLabel = v => uiLanguage === "en" ? EVIDENCE_LABEL_EN[v] : EVIDENCE_LABEL[v];
const uiActionLabel = v => uiLanguage === "en" ? ACTION_LABEL_EN[v] : ACTION_LABEL[v];
const uiPriorityLabel = v => uiLanguage === "en" ? PRIORITY_LABEL_EN[v] : v;
const uiCatName = v => uiLanguage === "en" ? CAT_NAME_EN[v] : CAT_NAME[v];

function setLanguage(lang) {
  if (typeof readForm === "function" && document.getElementById("controls")?.children.length) readForm();
  uiLanguage = lang; localStorage.setItem("ensLanguage", lang);
  document.documentElement.lang = lang;
  $("languageButton").textContent = lang === "es" ? "EN" : "ES";
  // Re-render dynamic control labels and apply translations to stable UI text.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node; while ((node = walker.nextNode())) {
    if (!node.__originalText) node.__originalText = node.nodeValue;
    const original = node.__originalText.trim();
    if (lang === "en" && translations[original]) node.nodeValue = node.__originalText.replace(original, translations[original]);
    else if (lang === "es") node.nodeValue = node.__originalText;
  }
  document.querySelectorAll("[placeholder]").forEach(el => {
    if (!el.dataset.esPlaceholder) el.dataset.esPlaceholder = el.placeholder;
    if (lang === "en") el.placeholder = ({"Área / rol":"Department / role", "Contexto, limitaciones o evidencia que falta…":"Context, limitations or missing evidence…", "Buscar control, medida, área o palabra clave":"Search control, measure, area or keyword"})[el.dataset.esPlaceholder] || el.dataset.esPlaceholder;
    else el.placeholder = el.dataset.esPlaceholder;
  });
  if ($("controls") && $("controls").children.length) { renderControls(); populate(); }
  if ($("libraryView") && !$ ("libraryView").hidden) renderLibrary();
}
function setTheme(dark) {
  document.body.classList.toggle("dark-theme", dark);
  localStorage.setItem("ensTheme", dark ? "dark" : "light");
  $("themeButton").textContent = dark ? "☀ Tema" : "☾ Tema";
}
function renderLibrary() {
  const q = ($("librarySearch").value || "").toLocaleLowerCase();
  const area = $("libraryArea").value;
  const items = CONTROLS.filter(c => {
    const x = ctl(c);
    return (!area || x.area === area) && (!q || [x.id,x.ref,x.area,x.name,x.question,...x.evidence].join(" ").toLocaleLowerCase().includes(q));
  }).map(ctl);
  $("libraryCount").textContent = `${items.length} / ${CONTROLS.length} controles`;
  $("libraryControls").innerHTML = items.map(c => `<article class="library-card"><div class="meta"><span class="badge">${esc(c.id)}</span><span class="badge">${esc(c.ref)}</span><span class="priority ${esc(c.priority)}">${esc(uiPriorityLabel(c.priority))}</span><span class="badge">${esc(uiCatName(c.minCategory))}</span><span class="badge">${c.verified ? "Verificada" : "Pendiente de verificar"}</span></div><h3>${esc(c.name)}</h3><p><strong>${esc(c.area)}</strong></p><p>${esc(c.question)}</p><details><summary>${uiLanguage === "en" ? "Expected evidence" : "Evidencias esperadas"}</summary><ul>${c.evidence.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></details><p class="muted">${esc(c.action)}</p></article>`).join("") || `<p class="empty">${uiLanguage === "en" ? "No matching controls." : "No hay controles coincidentes."}</p>`;
}
function openLibrary() {
  document.querySelectorAll(".step").forEach(x => x.classList.remove("active"));
  $("libraryView").hidden = false; $("libraryView").classList.add("active");
  const areas = [...new Set(CONTROLS.map(c=>ctl(c).area))];
  $("libraryArea").innerHTML = `<option value="">${uiLanguage === "en" ? "All areas" : "Todas las áreas"}</option>` + areas.map(a=>`<option>${esc(a)}</option>`).join("");
  renderLibrary(); $("libraryView").querySelector("h2").focus();
}

/* ---------- Toasts (sustituyen a alert) ---------- */
let toastTimer = null;
function toast(msg, type) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + (type || "info");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = "toast"; }, 4500);
}

/* ---------- Navegación ---------- */
function next(n) {
  if ($("libraryView")) { $("libraryView").hidden = true; $("libraryView").classList.remove("active"); }
  $("main").classList.toggle("on-home", n === 0);
  if (n === 0) refreshHome();
  document.querySelectorAll(".step").forEach((s) => s.classList.remove("active"));
  $("step" + n).classList.add("active");
  document.querySelectorAll(".steps span").forEach((s) => {
    const on = +s.dataset.step === n;
    s.classList.toggle("active", on);
    if (on) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current");
  });
  const pct = Math.max(0, Math.round(((n - 1) / 3) * 100));
  $("progressFill").style.width = pct + "%";
  $("progressBar").setAttribute("aria-valuenow", String(pct));
  if (n === 3) { readForm(); refreshCategoryTags(); applyFilters(); updateAnswered(); }
  window.scrollTo({ top: 0, behavior: "smooth" });
  const h = $("step" + n).querySelector("h2");
  if (h) h.focus({ preventScroll: true });
}

/* Paso 1: nombre y tipo obligatorios. */
function goToStep2() {
  const errors = {
    orgName: $("orgName").value.trim() ? "" : "Indica el nombre de la organización.",
    orgType: $("orgType").value ? "" : "Selecciona un tipo de organización."
  };
  let firstInvalid = null;
  Object.entries(errors).forEach(([id, msg]) => {
    $("err-" + id).textContent = msg;
    $(id).classList.toggle("invalid", !!msg);
    $(id).setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg && !firstInvalid) firstInvalid = id;
  });
  if (firstInvalid) { $(firstInvalid).focus(); return; }
  next(2);
}

/* ---------- Render de controles ---------- */
function renderControls() {
  const areas = [...new Set(CONTROLS.map((c) => ctl(c).area))];
  $("filterArea").innerHTML = `<option value="">${uiLanguage === "en" ? "All areas" : "Todas las áreas"}</option>` + areas.map((a) => `<option>${esc(a)}</option>`).join("");

  $("controls").innerHTML = CONTROLS.map((raw) => { const c = ctl(raw); return `
  <article class="control-card" data-card="${esc(c.id)}" data-area="${esc(c.area)}" data-priority="${esc(c.priority)}">
    <div class="control-top"><span class="badge">${esc(c.ref)}</span><span class="area">${esc(c.area)}</span><span class="priority ${esc(c.priority)}">${esc(uiPriorityLabel(c.priority))}</span><span class="cat-tag" data-cattag="${esc(c.id)}" hidden></span></div>
    <h3>${esc(c.name)}</h3><p>${esc(c.question)}</p>
    <fieldset><legend class="sr-only">${uiLanguage === "en" ? "Control status: " : "Estado del control: "}${esc(c.name)}</legend>
    <div class="status-row">
      ${L.STATUSES.map((v) => `<label><input type="radio" name="${esc(c.id)}" value="${v}">${uiStatusLabel(v)}</label>`).join("")}
    </div>
    </fieldset>
    <div class="subgrid">
      <label>${uiLanguage === "en" ? "Available evidence" : "Evidencia disponible"}<select data-evidence="${esc(c.id)}">${L.EVIDENCES.map((v) => `<option value="${v}">${uiEvidenceLabel(v)}</option>`).join("")}</select></label>
      <label>${uiLanguage === "en" ? "Owner" : "Responsable"}<input data-owner="${esc(c.id)}" placeholder="Área / rol"></label>
      <label>${uiLanguage === "en" ? "Target date" : "Fecha objetivo"}<input type="date" data-date="${esc(c.id)}"></label>
      <label>${uiLanguage === "en" ? "Action status" : "Estado de la acción"}<select data-astatus="${esc(c.id)}">${L.ACTION_STATES.map((v) => `<option value="${v}">${uiActionLabel(v)}</option>`).join("")}</select></label>
      <label>${uiLanguage === "en" ? "Effort" : "Esfuerzo"}<select data-effort="${esc(c.id)}"><option value="">—</option><option value="S">${uiLanguage === "en" ? "Low (S)" : "Bajo (S)"}</option><option value="M">${uiLanguage === "en" ? "Medium (M)" : "Medio (M)"}</option><option value="L">${uiLanguage === "en" ? "High (L)" : "Alto (L)"}</option></select></label>
    </div>
    <details><summary>${uiLanguage === "en" ? "Expected evidence" : "Evidencias esperadas"}</summary><ul>${c.evidence.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></details>
    <label>${uiLanguage === "en" ? "Notes" : "Observaciones"}<textarea data-notes="${esc(c.id)}" placeholder="Contexto, limitaciones o evidencia que falta…"></textarea></label>
  </article>`; }).join("");
}

/* ---------- Formulario <-> estado ---------- */
function readForm() {
  state.org = { name: $("orgName").value, type: $("orgType").value, sector: $("sector").value, size: $("size").value, service: $("service").value, publicRelation: $("publicRelation").value };
  state.context = {
    publicContract: document.querySelector('input[name="publicContract"]:checked')?.value || "no_sabe",
    availability: $("availability").value, confidentiality: $("confidentiality").value, integrity: $("integrity").value,
    info: [...$("infoType").selectedOptions].map((x) => x.value)
  };
  state.options = { excludeAboveCategory: $("excludeAbove").checked };
  CONTROLS.forEach((c) => {
    const checked = document.querySelector(`input[name="${c.id}"]:checked`);
    if (checked) state.answers[c.id] = checked.value; else delete state.answers[c.id];
    state.evidence[c.id] = field("evidence", c.id)?.value || "ninguna";
    state.actions[c.id] = L.normalizeAction({
      owner: field("owner", c.id)?.value, date: field("date", c.id)?.value, notes: field("notes", c.id)?.value,
      status: field("astatus", c.id)?.value, effort: field("effort", c.id)?.value
    });
  });
}

function populate() {
  const o = state.org || {}, c = state.context || {};
  $("orgName").value = o.name || ""; $("orgType").value = o.type || ""; $("sector").value = o.sector || "";
  $("size").value = o.size || "Micro / pequeña"; $("service").value = o.service || ""; $("publicRelation").value = o.publicRelation || "";
  $("availability").value = c.availability || "bajo"; $("confidentiality").value = c.confidentiality || "bajo"; $("integrity").value = c.integrity || "bajo";
  [...$("infoType").options].forEach((x) => { x.selected = (c.info || []).includes(x.value); });
  document.querySelectorAll('input[name="publicContract"]').forEach((el) => { el.checked = el.value === (c.publicContract || "no_sabe"); });
  $("excludeAbove").checked = state.options ? state.options.excludeAboveCategory !== false : true;
  CONTROLS.forEach((x) => {
    document.querySelectorAll(`input[name="${x.id}"]`).forEach((r) => { r.checked = r.value === state.answers[x.id]; });
    const ev = field("evidence", x.id); if (ev) ev.value = state.evidence[x.id] || "ninguna";
    const a = L.normalizeAction(state.actions[x.id]);
    field("owner", x.id).value = a.owner; field("date", x.id).value = a.date; field("notes", x.id).value = a.notes;
    field("astatus", x.id).value = a.status; field("effort", x.id).value = a.effort;
  });
  ["orgName", "orgType"].forEach((id) => { $("err-" + id).textContent = ""; $(id).classList.remove("invalid"); $(id).removeAttribute("aria-invalid"); });
  refreshCategoryTags(); applyFilters(); updateAnswered();
}

/* ---------- Filtros, progreso y etiquetas de categoría ---------- */
function updateAnswered() {
  const total = CONTROLS.length;
  const done = CONTROLS.filter((c) => document.querySelector(`input[name="${c.id}"]:checked`)).length;
  $("answeredCount").textContent = `${done} de ${total} controles respondidos`;
}
function applyFilters() {
  const area = $("filterArea").value, prio = $("filterPriority").value, onlyOpen = $("filterUnanswered").checked;
  let visible = 0;
  document.querySelectorAll(".control-card").forEach((card) => {
    const id = card.dataset.card;
    const answered = !!document.querySelector(`input[name="${id}"]:checked`);
    const show = (!area || card.dataset.area === area) && (!prio || card.dataset.priority === prio) && (!onlyOpen || !answered);
    card.hidden = !show;
    if (show) visible++;
  });
  $("noResults").hidden = visible > 0;
}
function refreshCategoryTags() {
  const cat = L.categoryKey({ availability: $("availability").value, confidentiality: $("confidentiality").value, integrity: $("integrity").value });
  const exclude = $("excludeAbove").checked;
  $("currentCategory").textContent = L.CATEGORY_LABEL[cat];
  CONTROLS.forEach((c) => {
    const tag = field("cattag", c.id), card = document.querySelector(`[data-card="${c.id}"]`);
    const above = (CATEGORY_ORDER[c.minCategory] || 1) > CATEGORY_ORDER[cat];
    tag.hidden = c.minCategory === "basica";
    tag.textContent = (uiLanguage === "en" ? "From category " : "Desde categoría ") + uiCatName(c.minCategory);
    card.classList.toggle("out-of-cat", above && exclude);
  });
}

/* ---------- Opciones de cálculo ---------- */
const calcOpts = () => ({ excludeAboveCategory: !!state.options?.excludeAboveCategory });

/* ---------- Informe ---------- */
function planType(c, groups) {
  if (groups.gaps.includes(c)) return { key: "gap", label: "Gap" };
  if (groups.uncertain.includes(c)) return { key: "validar", label: "Validar (No sé)" };
  return { key: "evidencia", label: "Declarado sin evidencia" };
}

function generateReport() {
  readForm();
  const opts = calcOpts(), today = todayISO();
  const app = L.applicability(state.org, state.context);
  const cat = L.categoryKey(state.context), warnings = L.categoryWarnings(state.context);
  const sc = L.score(CONTROLS, state, opts), vs = L.verifiedScore(CONTROLS, state, opts), es = L.evidenceScore(CONTROLS, state, opts);
  const groups = L.classify(CONTROLS, state, opts);
  const plan = L.sortPlan([...groups.gaps, ...groups.uncertain, ...groups.noEvidence], state);
  const open = plan.filter((c) => state.actions[c.id].status !== "hecho");
  const highOpen = open.filter((c) => c.priority === "alta").length;
  const noOwner = open.filter((c) => !state.actions[c.id].owner.trim()).length;
  const overdue = open.filter((c) => L.isOverdue(state.actions[c.id], today)).length;
  const unanswered = CONTROLS.filter((c) => state.answers[c.id] === undefined).length;
  const areas = L.areaBreakdown(CONTROLS, state, opts);

  $("reportMeta").textContent = `${state.org.name || "Organización"} · ${new Date().toLocaleDateString("es-ES")} · ${exampleMode ? "EJEMPLO con datos ficticios" : "Evaluación orientativa"} · Catálogo v${CATALOG_VERSION}`;
  document.title = exampleMode ? "ENS Readiness — Ejemplo" : `ENS Readiness — ${state.org.name || "Informe"}`;

  const kpi = (label, val) => `<div><small>${label}</small><strong>${val}</strong></div>`;
  const planHTML = plan.map((c) => {
    const a = state.actions[c.id], t = planType(c, groups);
    const done = a.status === "hecho", late = L.isOverdue(a, today);
    return `<div class="action ${done ? "done" : ""}">
      <div class="action-head"><span class="badge">${esc(c.id)}</span><span class="priority ${esc(c.priority)}">${esc(c.priority)}</span><span class="type-tag ${t.key}">${t.label}</span><span class="state-tag">${ACTION_LABEL[a.status]}</span>${a.effort ? `<span class="state-tag">Esfuerzo ${a.effort}</span>` : ""}${late ? '<span class="warn-tag">Vencida</span>' : ""}${!a.owner.trim() && !done ? '<span class="warn-tag">Sin responsable</span>' : ""}</div>
      <h4>${esc(c.name)} <small>${esc(c.ref)}</small></h4><p>${esc(c.action)}</p>
      ${RECOMMENDATIONS[c.priority] ? `<p class="recommendation">${esc(RECOMMENDATIONS[c.priority])}</p>` : ""}
      <p><strong>Evidencia esperada:</strong> ${c.evidence.map(esc).join(" · ")} <em>(declarada: ${EVIDENCE_LABEL[L.EVIDENCES.includes(state.evidence[c.id]) ? state.evidence[c.id] : "ninguna"]})</em></p>
      <p><strong>Responsable:</strong> ${esc(a.owner) || "Pendiente"} · <strong>Fecha:</strong> ${esc(a.date) || "Pendiente"}</p>
      ${a.notes.trim() ? `<p class="notes"><strong>Observaciones:</strong> ${esc(a.notes)}</p>` : ""}
    </div>`;
  }).join("");

  $("report").innerHTML = `
  <div class="kpis">
    ${kpi("READINESS DECLARADO", sc + "%")}${kpi("READINESS VERIFICABLE", vs + "%")}${kpi("EVIDENCE READINESS", es + "%")}
    ${kpi("GAPS", groups.gaps.length)}${kpi("POR VALIDAR", groups.uncertain.length)}${kpi("ALTA PRIORIDAD ABIERTA", highOpen)}
  </div>
  ${unanswered ? `<div class="notice warn" role="note">${unanswered} control(es) sin responder se han tratado como «No sé». Vuelve al assessment para completarlos.</div>` : ""}
  <div class="grid2">
    <div class="card"><h3>Aplicabilidad ENS</h3><div class="big-status">${esc(app.label)}</div><p><strong>Confianza:</strong> ${esc(app.confidence)}</p><p>${esc(app.reason)}</p></div>
    <div class="card"><h3>Categoría preliminar</h3><div class="big-status">${esc(L.CATEGORY_LABEL[cat])}</div><p>Resultado orientativo basado en los impactos declarados. La categorización formal requiere aplicar el marco y alcance correspondientes.</p>
      ${warnings.map((w) => `<p class="notice warn">${esc(w)}</p>`).join("")}
      ${groups.outOfCategory.length ? `<p><small>${groups.outOfCategory.length} control(es) exigibles solo en categorías superiores se han excluido del cálculo.</small></p>` : ""}</div>
  </div>
  <div class="card"><h3>Lectura GRC</h3>
    <p><strong>${sc}%</strong> readiness declarado (ponderado por prioridad).</p><div class="bar"><span data-w="${sc}"></span></div>
    <p><strong>${vs}%</strong> readiness verificable: cada control cuenta solo hasta donde lo respalda su evidencia.</p><div class="bar verified"><span data-w="${vs}"></span></div>
    <p><strong>${es}%</strong> evidence readiness. Un control implementado sin evidencia suficiente es una señal de preparación insuficiente para una revisión${groups.noEvidence.length ? ` (${groups.noEvidence.length} control(es) marcados «Sí» sin evidencia)` : ""}.</p><div class="bar evidence"><span data-w="${es}"></span></div>
    <p><small>Ninguna de estas cifras equivale a un porcentaje de cumplimiento ENS.</small></p></div>
  <div class="card"><h3>Readiness por área</h3><div class="area-bars">${areas.map((a) => `<div class="area-row"><span>${esc(a.area)} <small>(${a.count})</small></span><div class="bar"><span data-w="${a.score}"></span></div><strong>${a.score}%</strong></div>`).join("") || "<p>Sin áreas evaluables.</p>"}</div></div>
  <div class="card"><h3>Plan de acción</h3>
    <p class="plan-summary"><strong>${open.length}</strong> abiertas · <strong>${noOwner}</strong> sin responsable · <strong>${overdue}</strong> vencidas</p>
    ${plan.length ? planHTML : "<p>Sin acciones pendientes según las respuestas actuales.</p>"}</div>
  <div class="card"><h3>Metodología y límites</h3><ul><li>El assessment es una herramienta de readiness, no una auditoría.</li><li>Las respuestas «No sé» se tratan como incertidumbre y no como cumplimiento.</li><li>Las referencias a medidas del ENS son orientativas y deben contrastarse con el RD 311/2022 y las guías CCN-STIC.</li><li>La puntuación es interna al assessment y no debe presentarse como porcentaje oficial de cumplimiento ENS.</li><li>La aplicabilidad y categorización deben validarse sobre el alcance real del sistema y la normativa aplicable.</li></ul></div>`;

  // Anchuras vía CSSOM (compatible con CSP sin 'unsafe-inline' en style-src).
  document.querySelectorAll("#report [data-w]").forEach((el) => { el.style.width = el.dataset.w + "%"; });
  state.generated = true;
  next(4);
}

/* ---------- Persistencia ---------- */
function markSaved(label) {
  dirty = false;
  const ind = $("saveIndicator");
  ind.textContent = label; ind.classList.remove("dirty");
}
function markDirty() {
  if (exampleMode) return;
  dirty = true;
  const ind = $("saveIndicator");
  ind.textContent = "Cambios sin guardar"; ind.classList.add("dirty");
}
function storeNow() {
  readForm();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
}
function saveAssessment() {
  if (exampleMode) { toast("Estás en el modo ejemplo: no se guarda. Pulsa «Salir del ejemplo» para empezar la tuya.", "info"); return; }
  if (storeNow()) { markSaved("Guardado " + fmtTime()); toast("Evaluación guardada en este navegador.", "ok"); }
  else toast("No se pudo guardar: el navegador bloquea el almacenamiento local. Usa «Exportar JSON».", "error");
}
function scheduleAutosave() {
  if (exampleMode) return;
  markDirty();
  if (draftPending) return; // no sobrescribir un borrador pendiente de decisión
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => { if (storeNow()) markSaved("Autoguardado " + fmtTime()); }, 800);
}
function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) { return null; }
}
function loadAssessment() {
  const s = readStored();
  if (!s) { toast("No hay una evaluación guardada.", "info"); return; }
  // Se pasa por la misma validación que una importación.
  const { state: clean } = L.importPayload({
    organization: s.org, context: s.context, options: s.options,
    assessment: CONTROLS.filter((c) => (s.answers || {})[c.id] !== undefined || (s.evidence || {})[c.id] || (s.actions || {})[c.id])
      .map((c) => ({ id: c.id, status: (s.answers || {})[c.id], evidence: (s.evidence || {})[c.id], action: (s.actions || {})[c.id] }))
  }, CONTROLS);
  clean.options = { excludeAboveCategory: s.options ? s.options.excludeAboveCategory !== false : true };
  setExampleMode(false);
  state = clean;
  populate();
  markSaved("Cargado desde este navegador");
  toast("Evaluación cargada.", "ok");
}
function checkDraft() {
  const s = readStored();
  if (!s || !(s.org && (s.org.name || Object.keys(s.answers || {}).length))) return;
  draftPending = true;
  $("draftName").textContent = s.org && s.org.name ? `«${s.org.name}»` : "sin nombre";
  $("draftCard").hidden = false;
}
function resolveDraft(recover) {
  draftPending = false;
  $("draftCard").hidden = true;
  if (recover) { loadAssessment(); next(1); }
  else { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* sin acceso */ } toast("Borrador descartado.", "info"); }
}

/* ---------- Exportación / importación ---------- */
function download(content, filename, type) {
  const blob = new Blob([content], { type }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportJSON() {
  readForm();
  const payload = {
    schema: ENS_PROJECT_SCHEMA.schema, version: ENS_PROJECT_SCHEMA.version,
    framework: { name: "ENS", version: "RD 311/2022", catalogVersion: CATALOG_VERSION, refsVerified: false },
    generatedAt: new Date().toISOString(),
    organization: state.org, context: state.context, options: state.options,
    category: L.categoryKey(state.context),
    assessment: CONTROLS.map((c) => ({ id: c.id, ref: c.ref, status: state.answers[c.id] || "no_sabe", evidence: state.evidence[c.id], action: state.actions[c.id] }))
  };
  download(JSON.stringify(payload, null, 2), "ens-project.json", "application/json");
  markSaved("Exportado " + fmtTime());
}
function importJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let payload;
    try { payload = JSON.parse(reader.result); } catch (e) { toast("El fichero seleccionado no es un JSON válido.", "error"); return; }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) { toast("El JSON no tiene el formato esperado.", "error"); return; }
    if (payload.schema && payload.schema !== ENS_PROJECT_SCHEMA.schema &&
        !confirm(`El fichero declara el esquema "${payload.schema}" (se esperaba "${ENS_PROJECT_SCHEMA.schema}"). ¿Importar de todas formas?`)) return;
    try {
      const { state: s, summary } = L.importPayload(payload, CONTROLS);
      s.options = { excludeAboveCategory: !payload.options || payload.options.excludeAboveCategory !== false };
      setExampleMode(false);
      state = s;
      populate();
      markDirty();
      const extra = [];
      if (summary.unknown) extra.push(`${summary.unknown} control(es) desconocidos ignorados`);
      if (summary.invalid) extra.push(`${summary.invalid} valor(es) no válidos sustituidos por el valor por defecto`);
      toast(`Importados ${summary.imported} de ${CONTROLS.length} controles.` + (extra.length ? " " + extra.join("; ") + "." : ""), extra.length ? "warn" : "ok");
    } catch (e) { toast("No se pudo importar el fichero: formato no válido.", "error"); }
  };
  reader.onerror = () => toast("No se pudo leer el fichero.", "error");
  reader.readAsText(file);
}

/* CSV del plan de acción (separador ';' y BOM para abrir bien en Excel en español). */
function csvCell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita inyección de fórmulas
  return '"' + s.replace(/"/g, '""') + '"';
}
function exportCSV() {
  readForm();
  const groups = L.classify(CONTROLS, state, calcOpts());
  const plan = L.sortPlan([...groups.gaps, ...groups.uncertain, ...groups.noEvidence], state);
  const head = ["ID", "Referencia", "Área", "Control", "Prioridad", "Tipo", "Estado control", "Evidencia", "Responsable", "Fecha objetivo", "Estado acción", "Esfuerzo", "Observaciones", "Acción recomendada"];
  const rows = plan.map((c) => {
    const a = state.actions[c.id];
    return [c.id, c.ref, c.area, c.name, c.priority, planType(c, groups).label, STATUS_LABEL[state.answers[c.id] || "no_sabe"], EVIDENCE_LABEL[state.evidence[c.id]] || "Ninguna", a.owner, a.date, ACTION_LABEL[a.status], a.effort, a.notes, c.action];
  });
  const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
  download(csv, "ens-plan-de-accion.csv", "text/csv;charset=utf-8");
  toast(`Plan exportado (${rows.length} acciones).`, "ok");
}

/* ---------- Eventos ---------- */
/* ---------- Inicio / menú ---------- */
const hasWork = () => $("orgName").value.trim() !== "" || CONTROLS.some((c) => document.querySelector(`input[name="${c.id}"]:checked`));
function refreshHome() {
  const work = hasWork();
  $("resumeCard").hidden = !work;
  if (work) $("resumeName").textContent = ($("orgName").value.trim() || "Evaluación sin nombre") + (exampleMode ? " (ejemplo)" : "");
}
/* Evita sobrescribir sin querer un borrador o una evaluación en curso. */
function confirmReplace() {
  if (exampleMode) return true;
  if (draftPending) {
    if (!confirm("Hay un borrador guardado en este navegador que se sobrescribirá. ¿Continuar?")) return false;
    draftPending = false; $("draftCard").hidden = true;
  } else if (hasWork() && !confirm("Se descartará la evaluación actual. ¿Continuar?")) return false;
  return true;
}
function setExampleMode(on) {
  exampleMode = on;
  $("exampleBar").hidden = !on;
  document.title = on ? "ENS Readiness Assistant — Ejemplo" : "ENS Readiness Assistant v2 — GRC";
}
function startNew() {
  if (!confirmReplace()) return;
  setExampleMode(false);
  state = newState(); populate(); markSaved("Sin guardar");
  next(1); $("orgName").focus();
}
function exitExample() {
  setExampleMode(false);
  state = newState(); populate(); markSaved("Sin guardar");
  next(0);
  toast("Has salido del ejemplo.", "info");
}
/* Carga una empresa ficticia en el formulario y lleva al paso 1 (no salta al resultado). */
function demo() {
  // Solo se pide confirmación si hay trabajo real en pantalla (el borrador guardado no se toca).
  if (!exampleMode && hasWork() && !confirm("Se sustituirá la evaluación en pantalla por el ejemplo. Tu borrador guardado no se modifica. ¿Continuar?")) return;
  clearTimeout(autosaveTimer);
  const E = EXAMPLE_CASE;
  const { state: s } = L.importPayload({
    organization: E.org, context: E.context,
    assessment: CONTROLS.map((c) => {
      const [status, evidence, owner, date, notes, astatus, effort] = E.controls[c.id] || ["no_sabe", "ninguna", "", "", "", "pendiente", ""];
      return { id: c.id, status, evidence, action: { owner, date, notes, status: astatus, effort } };
    })
  }, CONTROLS);
  s.options = { excludeAboveCategory: true };
  state = s; populate();
  setExampleMode(true);
  markSaved("Modo ejemplo");
  next(1);
  toast("Ejemplo cargado: Tecnosur Servicios Digitales (ficticia). Pulsa «Continuar» en cada paso para recorrerlo.", "info");
}
function toggleGuide(btn) {
  const panel = $("guidePanel"), open = panel.hidden;
  panel.hidden = !open; btn.setAttribute("aria-expanded", String(open));
  if (open) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const ACTIONS = {
  home: () => { $("libraryView").hidden = true; next(0); }, library: openLibrary, theme: () => setTheme(!document.body.classList.contains("dark-theme")), language: () => setLanguage(uiLanguage === "es" ? "en" : "es"), start: startNew, "exit-example": exitExample, resume: () => next(1), demo, "toggle-guide": null,
  save: saveAssessment, load: loadAssessment, "export-json": exportJSON, "export-csv": exportCSV,
  "import-json": () => $("importFile").click(), print: () => window.print(),
  go2: goToStep2, back1: () => next(1), go3: () => next(3), back2: () => next(2), generate: generateReport,
  "recover-draft": () => resolveDraft(true), "discard-draft": () => resolveDraft(false)
};

document.addEventListener("DOMContentLoaded", () => {
  renderControls();
  setTheme(localStorage.getItem("ensTheme") === "dark");
  setLanguage(uiLanguage);
  $("librarySearch").addEventListener("input", renderLibrary);
  $("libraryArea").addEventListener("change", renderLibrary);
  $("progressFill").style.width = "0%";

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
      if (!btn) return;
    if (btn.dataset.action === "toggle-guide") toggleGuide(btn);
    else if (ACTIONS[btn.dataset.action]) ACTIONS[btn.dataset.action]();
  });
  $("importFile").addEventListener("change", (e) => { importJSON(e.target.files[0]); e.target.value = ""; });

  const main = document.querySelector("main");
  main.addEventListener("input", (e) => {
    if (e.target.closest(".filters")) return;
    scheduleAutosave();
    if (e.target.type === "radio") { updateAnswered(); applyFilters(); }
  });
  main.addEventListener("change", (e) => {
    if (e.target.closest(".filters")) { applyFilters(); if (e.target.id === "excludeAbove") { state.options = { excludeAboveCategory: e.target.checked }; refreshCategoryTags(); scheduleAutosave(); } return; }
    if (["availability", "confidentiality", "integrity"].includes(e.target.id)) refreshCategoryTags();
    scheduleAutosave();
  });
  $("filterArea").addEventListener("input", applyFilters);
  $("filterPriority").addEventListener("input", applyFilters);

  checkDraft();
});
window.addEventListener("beforeunload", (e) => {
  if (!dirty) return;
  e.preventDefault();
  e.returnValue = "";
});
