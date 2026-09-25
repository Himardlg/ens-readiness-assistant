let state = {answers:{}, evidence:{}, actions:{}, generated:false};
let dirty = false;

function $(id){return document.getElementById(id);}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

/* ---------- Navigation ---------- */
function next(n){
  document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));
  $("step"+n).classList.add("active");
  document.querySelectorAll(".steps span").forEach(s=>s.classList.toggle("active",+s.dataset.step===n));
  $("progressFill").style.width=((n-1)/3*100)+"%";
  window.scrollTo({top:0,behavior:"smooth"});
}

/* Step 1 requires an organization name and type before moving on,
   otherwise the report is generated with an empty/unknown organization. */
function goToStep2(){
  const errors = {
    orgName: $("orgName").value.trim() ? "" : "Indica el nombre de la organización.",
    orgType: $("orgType").value ? "" : "Selecciona un tipo de organización."
  };
  let firstInvalid = null;
  Object.entries(errors).forEach(([id,msg])=>{
    $("err-"+id).textContent = msg;
    $(id).classList.toggle("invalid", !!msg);
    if(msg && !firstInvalid) firstInvalid = id;
  });
  if(firstInvalid){ $(firstInvalid).focus(); return; }
  next(2);
}

/* ---------- Rendering ---------- */
function renderControls(){
  $("controls").innerHTML=CONTROLS.map((c,i)=>`
  <article class="control-card">
    <div class="control-top"><span class="badge">${c.ref}</span><span class="area">${c.area}</span><span class="priority ${c.priority}">${c.priority}</span></div>
    <h3>${c.name}</h3><p>${c.question}</p>
    <fieldset><legend class="sr-only">Estado del control: ${esc(c.name)}</legend>
    <div class="status-row">
      ${["si","parcial","no","no_sabe","na"].map(v=>`<label><input type="radio" name="${c.id}" value="${v}" ${v==="no_sabe"?"checked":""}>${({si:"Sí",parcial:"Parcialmente",no:"No",no_sabe:"No sé",na:"No aplica"})[v]}</label>`).join("")}
    </div>
    </fieldset>
    <div class="subgrid">
      <label>Evidencia disponible<select data-evidence="${c.id}"><option value="ninguna">Ninguna</option><option value="parcial">Parcial</option><option value="suficiente">Suficiente</option></select></label>
      <label>Responsable<input data-owner="${c.id}" placeholder="Área / rol"></label>
      <label>Fecha objetivo<input type="date" data-date="${c.id}"></label>
    </div>
    <details><summary>Evidencias esperadas</summary><ul>${c.evidence.map(e=>`<li>${e}</li>`).join("")}</ul></details>
    <label>Observaciones<textarea data-notes="${c.id}" placeholder="Contexto, limitaciones o evidencia que falta…"></textarea></label>
  </article>`).join("");
}

/* ---------- Form <-> state ---------- */
function readForm(){
  state.org={name:$("orgName").value,type:$("orgType").value,sector:$("sector").value,size:$("size").value,service:$("service").value,publicRelation:$("publicRelation").value};
  state.context={publicContract:document.querySelector('input[name="publicContract"]:checked')?.value||"no_sabe",availability:$("availability").value,confidentiality:$("confidentiality").value,integrity:$("integrity").value,info:[...$("infoType").selectedOptions].map(x=>x.value)};
  CONTROLS.forEach(c=>{
    state.answers[c.id]=document.querySelector(`input[name="${c.id}"]:checked`)?.value||"no_sabe";
    state.evidence[c.id]=$(`[data-evidence="${c.id}"]`)?.value||"ninguna";
    state.actions[c.id]={owner:$(`[data-owner="${c.id}"]`)?.value||"",date:$(`[data-date="${c.id}"]`)?.value||"",notes:$(`[data-notes="${c.id}"]`)?.value||""};
  });
}
function populate(){
  const o=state.org||{}, c=state.context||{};$("orgName").value=o.name||"";$("orgType").value=o.type||"";$("sector").value=o.sector||"";$("size").value=o.size||"Micro / pequeña";$("service").value=o.service||"";$("publicRelation").value=o.publicRelation||"";
  $("availability").value=c.availability||"bajo";$("confidentiality").value=c.confidentiality||"bajo";$("integrity").value=c.integrity||"bajo";[...$("infoType").options].forEach(x=>x.selected=(c.info||[]).includes(x.value));
  document.querySelectorAll('input[name="publicContract"]').forEach(el=>el.checked=(el.value===(c.publicContract||"no_sabe")));
  CONTROLS.forEach(x=>{const a=document.querySelector(`input[name="${x.id}"][value="${state.answers[x.id]||"no_sabe"}"]`);if(a)a.checked=true;const e=$(`[data-evidence="${x.id}"]`);if(e)e.value=state.evidence[x.id]||"ninguna";const ac=state.actions[x.id]||{};if($(`[data-owner="${x.id}"]`))$(`[data-owner="${x.id}"]`).value=ac.owner||"";if($(`[data-date="${x.id}"]`))$(`[data-date="${x.id}"]`).value=ac.date||"";if($(`[data-notes="${x.id}"]`))$(`[data-notes="${x.id}"]`).value=ac.notes||"";});
  ["orgName","orgType"].forEach(id=>{$("err-"+id).textContent="";$(id).classList.remove("invalid");});
}

/* ---------- Scoring / analysis ---------- */
function applicability(){
  const t=state.org.type, pc=state.context.publicContract;
  if(t==="aapp"||t==="universidad") return {label:"Probablemente aplica",confidence:"alta",reason:"La organización se ha identificado como parte del sector público. Debe confirmarse el ámbito y alcance concretos."};
  if(t==="proveedor" && pc==="si") return {label:"Probablemente aplica al alcance",confidence:"alta",reason:"Se ha indicado una prestación/relación con el sector público. Debe concretarse el sistema y servicio afectado."};
  if(pc==="no_sabe") return {label:"Requiere revisión",confidence:"baja",reason:"No hay información suficiente para concluir aplicabilidad de forma fiable."};
  return {label:"No identificada en esta evaluación",confidence:"media",reason:"Con los datos introducidos no se ha identificado una aplicación directa; conviene verificar contrato, servicio y supuesto de aplicación."};
}
function category(){
  const vals=[state.context.availability,state.context.confidentiality,state.context.integrity];
  if(vals.includes("alto")) return "Alta (preliminar)";
  if(vals.includes("medio")) return "Media (preliminar)";
  return "Básica (preliminar)";
}
function score(){
  let earned=0, possible=0;
  CONTROLS.forEach(c=>{
    const a=state.answers[c.id];
    if(a==="na") return;
    possible++;
    if(a==="si") earned+=1;
    else if(a==="parcial") earned+=.5;
  });
  return possible?Math.round(earned/possible*100):0;
}
function evidenceScore(){
  const relevant=CONTROLS.filter(c=>state.answers[c.id]!=="na");
  if(!relevant.length)return 0;
  const pts={ninguna:0,parcial:.5,suficiente:1};
  return Math.round(relevant.reduce((s,c)=>s+(pts[state.evidence[c.id]]||0),0)/relevant.length*100);
}

/* ---------- Report ---------- */
function generateReport(){
  readForm();
  const app=applicability(), sc=score(), es=evidenceScore(), cat=category();
  const gaps=CONTROLS.filter(c=>!["si","na"].includes(state.answers[c.id]));
  const high=gaps.filter(c=>c.priority==="alta").length;
  const areas={}; gaps.forEach(c=>areas[c.area]=(areas[c.area]||0)+1);
  const topAreas=Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0,3);
  $("reportMeta").textContent=`${state.org.name||"Organización"} · ${new Date().toLocaleDateString("es-ES")} · Evaluación orientativa`;
  $("report").innerHTML=`
  <div class="kpis"><div><small>READINESS</small><strong>${sc}%</strong></div><div><small>EVIDENCE READINESS</small><strong>${es}%</strong></div><div><small>GAPS</small><strong>${gaps.length}</strong></div><div><small>ALTA PRIORIDAD</small><strong>${high}</strong></div></div>
  <div class="grid2">
    <div class="card"><h3>Aplicabilidad ENS</h3><div class="big-status">${app.label}</div><p><strong>Confianza:</strong> ${app.confidence}</p><p>${app.reason}</p></div>
    <div class="card"><h3>Categoría preliminar</h3><div class="big-status">${cat}</div><p>Resultado orientativo basado en los impactos declarados. La categorización formal requiere aplicar el marco y alcance correspondientes.</p></div>
  </div>
  <div class="card"><h3>Lectura GRC</h3><div class="bar"><span style="width:${sc}%"></span></div><p><strong>${sc}%</strong> de readiness sobre las áreas evaluadas. La puntuación no equivale a porcentaje de cumplimiento ENS.</p>
  <div class="bar evidence"><span style="width:${es}%"></span></div><p><strong>${es}%</strong> de evidencia readiness. Tener un control implementado sin evidencia suficiente debe considerarse una señal de preparación insuficiente para una revisión.</p></div>
  <div class="card"><h3>Principales áreas con gaps</h3><div class="area-list">${topAreas.map(([a,n])=>`<div><span>${a}</span><strong>${n}</strong></div>`).join("")||"<p>No se han identificado gaps en las áreas evaluadas.</p>"}</div></div>
  <div class="card"><h3>Plan de acción inicial</h3>${gaps.length?gaps.map((c,i)=>`
    <div class="action"><div><span class="badge">${c.id}</span><span class="priority ${c.priority}">${c.priority}</span></div>
    <h4>${c.name} <small>${c.ref}</small></h4><p>${c.action}</p>
    ${typeof RECOMMENDATIONS!=="undefined" && RECOMMENDATIONS[c.priority] ? `<p class="recommendation">${RECOMMENDATIONS[c.priority]}</p>` : ""}
    <p><strong>Evidencia esperada:</strong> ${c.evidence.join(" · ")}</p>
    <p><strong>Responsable:</strong> ${esc(state.actions[c.id].owner)||"Pendiente"} · <strong>Fecha:</strong> ${esc(state.actions[c.id].date)||"Pendiente"}</p>
    </div>`).join(""):"<p>Sin acciones pendientes según las respuestas actuales.</p>"}</div>
  <div class="card"><h3>Metodología y límites</h3><ul><li>El assessment es una herramienta de readiness, no una auditoría.</li><li>Las respuestas “No sé” se tratan como incertidumbre y no como cumplimiento.</li><li>La puntuación es interna al assessment y no debe presentarse como porcentaje oficial de cumplimiento ENS.</li><li>La aplicabilidad y categorización deben validarse sobre el alcance real del sistema y la normativa aplicable.</li></ul></div>`;
  state.generated=true; next(4);
}

/* ---------- Persistence: localStorage ---------- */
function markSaved(label){
  dirty=false;
  const ind=$("saveIndicator");
  if(ind){ind.textContent=label;ind.classList.remove("dirty");}
}
function markDirty(){
  dirty=true;
  const ind=$("saveIndicator");
  if(ind){ind.textContent="Cambios sin guardar";ind.classList.add("dirty");}
}
function saveAssessment(){
  readForm();
  localStorage.setItem("ensReadinessV2",JSON.stringify(state));
  markSaved("Guardado "+new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
  alert("Evaluación guardada en este navegador.");
}
function loadAssessment(){
  const raw=localStorage.getItem("ensReadinessV2");
  if(!raw){alert("No hay una evaluación guardada.");return;}
  try{
    state=JSON.parse(raw);
    populate();
    markSaved("Cargado desde este navegador");
    alert("Evaluación cargada.");
  }catch(e){
    alert("No se pudo cargar la evaluación guardada: el contenido no es válido.");
  }
}

/* ---------- Import / export JSON (round trip) ---------- */
function exportJSON(){
  readForm();
  const payload={
    schema: (typeof ENS_PROJECT_SCHEMA!=="undefined" && ENS_PROJECT_SCHEMA.schema) || "ens-project",
    version: (typeof ENS_PROJECT_SCHEMA!=="undefined" && ENS_PROJECT_SCHEMA.version) || "0.1",
    framework:{name:"ENS",version:"RD 311/2022"},
    generatedAt:new Date().toISOString(),
    organization:state.org,
    context:state.context,
    assessment:CONTROLS.map(c=>({id:c.id,ref:c.ref,status:state.answers[c.id],evidence:state.evidence[c.id],action:state.actions[c.id]}))
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ens-project.json";a.click();URL.revokeObjectURL(a.href);
  markSaved("Exportado "+new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
}
function importJSON(file){
  if(!file) return;
  const expectedSchema=(typeof ENS_PROJECT_SCHEMA!=="undefined" && ENS_PROJECT_SCHEMA.schema) || "ens-project";
  const reader=new FileReader();
  reader.onload=()=>{
    let payload;
    try{ payload=JSON.parse(reader.result); }
    catch(e){ alert("El fichero seleccionado no es un JSON válido."); return; }
    if(payload.schema && payload.schema!==expectedSchema){
      if(!confirm(`El fichero declara el esquema "${payload.schema}" (se esperaba "${expectedSchema}"). ¿Importar de todas formas?`)) return;
    }
    state={
      answers:{}, evidence:{}, actions:{}, generated:false,
      org: payload.organization || {},
      context: payload.context || {}
    };
    (payload.assessment||[]).forEach(item=>{
      state.answers[item.id]=item.status||"no_sabe";
      state.evidence[item.id]=item.evidence||"ninguna";
      state.actions[item.id]=item.action||{owner:"",date:"",notes:""};
    });
    populate();
    markSaved("Importado desde fichero");
    alert("Evaluación importada correctamente.");
  };
  reader.onerror=()=>alert("No se pudo leer el fichero.");
  reader.readAsText(file);
}

function printReport(){window.print();}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded",()=>{
  renderControls();
  $("progressFill").style.width="0%";
  // Track unsaved changes across the whole app so the header indicator
  // and the beforeunload warning stay accurate.
  document.querySelector("main").addEventListener("input",markDirty);
  document.querySelector("main").addEventListener("change",markDirty);
});
window.addEventListener("beforeunload",(e)=>{
  if(!dirty) return;
  e.preventDefault();
  e.returnValue="";
});
