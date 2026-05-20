import { useState, useRef, useCallback } from "react";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

const CHECKLIST_ITEMS = [
  { id: "agua",        label: "Agua (radiador / reserva)",   icon: "💧", category: "Motor" },
  { id: "aceite",      label: "Nivel de aceite",              icon: "🛢️", category: "Motor" },
  { id: "refrigerante",label: "Refrigerante",                 icon: "🌡️", category: "Motor" },
  { id: "luces_del",   label: "Luces delanteras",             icon: "💡", category: "Luces" },
  { id: "luces_tra",   label: "Luces traseras / stop",        icon: "🔴", category: "Luces" },
  { id: "luces_bal",   label: "Balizas / intermitentes",      icon: "⚠️", category: "Luces" },
  { id: "cubierta_dd", label: "Cubierta delantera derecha",   icon: "⭕", category: "Cubiertas" },
  { id: "cubierta_di", label: "Cubierta delantera izquierda", icon: "⭕", category: "Cubiertas" },
  { id: "cubierta_td", label: "Cubierta trasera derecha",     icon: "⭕", category: "Cubiertas" },
  { id: "cubierta_ti", label: "Cubierta trasera izquierda",   icon: "⭕", category: "Cubiertas" },
  { id: "carroceria",  label: "Carrocería general",           icon: "🚐", category: "Exterior" },
  { id: "vidrios",     label: "Vidrios y espejos",            icon: "🔲", category: "Exterior" },
  { id: "documentos",  label: "Documentación en regla",       icon: "📄", category: "Admin" },
  { id: "extintor",    label: "Extintor vigente",             icon: "🧯", category: "Seguridad" },
  { id: "cinturones",  label: "Cinturones de seguridad",      icon: "🔒", category: "Seguridad" },
  { id: "frenos",      label: "Frenos (respuesta)",           icon: "🛑", category: "Seguridad" },
];

const CATEGORIES = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];

const VEHICLES = [
  "MEB666-MOV08",
  "JBP033-MOV05",
  "AD518AU-MOV19",
  "ESZ066-MOV14",
  "HVO795-MOV06",
  "AB332IZ-MOV08",
  "MPD331-MOV09",
  "PLG501-MOV02",
  "OEQ501-MOV01",
  "DOP835-MOV11",
  "AH284RJ-MOV21",
  "HWW240-MOV14",
  "HHP896-MOV15",
  "LKY367-MOV04",
  "KLK758",
  "VWK857",
  "OEQ501-MOV (KIA 2500)",
];

const PLAYEROS = [
  "Claudio Borras",
  "Alexander Ponce",
  "Daniel Angeli",
  "Waldo Martinez",
  "Ramiro Delgado",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black:#0d0f14; --panel:#161922; --card:#1e2230; --border:#2a2f3e;
    --accent:#f5a623; --ok:#2ecc71; --nok:#e74c3c; --text:#e8eaf0; --muted:#6b7280; --radius:10px;
  }
  body { font-family:'Barlow',sans-serif; background:var(--black); color:var(--text); min-height:100vh; -webkit-font-smoothing:antialiased; }
  .app { max-width:480px; margin:0 auto; padding:0 0 80px; }
  .header { background:var(--panel); border-bottom:2px solid var(--accent); padding:16px 20px 12px; position:sticky; top:0; z-index:100; }
  .header-top { display:flex; align-items:center; justify-content:space-between; }
  .logo { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:22px; letter-spacing:1px; color:var(--accent); }
  .logo span { color:var(--text); }
  .mode-toggle { display:flex; gap:6px; }
  .mode-btn { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:11px; letter-spacing:1px; text-transform:uppercase; padding:5px 12px; border-radius:20px; border:1.5px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; transition:all .2s; }
  .mode-btn.active { background:var(--accent); color:var(--black); border-color:var(--accent); }
  .section-title { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); padding:20px 20px 8px; }
  .field { padding:0 20px 12px; }
  .field label { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); display:block; margin-bottom:6px; }
  .field select, .field input, .field textarea { width:100%; background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); color:var(--text); font-family:'Barlow',sans-serif; font-size:15px; padding:12px 14px; appearance:none; outline:none; transition:border .2s; }
  .field select:focus, .field input:focus, .field textarea:focus { border-color:var(--accent); }
  .field textarea { resize:none; min-height:80px; }
  .type-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 20px 12px; }
  .type-btn { border:2px solid var(--border); border-radius:var(--radius); background:var(--card); color:var(--muted); font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:14px; letter-spacing:1px; text-transform:uppercase; padding:14px; cursor:pointer; transition:all .2s; text-align:center; }
  .type-btn.active-salida  { border-color:var(--accent); background:rgba(245,166,35,.12); color:var(--accent); }
  .type-btn.active-retorno { border-color:#3b82f6; background:rgba(59,130,246,.12); color:#3b82f6; }
  .rs-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 20px 12px; }
  .rs-btn { border:2px solid var(--border); border-radius:var(--radius); background:var(--card); color:var(--muted); font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:14px; letter-spacing:1px; padding:14px; cursor:pointer; transition:all .2s; text-align:center; }
  .rs-btn.active-av { border-color:#3b82f6; background:rgba(59,130,246,.12); color:#3b82f6; }
  .rs-btn.active-sp { border-color:#a855f7; background:rgba(168,85,247,.12); color:#a855f7; }
  .cat-strip { display:flex; gap:8px; overflow-x:auto; padding:0 20px 14px; scrollbar-width:none; }
  .cat-strip::-webkit-scrollbar { display:none; }
  .cat-chip { flex-shrink:0; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:11px; letter-spacing:1px; text-transform:uppercase; padding:5px 12px; border-radius:20px; border:1.5px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; transition:all .2s; }
  .cat-chip.active { background:var(--accent); color:var(--black); border-color:var(--accent); }
  .check-group { padding:0 20px 4px; }
  .check-item { display:flex; align-items:center; gap:12px; background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:13px 14px; margin-bottom:8px; cursor:pointer; transition:all .15s; user-select:none; }
  .check-item.ok  { border-color:var(--ok);  background:rgba(46,204,113,.08); }
  .check-item.nok { border-color:var(--nok); background:rgba(231,76,60,.08); }
  .check-icon { font-size:20px; width:28px; text-align:center; flex-shrink:0; }
  .check-label { flex:1; font-size:14px; font-weight:500; }
  .check-btns { display:flex; gap:6px; flex-shrink:0; }
  .chk-btn { width:36px; height:36px; border-radius:8px; border:2px solid var(--border); background:transparent; color:var(--muted); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
  .chk-btn.ok-active  { background:var(--ok);  border-color:var(--ok);  color:#fff; }
  .chk-btn.nok-active { background:var(--nok); border-color:var(--nok); color:#fff; }
  .photo-section { padding:0 20px; }
  .photo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:10px; }
  .photo-thumb { aspect-ratio:1; border-radius:8px; overflow:hidden; position:relative; background:var(--card); border:1.5px solid var(--border); }
  .photo-thumb img { width:100%; height:100%; object-fit:cover; }
  .photo-del { position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:rgba(0,0,0,.7); border:none; color:#fff; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .add-photo-btn { width:100%; padding:13px; border:2px dashed var(--border); border-radius:var(--radius); background:transparent; color:var(--muted); font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .add-photo-btn:hover { border-color:var(--accent); color:var(--accent); }
  .progress-wrap { padding:0 20px 16px; }
  .progress-label { display:flex; justify-content:space-between; margin-bottom:6px; }
  .progress-label span { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; letter-spacing:1px; color:var(--muted); }
  .progress-bar { height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
  .progress-fill { height:100%; background:var(--accent); border-radius:3px; transition:width .3s; }
  .submit-wrap { padding:20px; }
  .submit-btn { width:100%; padding:18px; border-radius:var(--radius); border:none; font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:18px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all .2s; }
  .submit-btn.ready    { background:var(--accent); color:var(--black); }
  .submit-btn.disabled { background:var(--border); color:var(--muted); cursor:not-allowed; }
  .submit-btn.loading  { background:var(--accent); color:var(--black); opacity:.7; }
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ok); color:#fff; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:14px; letter-spacing:1px; padding:12px 24px; border-radius:30px; z-index:999; animation:fadeInUp .3s ease; }
  .toast.error { background:var(--nok); }
  @keyframes fadeInUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  .sup-header { padding:20px 20px 0; }
  .sup-title { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:28px; color:var(--text); }
  .sup-sub   { font-size:13px; color:var(--muted); margin-top:2px; }
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:16px 20px; }
  .stat-card { background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:14px 12px; text-align:center; }
  .stat-num  { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:28px; }
  .stat-lbl  { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
  .stat-num.green { color:var(--ok); }
  .stat-num.yellow { color:var(--accent); }
  .stat-num.red   { color:var(--nok); }
  .log-item { background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:14px; margin:0 20px 10px; }
  .log-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:6px; }
  .log-vehicle { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:18px; }
  .log-badges { display:flex; gap:5px; flex-wrap:wrap; justify-content:flex-end; }
  .log-badge { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:11px; letter-spacing:1px; padding:3px 10px; border-radius:20px; text-transform:uppercase; }
  .badge-salida  { background:rgba(245,166,35,.2); color:var(--accent); }
  .badge-retorno { background:rgba(59,130,246,.2); color:#3b82f6; }
  .badge-av { background:rgba(59,130,246,.2); color:#3b82f6; }
  .badge-sp { background:rgba(168,85,247,.2); color:#a855f7; }
  .log-meta { font-size:12px; color:var(--muted); margin-bottom:8px; }
  .log-items { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
  .li-chip { font-size:11px; padding:2px 8px; border-radius:20px; font-weight:600; }
  .li-ok  { background:rgba(46,204,113,.15); color:var(--ok); }
  .li-nok { background:rgba(231,76,60,.15);  color:var(--nok); }
  .log-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .log-empty-icon { font-size:48px; margin-bottom:12px; }
  .log-empty p { font-family:'Barlow Condensed',sans-serif; font-size:16px; letter-spacing:1px; }
  .config-wrap { padding:20px; }
  .config-card { background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:16px; margin-bottom:12px; }
  .config-title { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:var(--accent); margin-bottom:10px; }
  .config-text  { font-size:13px; color:var(--muted); line-height:1.5; }
  .config-input { width:100%; background:var(--panel); border:1.5px solid var(--border); border-radius:8px; color:var(--text); font-size:13px; padding:10px 12px; outline:none; margin-top:8px; }
  .config-input:focus { border-color:var(--accent); }
  .config-btn { width:100%; margin-top:10px; padding:12px; border-radius:8px; border:none; background:var(--accent); color:var(--black); font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:14px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; }
  .step { display:flex; gap:10px; margin-bottom:8px; align-items:flex-start; }
  .step-num { background:var(--accent); color:var(--black); border-radius:50%; width:20px; height:20px; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
  .step p { font-size:12px; color:var(--muted); line-height:1.4; }
  .step a { color:var(--accent); }
  code { background:var(--panel); padding:1px 5px; border-radius:4px; font-size:11px; }
`;

async function callDriveApi(token, endpoint, method = "GET", body = null, isUpload = false) {
  const base = isUpload ? "https://www.googleapis.com/upload" : "https://www.googleapis.com";
  const res = await fetch(`${base}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && !isUpload ? { "Content-Type": "application/json" } : {}) },
    body: body ? (isUpload ? body : JSON.stringify(body)) : null,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`API error ${res.status}: ${err}`); }
  return res.json();
}

async function uploadToDrive(token, name, mimeType, content, parentId) {
  const meta = JSON.stringify({ name, mimeType, parents: parentId ? [parentId] : undefined });
  const boundary = "fleet_boundary_xyz";
  const body =
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n` +
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n${content}\r\n--${boundary}--`;
  return callDriveApi(token, `/drive/v3/files?uploadType=multipart`, "POST",
    new Blob([body], { type: `multipart/related; boundary="${boundary}"` }), true);
}

export default function FleetChecklist() {
  const [view, setView]               = useState("checklist");
  const [token, setToken]             = useState(null);
  const [folderId, setFolderId]       = useState(localStorage.getItem("fc_folder") || "");
  const [sheetId, setSheetId]         = useState(localStorage.getItem("fc_sheet")  || "");
  const [folderInput, setFolderInput] = useState(localStorage.getItem("fc_folder") || "");
  const [sheetInput, setSheetInput]   = useState(localStorage.getItem("fc_sheet")  || "");

  const [tipo, setTipo]               = useState("salida");
  const [razonSocial, setRazonSocial] = useState("");
  const [vehiculo, setVehiculo]       = useState("");
  const [chofer, setChofer]           = useState("");
  const [obs, setObs]                 = useState("");
  const [checks, setChecks]           = useState({});
  const [photos, setPhotos]           = useState([]);
  const [activeCat, setActiveCat]     = useState("All");
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [logs, setLogs]               = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fileRef = useRef();

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const signIn = useCallback(() => {
    const CLIENT_ID = "605714222345-9ff98bnoid8vqd75nl4cqo90afl5vji9.apps.googleusercontent.com";
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin + window.location.pathname,
      response_type: "token",
      scope: SCOPES,
      prompt: "select_account",
      include_granted_scopes: "true",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }, []);

  useState(() => {
    // Parse token from URL hash after Google redirect
    const hash = new URLSearchParams(window.location.hash.replace("#", ""));
    const t = hash.get("access_token");
    if (t) {
      setToken(t);
      // Clean URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  });

  const setCheck = (id, val) => setChecks(c => ({ ...c, [id]: val }));
  const answered = Object.keys(checks).length;
  const total    = CHECKLIST_ITEMS.length;
  const hasNok   = Object.values(checks).some(v => v === "nok");
  const pct      = Math.round((answered / total) * 100);
  const filtered = activeCat === "All" ? CHECKLIST_ITEMS : CHECKLIST_ITEMS.filter(i => i.category === activeCat);

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(p => [...p, { url: ev.target.result, name: f.name }]);
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = async () => {
    if (!vehiculo || !chofer)    { showToast("Completá vehículo y playero", "error"); return; }
    if (!razonSocial)            { showToast("Seleccioná la razón social", "error"); return; }
    if (answered < total)        { showToast(`Faltan ${total - answered} ítems por revisar`, "error"); return; }
    if (!token)                  { showToast("Iniciá sesión con Google primero", "error"); return; }
    if (!folderId || !sheetId)   { showToast("Configurá la carpeta y sheet de Drive", "error"); return; }

    setLoading(true);
    try {
      const now     = new Date();
      const dateStr = now.toLocaleDateString("es-AR");
      const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const nokItems = CHECKLIST_ITEMS.filter(i => checks[i.id] === "nok").map(i => i.label);

      const estadoFinal = hasNok ? "NOK: " + nokItems.join(", ") : "OK - COMPLETO";
      const row = [
        dateStr, timeStr, tipo.toUpperCase(), razonSocial, vehiculo, chofer,
        estadoFinal,
        obs || "-",
        ...CHECKLIST_ITEMS.map(i => checks[i.id]?.toUpperCase() || "-"),
      ];
      await callDriveApi(token, `/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, "POST", { values: [row] });

      const nokHtml = nokItems.length ? `<p style="color:#e74c3c;font-weight:bold">⚠️ NOK: ${nokItems.join(", ")}</p>` : "";
      const photosHtml = photos.map(p => `<img src="${p.url}" style="max-width:200px;max-height:150px;border-radius:6px;margin:4px"/>`).join("");
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Checklist ${tipo} - ${vehiculo} - ${dateStr}</title>
<style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#1a1a1a}
h1{color:#f5a623}table{width:100%;border-collapse:collapse;margin-top:16px}
td,th{border:1px solid #ddd;padding:8px 10px;font-size:13px}th{background:#f5f5f5}
.ok{color:#27ae60;font-weight:bold}.nok{color:#e74c3c;font-weight:bold}</style></head>
<body>
<h1>🚛 CHECKLIST DE FLOTA</h1>
<p><b>Tipo:</b> ${tipo.toUpperCase()} &nbsp;|&nbsp; <b>Fecha:</b> ${dateStr} ${timeStr}</p>
<p><b>Razón Social:</b> ${razonSocial} &nbsp;|&nbsp; <b>Vehículo:</b> ${vehiculo} &nbsp;|&nbsp; <b>Playero:</b> ${chofer}</p>
${nokHtml}
<table><tr><th>Ítem</th><th>Categoría</th><th>Estado</th></tr>
${CHECKLIST_ITEMS.map(i => `<tr><td>${i.icon} ${i.label}</td><td>${i.category}</td><td class="${checks[i.id]}">${checks[i.id]?.toUpperCase() || "-"}</td></tr>`).join("")}
</table>
${obs ? `<p style="margin-top:16px"><b>Observaciones:</b> ${obs}</p>` : ""}
${photosHtml ? `<div style="margin-top:16px"><b>Fotos adjuntas:</b><br>${photosHtml}</div>` : ""}
</body></html>`;

      await uploadToDrive(token,
        `Checklist_${tipo}_${razonSocial.replace(/ /g,"_")}_${vehiculo.replace(/ /g,"_")}_${dateStr.replace(/\//g,"-")}_${timeStr.replace(/:/g,"h")}.html`,
        "text/html", htmlContent, folderId);

      showToast(`✅ Checklist guardado en Drive`);
      setChecks({}); setPhotos([]); setObs([]); setRazonSocial(""); setVehiculo(""); setChofer("");
    } catch (e) {
      console.error(e);
      showToast("Error al guardar: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    if (!token)  { showToast("Iniciá sesión primero", "error"); return; }
    if (!sheetId){ showToast("Configurá el Sheet ID", "error"); return; }
    setLoadingLogs(true);
    try {
      const data = await callDriveApi(token, `/v4/spreadsheets/${sheetId}/values/A1:Z500`);
      const rows = (data.values || []).slice(1);
      const parsed = rows.reverse().map((r, i) => ({
        id: i, date: r[0], time: r[1], tipo: r[2], rs: r[3],
        vehicle: r[4], driver: r[5], status: r[6], obs: r[7],
      })).filter(r => r.vehicle);
      setLogs(parsed);
    } catch (e) {
      showToast("Error al cargar: " + e.message, "error");
    } finally {
      setLoadingLogs(false);
    }
  };

  const saveConfig = () => {
    localStorage.setItem("fc_folder", folderInput);
    localStorage.setItem("fc_sheet",  sheetInput);
    setFolderId(folderInput); setSheetId(sheetInput);
    showToast("Configuración guardada ✓");
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">

        <div className="header">
          <div className="header-top">
            <div className="logo">CHECKLIST <span>DE FLOTA</span></div>
            <div className="mode-toggle">
              <button className={`mode-btn ${view==="checklist"?"active":""}`}  onClick={()=>setView("checklist")}>Check</button>
              <button className={`mode-btn ${view==="supervisor"?"active":""}`} onClick={()=>{ setView("supervisor"); loadLogs(); }}>Panel</button>
              <button className={`mode-btn ${view==="config"?"active":""}`}     onClick={()=>setView("config")}>⚙</button>
            </div>
          </div>
        </div>

        {/* ── CHECKLIST ── */}
        {view === "checklist" && (<>
          <div className="section-title">Tipo de control</div>
          <div className="type-row">
            <button className={`type-btn ${tipo==="salida"?"active-salida":""}`}  onClick={()=>setTipo("salida")}>🚀 Salida</button>
            <button className={`type-btn ${tipo==="retorno"?"active-retorno":""}`} onClick={()=>setTipo("retorno")}>🏁 Retorno</button>
          </div>

          <div className="section-title">Razón Social</div>
          <div className="rs-row">
            <button className={`rs-btn ${razonSocial==="Aqua Vita"?"active-av":""}`}  onClick={()=>setRazonSocial("Aqua Vita")}>💧 Aqua Vita</button>
            <button className={`rs-btn ${razonSocial==="Sparkling"?"active-sp":""}`}  onClick={()=>setRazonSocial("Sparkling")}>✨ Sparkling</button>
          </div>

          <div className="section-title">Datos del viaje</div>
          <div className="field">
            <label>Vehículo</label>
            <select value={vehiculo} onChange={e=>setVehiculo(e.target.value)}>
              <option value="">Seleccioná la unidad...</option>
              {VEHICLES.map(v=><option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Responsable / Playero</label>
            <select value={chofer} onChange={e=>setChofer(e.target.value)}>
              <option value="">Seleccioná el playero...</option>
              {PLAYEROS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="section-title">Revisión de ítems</div>
          <div className="progress-wrap">
            <div className="progress-label">
              <span>Progreso</span>
              <span>{answered}/{total} revisados</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
          </div>

          <div className="cat-strip">
            {["All",...CATEGORIES].map(c=>(
              <button key={c} className={`cat-chip ${activeCat===c?"active":""}`} onClick={()=>setActiveCat(c)}>
                {c==="All"?"Todos":c}
              </button>
            ))}
          </div>

          <div className="check-group">
            {filtered.map(item => {
              const val = checks[item.id];
              return (
                <div key={item.id} className={`check-item ${val||""}`}>
                  <span className="check-icon">{item.icon}</span>
                  <span className="check-label">{item.label}</span>
                  <div className="check-btns">
                    <button className={`chk-btn ${val==="ok"?"ok-active":""}`}  onClick={()=>setCheck(item.id,"ok")}>✓</button>
                    <button className={`chk-btn ${val==="nok"?"nok-active":""}`} onClick={()=>setCheck(item.id,"nok")}>✗</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="section-title">Observaciones</div>
          <div className="field">
            <textarea value={obs} onChange={e=>setObs(e.target.value)} placeholder="Notas adicionales, anomalías, etc..." />
          </div>

          <div className="section-title">Fotos</div>
          <div className="photo-section">
            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map((p,i)=>(
                  <div key={i} className="photo-thumb">
                    <img src={p.url} alt="" />
                    <button className="photo-del" onClick={()=>setPhotos(ph=>ph.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={handlePhoto} />
            <button className="add-photo-btn" onClick={()=>fileRef.current.click()}>📷 Agregar foto</button>
          </div>

          <div className="submit-wrap">
            {!token && <button className="submit-btn ready" onClick={signIn}>🔑 Iniciar sesión con Google</button>}
            {token && (
              <button
                className={`submit-btn ${loading?"loading":answered===total&&vehiculo&&chofer&&razonSocial?"ready":"disabled"}`}
                onClick={!loading ? handleSubmit : undefined}
              >
                {loading ? "Guardando..." : `✅ Confirmar ${tipo}`}
              </button>
            )}
            {hasNok && answered===total && (
              <p style={{textAlign:"center",color:"#e74c3c",fontSize:12,marginTop:10,fontWeight:600}}>
                ⚠️ Hay ítems NOK — se guardará con alerta
              </p>
            )}
          </div>
        </>)}

        {/* ── SUPERVISOR ── */}
        {view === "supervisor" && (<>
          <div className="sup-header">
            <div className="sup-title">Panel de Control</div>
            <div className="sup-sub">Historial de checklists registrados</div>
          </div>

          {logs.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-num yellow">{logs.length}</div>
                <div className="stat-lbl">Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-num green">{logs.filter(l=>l.status?.startsWith("OK")).length}</div>
                <div className="stat-lbl">Sin NOK</div>
              </div>
              <div className="stat-card">
                <div className="stat-num red">{logs.filter(l=>!l.status?.startsWith("OK")).length}</div>
                <div className="stat-lbl">Con NOK</div>
              </div>
            </div>
          )}

          {loadingLogs && <div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Cargando...</div>}

          {!loadingLogs && logs.length === 0 && (
            <div className="log-empty">
              <div className="log-empty-icon">📋</div>
              <p>Sin registros aún</p>
              <p style={{fontSize:12,marginTop:8}}>Los checklists aparecen aquí</p>
            </div>
          )}

          {logs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-top">
                <span className="log-vehicle">{log.vehicle}</span>
                <div className="log-badges">
                  {log.rs && <span className={`log-badge ${log.rs==="Aqua Vita"?"badge-av":"badge-sp"}`}>{log.rs}</span>}
                  <span className={`log-badge badge-${log.tipo?.toLowerCase()}`}>{log.tipo}</span>
                </div>
              </div>
              <div className="log-meta">📅 {log.date} {log.time} &nbsp;·&nbsp; 👤 {log.driver}</div>
              <div className="log-items">
                <span className={`li-chip ${log.status?.startsWith("OK")?"li-ok":"li-nok"}`}>
                  {log.status?.startsWith("OK") ? "✓ Todo OK" : "⚠️ "+log.status}
                </span>
              </div>
              {log.obs && log.obs!=="-" && <p style={{fontSize:12,color:"var(--muted)"}}>💬 {log.obs}</p>}
            </div>
          ))}
        </>)}

        {/* ── CONFIG ── */}
        {view === "config" && (<>
          <div className="sup-header" style={{marginBottom:4}}>
            <div className="sup-title">Configuración</div>
            <div className="sup-sub">Conectá con Google Drive y Sheets</div>
          </div>
          <div className="config-wrap">
            <div className="config-card">
              <div className="config-title">📁 Google Drive — Folder ID</div>
              <p className="config-text">Pegá el ID de la carpeta de Drive donde se guardarán los comprobantes. Lo encontrás en la URL: <code>drive.google.com/drive/folders/<b>ESTE-ES-EL-ID</b></code></p>
              <input className="config-input" value={folderInput} onChange={e=>setFolderInput(e.target.value)} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs..." />
            </div>
            <div className="config-card">
              <div className="config-title">📊 Google Sheets — Sheet ID</div>
              <p className="config-text">ID del Sheet donde se registra cada checklist. URL: <code>docs.google.com/spreadsheets/d/<b>ESTE-ES-EL-ID</b>/edit</code></p>
              <input className="config-input" value={sheetInput} onChange={e=>setSheetInput(e.target.value)} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs..." />
              <button className="config-btn" onClick={saveConfig}>Guardar configuración</button>
            </div>
            <div className="config-card">
              <div className="config-title">🔑 Cómo conectar con Google</div>
              <div className="step"><div className="step-num">1</div><p>Creá un proyecto en <a href="https://console.cloud.google.com" target="_blank">Google Cloud Console</a></p></div>
              <div className="step"><div className="step-num">2</div><p>Activá las APIs: <b>Google Drive API</b> y <b>Google Sheets API</b></p></div>
              <div className="step"><div className="step-num">3</div><p>Creá credenciales OAuth 2.0 → "Aplicación web" → agregá el dominio como origen autorizado</p></div>
              <div className="step"><div className="step-num">4</div><p>Copiá el Client ID y pegalo en la variable <code>CLIENT_ID</code> del código (línea ~90)</p></div>
              <div className="step"><div className="step-num">5</div><p>Tocá "Iniciar sesión con Google" en la pantalla de Checklist</p></div>
            </div>
          </div>
        </>)}

      </div>
      {toast && <div className={`toast ${toast.type==="error"?"error":""}`}>{toast.msg}</div>}
    </>
  );
}
