import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const SCRIPT_URL_KEY = "fc_script";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0a0c10; --surface:#12151c; --card:#191d27; --border:#232838;
    --accent:#f5a623; --ok:#22c55e; --nok:#ef4444; --blue:#3b82f6;
    --purple:#a855f7; --gray:#64748b; --text:#e2e8f0; --muted:#64748b; --radius:12px;
  }
  body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }
  .dash { max-width:1100px; margin:0 auto; padding:0 20px 60px; }
  .dash-header { padding:28px 0 20px; border-bottom:1px solid var(--border); margin-bottom:24px; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .dash-title { font-family:'Bebas Neue',sans-serif; font-size:38px; letter-spacing:2px; color:var(--accent); line-height:1; }
  .dash-title span { color:var(--text); }
  .dash-sub { font-size:13px; color:var(--muted); margin-top:4px; }
  .dash-actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .btn { border:none; border-radius:8px; padding:10px 18px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px; cursor:pointer; }
  .btn-primary { background:var(--accent); color:#000; }
  .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
  .url-input { background:var(--card); border:1.5px solid var(--border); border-radius:8px; color:var(--text); font-size:12px; padding:9px 12px; outline:none; width:240px; font-family:monospace; }
  .url-input:focus { border-color:var(--accent); }
  .filter-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; align-items:center; }
  .filter-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); margin-right:4px; }
  .filter-chip { font-size:12px; font-weight:600; padding:5px 12px; border-radius:20px; border:1.5px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; transition:all .15s; }
  .filter-chip.active { border-color:var(--accent); background:rgba(245,166,35,.12); color:var(--accent); }
  .divider { width:1px; height:24px; background:var(--border); margin:0 4px; }

  /* KPIs */
  .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:24px; }
  .kpi { background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:18px 16px; position:relative; overflow:hidden; }
  .kpi::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--kpi-color,var(--accent)); }
  .kpi-val { font-family:'Bebas Neue',sans-serif; font-size:40px; line-height:1; color:var(--kpi-color,var(--accent)); }
  .kpi-lbl { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); margin-top:4px; }
  .kpi-sub { font-size:12px; color:var(--muted); margin-top:4px; }

  /* Cumplimiento highlight */
  .cumplimiento-card { background:var(--card); border:2px solid var(--accent); border-radius:var(--radius); padding:20px 24px; margin-bottom:24px; display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
  .cumpl-circle { width:90px; height:90px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:26px; flex-shrink:0; }
  .cumpl-info h3 { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:1px; color:var(--accent); }
  .cumpl-info p { font-size:13px; color:var(--muted); margin-top:4px; line-height:1.5; }
  .cumpl-stats { display:flex; gap:20px; margin-top:10px; flex-wrap:wrap; }
  .cumpl-stat { text-align:center; }
  .cumpl-stat-val { font-family:'Bebas Neue',sans-serif; font-size:24px; }
  .cumpl-stat-lbl { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }

  /* Charts */
  .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  @media(max-width:700px) { .charts-grid { grid-template-columns:1fr; } }
  .chart-card { background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:20px; }
  .chart-title { font-family:'Bebas Neue',sans-serif; font-size:17px; letter-spacing:1px; color:var(--text); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .dot { width:8px; height:8px; border-radius:50%; background:var(--accent); flex-shrink:0; }

  /* Table */
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); font-weight:600; padding:10px 12px; text-align:left; border-bottom:1px solid var(--border); white-space:nowrap; }
  td { padding:10px 12px; border-bottom:1px solid var(--border); color:var(--text); }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:rgba(255,255,255,.02); }
  .badge { display:inline-block; font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; text-transform:uppercase; letter-spacing:.5px; white-space:nowrap; }
  .b-ok    { background:rgba(34,197,94,.15);  color:var(--ok); }
  .b-nok   { background:rgba(239,68,68,.15);  color:var(--nok); }
  .b-noop  { background:rgba(100,116,139,.15);color:#94a3b8; }
  .b-sal   { background:rgba(245,166,35,.15); color:var(--accent); }
  .b-ret   { background:rgba(59,130,246,.15); color:var(--blue); }
  .b-av    { background:rgba(59,130,246,.15); color:var(--blue); }
  .b-sp    { background:rgba(168,85,247,.15); color:var(--purple); }

  .empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .spinner { display:inline-block; width:18px; height:18px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .ct { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 14px; font-size:12px; }
  .ct-label { color:var(--muted); margin-bottom:4px; }
  .ct-val { font-weight:700; color:var(--accent); font-size:15px; }
`;

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="ct"><div className="ct-label">{label}</div><div className="ct-val">{payload[0].value}{payload[0].name==="pct"?"%":""}</div></div>;
};

function pctColor(p) {
  if (p >= 90) return "#22c55e";
  if (p >= 70) return "#f5a623";
  return "#ef4444";
}

export default function Dashboard() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem(SCRIPT_URL_KEY) || "");
  const [urlInput, setUrlInput]   = useState(localStorage.getItem(SCRIPT_URL_KEY) || "");
  const [rsFilter, setRsFilter]   = useState("Todos");
  const [tipoFilter, setTipoFilter] = useState("Todos");

  const fetchData = async () => {
    if (!scriptUrl) { setError("Pegá la URL del Apps Script"); return; }
    setLoading(true); setError(null);
    try {
      const res  = await fetch(scriptUrl + "?action=get");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setRows(data.rows || []);
    } catch(e) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  const saveUrl = () => { localStorage.setItem(SCRIPT_URL_KEY, urlInput); setScriptUrl(urlInput); };
  useEffect(() => { if (scriptUrl) fetchData(); }, [scriptUrl]);

  // Filter (exclude noopera from tipo filter but keep for cumplimiento)
  const filtered = rows.filter(r => {
    const rsOk  = rsFilter === "Todos" || r.razonSocial === rsFilter;
    const tipOk = tipoFilter === "Todos" || r.tipo === tipoFilter.toUpperCase();
    return rsOk && tipOk;
  });

  // ── CUMPLIMIENTO ──────────────────────────────────────────────────────────
  // Total registros (salida + retorno + noopera)
  const totalRegistros = filtered.length;
  const noOpera  = filtered.filter(r => r.estado === "NO OPERA").length;
  const opera    = filtered.filter(r => r.estado !== "NO OPERA").length;
  const conCheck = filtered.filter(r => r.estado !== "NO OPERA").length;
  // Cumplimiento = vehículos que operaron Y tienen checklist / total que operaron
  const pctCumpl = opera > 0 ? Math.round((conCheck / opera) * 100) : 0;
  const nokCount = filtered.filter(r => r.estado && !r.estado.startsWith("OK") && r.estado !== "NO OPERA").length;
  const okCount  = filtered.filter(r => r.estado?.startsWith("OK")).length;
  const pctOk    = conCheck > 0 ? Math.round((okCount / conCheck) * 100) : 0;

  // ── NOK por vehículo ──────────────────────────────────────────────────────
  const nokPorVeh = {};
  filtered.forEach(r => {
    if (r.estado && !r.estado.startsWith("OK") && r.estado !== "NO OPERA") {
      nokPorVeh[r.vehiculo] = (nokPorVeh[r.vehiculo] || 0) + 1;
    }
  });
  const vehNokData = Object.entries(nokPorVeh).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([name,value])=>({name,value}));

  // ── NOK por ítem ──────────────────────────────────────────────────────────
  const nokPorItem = {};
  filtered.forEach(r => {
    if (r.estado && !r.estado.startsWith("OK") && r.estado !== "NO OPERA") {
      r.estado.replace("NOK: ","").split(", ").forEach(item => {
        if (item.trim()) nokPorItem[item.trim()] = (nokPorItem[item.trim()] || 0) + 1;
      });
    }
  });
  const itemNokData = Object.entries(nokPorItem).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([name,value])=>({name:name.length>22?name.slice(0,20)+"…":name, value}));

  // ── Cumplimiento por vehículo ─────────────────────────────────────────────
  const vehStats = {};
  filtered.forEach(r => {
    if (!vehStats[r.vehiculo]) vehStats[r.vehiculo] = { total:0, opera:0, noopera:0, ok:0, nok:0 };
    vehStats[r.vehiculo].total++;
    if (r.estado === "NO OPERA") { vehStats[r.vehiculo].noopera++; }
    else {
      vehStats[r.vehiculo].opera++;
      if (r.estado?.startsWith("OK")) vehStats[r.vehiculo].ok++;
      else vehStats[r.vehiculo].nok++;
    }
  });
  const vehCumplData = Object.entries(vehStats)
    .map(([name, s]) => ({
      name,
      pct: s.opera > 0 ? Math.round((s.opera / s.opera) * 100) : 0,
      opera: s.opera, noopera: s.noopera, ok: s.ok, nok: s.nok
    }))
    .sort((a,b) => b.nok - a.nok);

  // ── Cumplimiento por playero ──────────────────────────────────────────────
  const playStats = {};
  filtered.forEach(r => {
    if (r.estado === "NO OPERA") return;
    if (!playStats[r.chofer]) playStats[r.chofer] = { total:0, ok:0, nok:0 };
    playStats[r.chofer].total++;
    if (r.estado?.startsWith("OK")) playStats[r.chofer].ok++;
    else playStats[r.chofer].nok++;
  });
  const playData = Object.entries(playStats)
    .map(([name,s]) => ({ name, pct: s.total>0?Math.round((s.ok/s.total)*100):0, ok:s.ok, nok:s.nok }))
    .sort((a,b) => a.pct - b.pct);

  // ── Por día ───────────────────────────────────────────────────────────────
  const porDia = {};
  filtered.forEach(r => {
    if (!r.fecha) return;
    if (!porDia[r.fecha]) porDia[r.fecha] = { total:0, opera:0, noopera:0 };
    porDia[r.fecha].total++;
    if (r.estado === "NO OPERA") porDia[r.fecha].noopera++;
    else porDia[r.fecha].opera++;
  });
  const diaData = Object.entries(porDia).sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([name,v]) => ({ name, opera:v.opera, noopera:v.noopera }));

  // ── RS pie ────────────────────────────────────────────────────────────────
  const rsPie = [
    { name:"Aqua Vita", value: filtered.filter(r=>r.razonSocial==="Aqua Vita"&&r.estado!=="NO OPERA").length },
    { name:"Sparkling",  value: filtered.filter(r=>r.razonSocial==="Sparkling"&&r.estado!=="NO OPERA").length },
  ].filter(d=>d.value>0);

  return (
    <>
      <style>{css}</style>
      <div className="dash">

        <div className="dash-header">
          <div>
            <div className="dash-title">FLEET<span>DASH</span></div>
            <div className="dash-sub">Dashboard de cumplimiento — Checklist de Flota</div>
          </div>
          <div className="dash-actions">
            <input className="url-input" value={urlInput} onChange={e=>setUrlInput(e.target.value)} onBlur={saveUrl} placeholder="https://script.google.com/macros/s/..."/>
            <button className="btn btn-primary" onClick={fetchData} disabled={loading}>
              {loading ? <span className="spinner"/> : "↻"} Actualizar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <span className="filter-label">Empresa:</span>
          {["Todos","Aqua Vita","Sparkling"].map(f=>(
            <button key={f} className={`filter-chip ${rsFilter===f?"active":""}`} onClick={()=>setRsFilter(f)}>{f}</button>
          ))}
          <div className="divider"/>
          <span className="filter-label">Tipo:</span>
          {["Todos","Salida","Retorno"].map(f=>(
            <button key={f} className={`filter-chip ${tipoFilter===f?"active":""}`} onClick={()=>setTipoFilter(f)}>{f}</button>
          ))}
        </div>

        {error && <div style={{background:"rgba(239,68,68,.1)",border:"1px solid #ef4444",borderRadius:8,padding:"12px 16px",color:"#ef4444",marginBottom:20,fontSize:13}}>{error}</div>}

        {filtered.length === 0 && !loading && (
          <div className="empty chart-card"><div style={{fontSize:48,marginBottom:12}}>📊</div><p>Sin datos — pegá la URL y tocá Actualizar</p></div>
        )}

        {filtered.length > 0 && (<>

          {/* Cumplimiento destacado */}
          <div className="cumplimiento-card">
            <div className="cumpl-circle" style={{background:`conic-gradient(${pctColor(pctCumpl)} ${pctCumpl*3.6}deg, #232838 0deg)`, boxShadow:`0 0 0 4px ${pctColor(pctCumpl)}30`}}>
              <div style={{background:"var(--card)",width:70,height:70,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:pctColor(pctCumpl)}}>{pctCumpl}%</span>
              </div>
            </div>
            <div className="cumpl-info">
              <h3>Cumplimiento de Checklist</h3>
              <p>De los vehículos que operaron, <b style={{color:pctColor(pctCumpl)}}>{pctCumpl}%</b> realizó el checklist correctamente.</p>
              <div className="cumpl-stats">
                <div className="cumpl-stat"><div className="cumpl-stat-val" style={{color:"var(--accent)"}}>{totalRegistros}</div><div className="cumpl-stat-lbl">Registros</div></div>
                <div className="cumpl-stat"><div className="cumpl-stat-val" style={{color:"var(--ok)"}}>{opera}</div><div className="cumpl-stat-lbl">Operaron</div></div>
                <div className="cumpl-stat"><div className="cumpl-stat-val" style={{color:"#94a3b8"}}>{noOpera}</div><div className="cumpl-stat-lbl">No operaron</div></div>
                <div className="cumpl-stat"><div className="cumpl-stat-val" style={{color:"var(--ok)"}}>{okCount}</div><div className="cumpl-stat-lbl">OK</div></div>
                <div className="cumpl-stat"><div className="cumpl-stat-val" style={{color:"var(--nok)"}}>{nokCount}</div><div className="cumpl-stat-lbl">Con NOK</div></div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpi-grid">
            <div className="kpi" style={{"--kpi-color":"var(--accent)"}}>
              <div className="kpi-val">{totalRegistros}</div>
              <div className="kpi-lbl">Total registros</div>
            </div>
            <div className="kpi" style={{"--kpi-color":"var(--ok)"}}>
              <div className="kpi-val">{pctOk}%</div>
              <div className="kpi-lbl">Checklists OK</div>
              <div className="kpi-sub">{okCount} de {conCheck}</div>
            </div>
            <div className="kpi" style={{"--kpi-color":"var(--nok)"}}>
              <div className="kpi-val">{nokCount}</div>
              <div className="kpi-lbl">Con NOK</div>
              <div className="kpi-sub">{conCheck>0?Math.round(nokCount/conCheck*100):0}% del total</div>
            </div>
            <div className="kpi" style={{"--kpi-color":"#94a3b8"}}>
              <div className="kpi-val">{noOpera}</div>
              <div className="kpi-lbl">No operaron</div>
            </div>
            <div className="kpi" style={{"--kpi-color":"var(--blue)"}}>
              <div className="kpi-val">{Object.keys(vehStats).length}</div>
              <div className="kpi-lbl">Vehículos activos</div>
            </div>
          </div>

          {/* Checklists por día */}
          <div className="chart-card" style={{marginBottom:16}}>
            <div className="chart-title"><span className="dot"/> Actividad diaria — Operaron vs No operaron</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={diaData} margin={{left:0,right:10}}>
                <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="opera" name="Operaron" fill="#22c55e" radius={[4,4,0,0]} stackId="a"/>
                <Bar dataKey="noopera" name="No operaron" fill="#374151" radius={[4,4,0,0]} stackId="a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row 2 */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title"><span className="dot" style={{background:"var(--nok)"}}/> Vehículos con más NOK</div>
              {vehNokData.length===0
                ? <p style={{color:"var(--muted)",fontSize:13}}>Sin registros NOK</p>
                : <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={vehNokData} layout="vertical" margin={{left:10,right:20}}>
                      <XAxis type="number" tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} width={110} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CT/>}/>
                      <Bar dataKey="value" fill="#ef4444" radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
            <div className="chart-card">
              <div className="chart-title"><span className="dot" style={{background:"var(--blue)"}}/> Ítems con más NOK</div>
              {itemNokData.length===0
                ? <p style={{color:"var(--muted)",fontSize:13}}>Sin registros NOK</p>
                : <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={itemNokData} layout="vertical" margin={{left:10,right:20}}>
                      <XAxis type="number" tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} width={120} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CT/>}/>
                      <Bar dataKey="value" fill="#3b82f6" radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>

          {/* Row 3 */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title"><span className="dot" style={{background:"var(--accent)"}}/> Cumplimiento por playero</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={playData} margin={{left:0,right:10}}>
                  <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,100]} tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CT/>}/>
                  <Bar dataKey="pct" name="pct" radius={[4,4,0,0]}>
                    {playData.map((entry,i) => (
                      <Cell key={i} fill={pctColor(entry.pct)}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-title"><span className="dot" style={{background:"var(--purple)"}}/> Por razón social</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={rsPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    <Cell fill="#3b82f6"/><Cell fill="#a855f7"/>
                  </Pie>
                  <Tooltip content={<CT/>}/>
                  <Legend iconType="circle" iconSize={8} formatter={v=><span style={{color:"#94a3b8",fontSize:12}}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla cumplimiento por vehículo */}
          <div className="chart-card" style={{marginBottom:16}}>
            <div className="chart-title"><span className="dot" style={{background:"var(--ok)"}}/> Cumplimiento por vehículo</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Vehículo</th><th>Operó</th><th>No operó</th><th>OK</th><th>NOK</th><th>Cumplimiento</th></tr>
                </thead>
                <tbody>
                  {vehCumplData.map((v,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{v.name}</td>
                      <td><span className="badge b-ok">{v.opera}</span></td>
                      <td><span className="badge b-noop">{v.noopera}</span></td>
                      <td style={{color:"var(--ok)",fontWeight:600}}>{v.ok}</td>
                      <td style={{color:v.nok>0?"var(--nok)":"var(--muted)",fontWeight:600}}>{v.nok}</td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                            <div style={{width:`${v.opera>0?Math.round(v.ok/v.opera*100):0}%`,height:"100%",background:pctColor(v.opera>0?Math.round(v.ok/v.opera*100):0),borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:12,fontWeight:600,color:pctColor(v.opera>0?Math.round(v.ok/v.opera*100):0),width:36}}>
                            {v.opera>0?Math.round(v.ok/v.opera*100):0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Últimos registros */}
          <div className="chart-card">
            <div className="chart-title"><span className="dot" style={{background:"var(--muted)"}}/> Últimos registros</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Empresa</th><th>Vehículo</th><th>Playero</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {filtered.slice(0,20).map((r,i)=>(
                    <tr key={i}>
                      <td>{r.fecha}</td>
                      <td>{r.hora}</td>
                      <td><span className={`badge ${r.tipo==="SALIDA"?"b-sal":r.tipo==="RETORNO"?"b-ret":"b-noop"}`}>{r.tipo}</span></td>
                      <td><span className={`badge ${r.razonSocial==="Aqua Vita"?"b-av":"b-sp"}`}>{r.razonSocial}</span></td>
                      <td style={{fontWeight:600}}>{r.vehiculo}</td>
                      <td>{r.chofer}</td>
                      <td>
                        <span className={`badge ${r.estado==="NO OPERA"?"b-noop":r.estado?.startsWith("OK")?"b-ok":"b-nok"}`}>
                          {r.estado==="NO OPERA"?"No opera":r.estado?.startsWith("OK")?"OK":"NOK"}
                        </span>
                        {r.estado&&!r.estado.startsWith("OK")&&r.estado!=="NO OPERA"&&
                          <span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>{r.estado.replace("NOK: ","")}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>)}
      </div>
    </>
  );
}
