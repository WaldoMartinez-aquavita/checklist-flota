// ── CHECKLIST DE FLOTA — Google Apps Script ──────────────────────────────────
// Pegá este código en tu Google Sheet → Extensiones → Apps Script

const SHEET_NAME = "Hoja 1"; // Cambiá si tu hoja tiene otro nombre
const FOLDER_ID  = "1StjTYgltEiiiQLQJEt_o1pJVHcm9R2knA-6XQZf6860"; // Tu carpeta de Drive

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    guardarEnSheet(data);
    guardarEnDrive(data);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data  = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function guardarEnSheet(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  // Si la hoja está vacía, agrega encabezados
  if (sheet.getLastRow() === 0) {
    const headers = [
      "fecha","hora","tipo","razonSocial","vehiculo","chofer","estado","obs",
      "Agua","Aceite","Refrigerante","Luces Del.","Luces Tras.","Balizas",
      "Cub. Del. Der.","Cub. Del. Izq.","Cub. Tras. Der.","Cub. Tras. Izq.",
      "Carrocería","Vidrios","Documentación","Extintor","Cinturones","Frenos"
    ];
    sheet.appendRow(headers);
  }

  const items = data.items || {};
  const row = [
    data.fecha, data.hora, data.tipo, data.razonSocial,
    data.vehiculo, data.chofer, data.estado, data.obs,
    items["Agua (radiador / reserva)"] || "-",
    items["Nivel de aceite"] || "-",
    items["Refrigerante"] || "-",
    items["Luces delanteras"] || "-",
    items["Luces traseras / stop"] || "-",
    items["Balizas / intermitentes"] || "-",
    items["Cubierta delantera derecha"] || "-",
    items["Cubierta delantera izquierda"] || "-",
    items["Cubierta trasera derecha"] || "-",
    items["Cubierta trasera izquierda"] || "-",
    items["Carrocería general"] || "-",
    items["Vidrios y espejos"] || "-",
    items["Documentación en regla"] || "-",
    items["Extintor vigente"] || "-",
    items["Cinturones de seguridad"] || "-",
    items["Frenos (respuesta)"] || "-",
  ];
  sheet.appendRow(row);
}

function guardarEnDrive(data) {
  const folder   = DriveApp.getFolderById(FOLDER_ID);
  const nokItems = data.estado.startsWith("NOK") ? data.estado : "";
  const nokHtml  = nokItems ? `<p style="color:#e74c3c;font-weight:bold">⚠️ ${nokItems}</p>` : "";

  const items   = data.items || {};
  const itemsHtml = Object.entries(items)
    .map(([k, v]) => `<tr><td>${k}</td><td class="${v.toLowerCase()}">${v}</td></tr>`)
    .join("");

  const fotosHtml = (data.fotos || [])
    .map(f => `<img src="${f}" style="max-width:200px;max-height:150px;border-radius:6px;margin:4px"/>`)
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Checklist ${data.tipo} - ${data.vehiculo} - ${data.fecha}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#1a1a1a}
  h1{color:#f5a623} table{width:100%;border-collapse:collapse;margin-top:16px}
  td,th{border:1px solid #ddd;padding:8px 10px;font-size:13px} th{background:#f5f5f5}
  .ok{color:#27ae60;font-weight:bold} .nok{color:#e74c3c;font-weight:bold}
</style></head><body>
<h1>🚛 CHECKLIST DE FLOTA</h1>
<p><b>Tipo:</b> ${data.tipo} &nbsp;|&nbsp; <b>Fecha:</b> ${data.fecha} ${data.hora}</p>
<p><b>Razón Social:</b> ${data.razonSocial} &nbsp;|&nbsp; <b>Vehículo:</b> ${data.vehiculo} &nbsp;|&nbsp; <b>Playero:</b> ${data.chofer}</p>
${nokHtml}
<table><tr><th>Ítem</th><th>Estado</th></tr>${itemsHtml}</table>
${data.obs && data.obs !== "-" ? `<p style="margin-top:16px"><b>Observaciones:</b> ${data.obs}</p>` : ""}
${fotosHtml ? `<div style="margin-top:16px"><b>Fotos adjuntas:</b><br>${fotosHtml}</div>` : ""}
</body></html>`;

  const nombre = `Checklist_${data.tipo}_${data.razonSocial.replace(/ /g,"_")}_${data.vehiculo.replace(/ /g,"_")}_${data.fecha.replace(/\//g,"-")}_${data.hora.replace(/:/g,"h")}.html`;
  folder.createFile(nombre, html, MimeType.HTML);
}
