import { useState, useMemo, useRef } from "react";

const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const fmtUF = (n) => n.toFixed(1) + " UF";

const BG="#0f0f0f",CARD="#1a1a1a",BDR="#2a2a2a",TXT="#f5f5f5",MUT="#888",FAINT="#222",GRN="#4ade80",YLW="#facc15",BLU="#60a5fa",RED="#f87171";
const TCATS=["Pasaje aereo","Arriendo vehiculo","Bencina","Viaticos alojamiento","Viaticos alimentacion","Otros"];

const R0=[
  {id:1,nombre:"Director",terreno:5,back:4},
  {id:2,nombre:"Facilitador Senior",terreno:4,back:3.5},
  {id:3,nombre:"Facilitador Junior",terreno:2.5,back:2},
];

const calcFase=(f,roles)=>{
  const a=f.asig.reduce((s,a)=>{const r=roles.find(x=>x.id===a.rId);return r?s+a.hT*r.terreno+a.hB*r.back:s;},0);
  const t=f.trasl.reduce((s,t)=>s+(t.uf||0),0);
  const m=f.mat.reduce((s,m)=>s+(m.uf||0),0);
  return a+t+m;
};

const PRINT_CSS=`
@media print {
  body{margin:0;}
  .no-print{display:none!important;}
  .print-only{display:block!important;}
  .print-page{background:#fff!important;color:#111!important;padding:40px!important;min-height:100vh;font-family:system-ui,sans-serif;}
}
@media screen{.print-only{display:none;}}
`;

function injectCSS(){
  if(document.getElementById("pdfcss"))return;
  const s=document.createElement("style");s.id="pdfcss";s.innerHTML=PRINT_CSS;
  document.head.appendChild(s);
}

async function generateFases(transcript, roles, apiKey){
  const roleList=roles.map(r=>`- id:${r.id} "${r.nombre}" (terreno:${r.terreno}UF/h, back:${r.back}UF/h)`).join("\n");
  const prompt=`Eres un asistente experto en consultoría facilitada. El usuario describió verbalmente un proyecto. Tu tarea es estructurar esa descripción en fases de consultoría.

ROLES DISPONIBLES:
${roleList}

DESCRIPCIÓN DEL USUARIO (puede tener titubeos, repeticiones, lenguaje informal):
"${transcript}"

Responde SOLO con un JSON válido, sin texto adicional, con esta estructura exacta:
{
  "nombre": "Nombre del proyecto",
  "cliente": "Nombre del cliente o vacío",
  "fases": [
    {
      "id": 1,
      "nombre": "Nombre de la fase",
      "mod": "Presencial",
      "tipo": "Ejecucion",
      "desc": "Descripción breve y clara de la fase",
      "asig": [{"rId": 1, "hT": 4, "hB": 2}],
      "trasl": [{"cat": "Pasaje aereo", "uf": 1.0}],
      "mat": [{"desc": "Materiales", "uf": 0.5}]
    }
  ]
}

Reglas:
- Extrae solo información relevante, ignora titubeos y repeticiones
- Si no se menciona un dato, usa valores razonables basados en el contexto
- hT = horas en terreno, hB = horas de back office
- mod puede ser "Presencial" o "Remoto"
- tipo puede ser "Ejecucion", "Gabinete", "Entregable" o "Seguimiento"
- Las categorías de traslado válidas son: Pasaje aereo, Arriendo vehiculo, Bencina, Viaticos alojamiento, Viaticos alimentacion, Otros
- Si no hay traslados o materiales, usa arreglos vacíos
- Genera entre 3 y 8 fases según la complejidad descrita`;

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ prompt }),
  });

  if(!res.ok) throw new Error("Error API: " + res.status);
  const data = await res.json();
  const text = data.content[0].text;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function ApiKeyModal({onSave}){
  const [k,setK]=useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div style={{background:CARD,border:"1px solid "+BDR,borderRadius:20,padding:32,maxWidth:420,width:"100%"}}>
        <div style={{fontSize:28,marginBottom:12,textAlign:"center"}}>🔑</div>
        <h2 style={{fontSize:18,fontWeight:800,color:TXT,margin:"0 0 8px",textAlign:"center"}}>API Key de Anthropic</h2>
        <p style={{fontSize:13,color:MUT,margin:"0 0 20px",textAlign:"center",lineHeight:1.6}}>Para generar cotizaciones por voz necesitas tu API key. Se guarda solo en esta sesión.</p>
        <input
          type="password" value={k} onChange={e=>setK(e.target.value)}
          placeholder="sk-ant-..."
          onKeyDown={e=>e.key==="Enter"&&k.startsWith("sk-")&&onSave(k)}
          style={{width:"100%",background:BG,border:"1px solid "+BDR,borderRadius:10,padding:"12px 14px",fontSize:14,color:TXT,outline:"none",boxSizing:"border-box",marginBottom:12}}
        />
        <button
          onClick={()=>k.startsWith("sk-")&&onSave(k)}
          disabled={!k.startsWith("sk-")}
          style={{width:"100%",background:k.startsWith("sk-")?GRN:"#333",border:"none",borderRadius:10,padding:"12px",fontSize:15,fontWeight:800,color:k.startsWith("sk-")?"#0f0f0f":MUT,cursor:k.startsWith("sk-")?"pointer":"default",transition:"all 0.2s"}}
        >Guardar y continuar</button>
        <p style={{fontSize:11,color:"#444",marginTop:12,textAlign:"center"}}>Puedes obtener tu key en console.anthropic.com</p>
      </div>
    </div>
  );
}

function VoiceButton({onTranscript,disabled}){
  const [rec,setRec]=useState(false);
  const srRef=useRef(null);

  const start=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Tu navegador no soporta reconocimiento de voz. Prueba Chrome.");return;}
    const sr=new SR();
    sr.lang="es-CL";sr.continuous=true;sr.interimResults=false;
    sr.onresult=e=>{
      const txt=Array.from(e.results).map(r=>r[0].transcript).join(" ");
      onTranscript(txt);
    };
    sr.onerror=()=>{setRec(false);};
    sr.onend=()=>{setRec(false);};
    sr.start();srRef.current=sr;
    setRec(true);
  };

  const stop=()=>{srRef.current?.stop();setRec(false);};

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"24px 0"}}>
      <button
        onClick={rec?stop:start} disabled={disabled}
        style={{
          width:80,height:80,borderRadius:"50%",border:"none",cursor:disabled?"default":"pointer",
          background:rec?"#7f1d1d":FAINT,
          boxShadow:rec?"0 0 0 12px rgba(248,113,113,0.2), 0 0 0 24px rgba(248,113,113,0.08)":"none",
          transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32
        }}
      >
        {rec?"⏹":"🎙"}
      </button>
      <span style={{fontSize:12,color:rec?RED:MUT,fontWeight:rec?700:400}}>
        {disabled?"Procesando...":rec?"Grabando... (clic para detener)":"Clic para hablar"}
      </span>
      {rec&&<span style={{fontSize:11,color:"#555",maxWidth:280,textAlign:"center",lineHeight:1.5}}>Describe el proyecto: cliente, fases, equipo, traslados, materiales...</span>}
    </div>
  );
}

function FRow({f,roles,onUpd,onDel}){
  const [open,setOpen]=useState(false);
  const tot=calcFase(f,roles);
  const set=(k,v)=>onUpd({...f,[k]:v});
  const iS=(ex)=>({background:CARD,border:"1px solid "+BDR,borderRadius:6,padding:"6px 8px",fontSize:12,color:TXT,outline:"none",...ex});
  const bS={background:"none",border:"1px dashed "+BDR,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12,color:MUT,marginBottom:10};
  return (
    <div style={{borderBottom:"1px solid "+BDR}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0"}}>
        <div onClick={()=>setOpen(!open)} style={{width:26,height:26,borderRadius:"50%",background:FAINT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:MUT,flexShrink:0,cursor:"pointer"}}>{f.id}</div>
        <div onClick={()=>setOpen(!open)} style={{flex:1,cursor:"pointer"}}>
          <div style={{fontSize:14,fontWeight:600,color:TXT,marginBottom:4}}>{f.nombre}</div>
          <div style={{display:"flex",gap:8}}>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:(f.mod==="Presencial"?YLW:BLU)+"22",color:f.mod==="Presencial"?YLW:BLU}}>{f.mod}</span>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:MUT+"22",color:MUT}}>{f.tipo}</span>
          </div>
        </div>
        <div onClick={()=>setOpen(!open)} style={{textAlign:"right",cursor:"pointer"}}>
          <div style={{fontSize:16,fontWeight:800,color:TXT}}>{fmtUF(tot)}</div>
          <div style={{fontSize:11,color:MUT}}>{fmt(tot*38500)}</div>
        </div>
        <button onClick={onDel} style={{background:"none",border:"none",cursor:"pointer",color:"#444",fontSize:16,padding:"0 4px"}}>×</button>
        <div onClick={()=>setOpen(!open)} style={{color:MUT,fontSize:12,cursor:"pointer"}}>{open?"▲":"▼"}</div>
      </div>
      {open&&(
        <div style={{background:"#111",borderRadius:10,padding:16,marginBottom:14}}>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <input value={f.nombre} onChange={e=>set("nombre",e.target.value)} style={iS({flex:2,minWidth:140})} />
            <select value={f.mod} onChange={e=>set("mod",e.target.value)} style={iS({flex:1})}>
              <option>Presencial</option><option>Remoto</option>
            </select>
            <select value={f.tipo} onChange={e=>set("tipo",e.target.value)} style={iS({flex:1})}>
              <option>Ejecucion</option><option>Gabinete</option><option>Entregable</option><option>Seguimiento</option>
            </select>
          </div>
          <textarea value={f.desc} onChange={e=>set("desc",e.target.value)} rows={2} style={iS({width:"100%",resize:"vertical",boxSizing:"border-box",marginBottom:12})} />
          <div style={{fontSize:11,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Equipo</div>
          {f.asig.map((a,i)=>{
            const r=roles.find(x=>x.id===a.rId);
            const sub=r?a.hT*r.terreno+a.hB*r.back:0;
            return (
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                <select value={a.rId} onChange={e=>set("asig",f.asig.map((x,j)=>j===i?{...x,rId:Number(e.target.value)}:x))} style={iS({flex:"1 1 130px"})}>
                  {roles.map(r2=><option key={r2.id} value={r2.id}>{r2.nombre}</option>)}
                </select>
                <input type="number" min={0} max={100} step={0.5} value={a.hT} onChange={e=>set("asig",f.asig.map((x,j)=>j===i?{...x,hT:Number(e.target.value)}:x))} style={iS({width:50,textAlign:"center"})} />
                <span style={{fontSize:11,color:MUT}}>ter</span>
                <input type="number" min={0} max={100} step={0.5} value={a.hB} onChange={e=>set("asig",f.asig.map((x,j)=>j===i?{...x,hB:Number(e.target.value)}:x))} style={iS({width:50,textAlign:"center"})} />
                <span style={{fontSize:11,color:MUT}}>back</span>
                <span style={{fontSize:13,fontWeight:700,color:TXT,minWidth:50}}>{fmtUF(sub)}</span>
                <button onClick={()=>set("asig",f.asig.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:18}}>×</button>
              </div>
            );
          })}
          <button onClick={()=>{const r=roles[0];if(r)set("asig",f.asig.concat([{rId:r.id,hT:0,hB:0}]));}} style={bS}>+ Persona</button>
          <div style={{fontSize:11,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:4}}>Traslados</div>
          {f.trasl.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <select value={t.cat} onChange={e=>set("trasl",f.trasl.map((x,j)=>j===i?{...x,cat:e.target.value}:x))} style={iS({flex:1})}>
                {TCATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" min={0} max={100} step={0.1} value={t.uf} onChange={e=>set("trasl",f.trasl.map((x,j)=>j===i?{...x,uf:Number(e.target.value)}:x))} style={iS({width:62,textAlign:"center"})} />
              <span style={{fontSize:11,color:MUT}}>UF</span>
              <button onClick={()=>set("trasl",f.trasl.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:18}}>×</button>
            </div>
          ))}
          <button onClick={()=>set("trasl",f.trasl.concat([{cat:"Pasaje aereo",uf:0}]))} style={bS}>+ Traslado</button>
          <div style={{fontSize:11,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:4}}>Materiales</div>
          {f.mat.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input value={m.desc} onChange={e=>set("mat",f.mat.map((x,j)=>j===i?{...x,desc:e.target.value}:x))} style={iS({flex:1})} />
              <input type="number" min={0} max={100} step={0.1} value={m.uf} onChange={e=>set("mat",f.mat.map((x,j)=>j===i?{...x,uf:Number(e.target.value)}:x))} style={iS({width:62,textAlign:"center"})} />
              <span style={{fontSize:11,color:MUT}}>UF</span>
              <button onClick={()=>set("mat",f.mat.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:18}}>×</button>
            </div>
          ))}
          <button onClick={()=>set("mat",f.mat.concat([{desc:"Nuevo item",uf:0}]))} style={bS}>+ Material</button>
          <div style={{background:BG,borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:MUT}}>Total fase</span>
            <span style={{fontSize:16,fontWeight:800,color:TXT}}>{fmtUF(tot)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PrintView({nombre,cliente,fases,roles,costo,precio,util,ufVal,buffer,traslTot,matTot,hon,bufUF,utilUF}){
  const today=new Date().toLocaleDateString("es-CL",{year:"numeric",month:"long",day:"numeric"});
  const th={padding:"10px 14px",fontSize:12,fontWeight:700,textAlign:"left",borderBottom:"2px solid #e5e7eb",color:"#374151"};
  const td={padding:"10px 14px",fontSize:13,borderBottom:"1px solid #f3f4f6",verticalAlign:"top"};
  return (
    <div className="print-page" style={{background:"#fff",color:"#111",padding:40,fontFamily:"system-ui,sans-serif",maxWidth:800,margin:"0 auto"}}>
      <div style={{borderBottom:"3px solid #111",paddingBottom:20,marginBottom:28}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:"#888",textTransform:"uppercase",marginBottom:6}}>Consultoría Facilitada · Propuesta Comercial</div>
        <div style={{fontSize:28,fontWeight:900,color:"#111",marginBottom:4}}>{nombre}</div>
        {cliente&&<div style={{fontSize:14,color:"#555"}}>Cliente: <strong>{cliente}</strong></div>}
        <div style={{fontSize:12,color:"#999",marginTop:6}}>Emitida el {today}</div>
      </div>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#888",marginBottom:16}}>Resumen Ejecutivo</div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:20}}>
          {[
            {label:"Precio al cliente",main:fmtUF(precio),sub:fmt(precio*ufVal),bg:"#f9fafb",border:"#e5e7eb",mc:"#111"},
            {label:"Costo base",main:fmtUF(costo),sub:`Buffer ${buffer}% incluido`,bg:"#f9fafb",border:"#e5e7eb",mc:"#333"},
            {label:"Utilidad",main:util+"%",sub:"+ "+fmtUF(utilUF),bg:"#f0fdf4",border:"#bbf7d0",mc:"#16a34a"},
          ].map((c,i)=>(
            <div key={i} style={{flex:1,minWidth:160,background:c.bg,borderRadius:10,padding:"16px 20px",border:`1px solid ${c.border}`}}>
              <div style={{fontSize:11,color:"#888",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{c.label}</div>
              <div style={{fontSize:22,fontWeight:900,color:c.mc}}>{c.main}</div>
              <div style={{fontSize:12,color:"#888",marginTop:2}}>{c.sub}</div>
            </div>
          ))}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#f9fafb"}}>
            <th style={th}>Concepto</th>
            <th style={{...th,textAlign:"right"}}>UF</th>
            <th style={{...th,textAlign:"right"}}>CLP ref.</th>
          </tr></thead>
          <tbody>
            {[
              {label:"Honorarios equipo",val:hon},
              {label:"Traslados y viáticos",val:traslTot},
              {label:"Materiales y entregables",val:matTot},
              {label:`Buffer complejidad (${buffer}%)`,val:bufUF},
            ].map((r,i)=>(
              <tr key={i}>
                <td style={td}>{r.label}</td>
                <td style={{...td,textAlign:"right",fontWeight:600}}>{fmtUF(r.val)}</td>
                <td style={{...td,textAlign:"right",color:"#888"}}>{fmt(r.val*ufVal)}</td>
              </tr>
            ))}
            <tr style={{background:"#f9fafb"}}>
              <td style={{...td,fontWeight:700}}>Costo total</td>
              <td style={{...td,textAlign:"right",fontWeight:800}}>{fmtUF(costo)}</td>
              <td style={{...td,textAlign:"right",color:"#555"}}>{fmt(costo*ufVal)}</td>
            </tr>
            <tr style={{background:"#f0fdf4"}}>
              <td style={{...td,color:"#16a34a",fontWeight:700}}>Utilidad ({util}%)</td>
              <td style={{...td,textAlign:"right",color:"#16a34a",fontWeight:700}}>+ {fmtUF(utilUF)}</td>
              <td style={{...td,textAlign:"right",color:"#16a34a"}}>{fmt(utilUF*ufVal)}</td>
            </tr>
            <tr style={{background:"#111"}}>
              <td style={{...td,color:"#fff",fontWeight:900,fontSize:15}}>PRECIO AL CLIENTE</td>
              <td style={{...td,textAlign:"right",color:"#fff",fontWeight:900,fontSize:17}}>{fmtUF(precio)}</td>
              <td style={{...td,textAlign:"right",color:"#aaa",fontSize:13}}>{fmt(precio*ufVal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#888",marginBottom:16}}>Detalle de Fases</div>
        {fases.map((f)=>{
          const tot=calcFase(f,roles);const isP=f.mod==="Presencial";
          return (
            <div key={f.id} style={{marginBottom:12,border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{f.id}</div>
                <div style={{flex:1}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#111"}}>{f.nombre}</span>
                  <span style={{marginLeft:8,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:isP?"#fef9c3":"#dbeafe",color:isP?"#854d0e":"#1e40af"}}>{f.mod}</span>
                  <span style={{marginLeft:4,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#f3f4f6",color:"#6b7280"}}>{f.tipo}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:900,color:"#111"}}>{fmtUF(tot)}</div>
                  <div style={{fontSize:11,color:"#888"}}>{fmt(tot*ufVal)}</div>
                </div>
              </div>
              <div style={{padding:"10px 16px",fontSize:13,color:"#555",lineHeight:1.6}}>{f.desc}</div>
            </div>
          );
        })}
      </div>
      <div style={{borderTop:"1px solid #e5e7eb",paddingTop:16,fontSize:11,color:"#999",display:"flex",justifyContent:"space-between"}}>
        <span>Valor UF referencial: {fmt(ufVal)}. Precio final en UF del día de emisión.</span>
        <span>Consultoría Facilitada · {today}</span>
      </div>
    </div>
  );
}

export default function App(){
  const [apiKey,setApiKey]=useState(null);
  const [nombre,setNombre]=useState("");
  const [cliente,setCliente]=useState("");
  const [roles,setRoles]=useState(R0);
  const [nRolId,setNRolId]=useState(10);
  const [fases,setFases]=useState([]);
  const [buffer,setBuffer]=useState(15);
  const [util,setUtil]=useState(20);
  const [ufVal,setUfVal]=useState(38500);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const [showPrint,setShowPrint]=useState(false);
  const [nFaseId,setNFaseId]=useState(100);

  injectCSS();

  const tots=useMemo(()=>fases.map(f=>calcFase(f,roles)),[fases,roles]);
  const sub=tots.reduce((a,b)=>a+b,0);
  const bufUF=sub*buffer/100;
  const costo=sub+bufUF;
  const utilUF=costo*util/100;
  const precio=costo+utilUF;
  const hon=useMemo(()=>fases.reduce((s,f)=>s+f.asig.reduce((ss,a)=>{const r=roles.find(x=>x.id===a.rId);return r?ss+a.hT*r.terreno+a.hB*r.back:ss;},0),0),[fases,roles]);
  const traslTot=useMemo(()=>fases.reduce((s,f)=>s+f.trasl.reduce((ss,t)=>ss+(t.uf||0),0),0),[fases]);
  const matTot=useMemo(()=>fases.reduce((s,f)=>s+f.mat.reduce((ss,m)=>ss+(m.uf||0),0),0),[fases]);

  const handleTranscript=async(txt)=>{
    setLoading(true);setErr(null);
    try{
      const res=await generateFases(txt,roles,apiKey);
      if(res.nombre&&!nombre)setNombre(res.nombre);
      if(res.cliente&&!cliente)setCliente(res.cliente);
      const withIds=res.fases.map((f,i)=>({...f,id:i+1}));
      setFases(withIds);
      setNFaseId(withIds.length+1);
    }catch(e){
      setErr("Error al procesar: "+e.message);
    }finally{setLoading(false);}
  };

  const addFase=()=>{
    setFases(f=>f.concat([{id:nFaseId,nombre:"Nueva fase",mod:"Presencial",tipo:"Ejecucion",desc:"",asig:[{rId:roles[0]?.id||1,hT:0,hB:0}],trasl:[],mat:[]}]));
    setNFaseId(n=>n+1);
  };

  const handlePrint=()=>{
    setShowPrint(true);
    setTimeout(()=>{window.print();setTimeout(()=>setShowPrint(false),500);},150);
  };

  const cS={background:CARD,border:"1px solid "+BDR,borderRadius:16,padding:24,marginBottom:16};
  const h2S={fontSize:12,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:1.5,margin:"0 0 16px"};
  const iNum=(v,set,min,max,step)=>(
    <input type="number" min={min} max={max} step={step} value={v} onChange={e=>set(Number(e.target.value))}
      style={{width:"100%",background:"transparent",border:"1px solid "+BDR,borderRadius:8,padding:"10px 14px",fontSize:18,fontWeight:800,color:TXT,outline:"none",boxSizing:"border-box"}} />
  );

  const printProps={nombre,cliente,fases,roles,costo,precio,util,ufVal,buffer,traslTot,matTot,hon,bufUF,utilUF};

  if(!apiKey) return <ApiKeyModal onSave={setApiKey}/>;

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:BG,minHeight:"100vh",color:TXT}}>
      {showPrint&&(
        <div className="print-only" style={{position:"fixed",top:0,left:0,width:"100%",zIndex:9999,background:"#fff"}}>
          <PrintView {...printProps}/>
        </div>
      )}
      <div className="no-print" style={{padding:"32px 16px"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>

          <div style={{marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:MUT,textTransform:"uppercase",marginBottom:6}}>Consultoría Facilitada</div>
              <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre del proyecto..." style={{fontSize:24,fontWeight:800,color:TXT,background:"transparent",border:"none",outline:"none",width:"100%",padding:0}} />
              <input value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Cliente (opcional)" style={{fontSize:13,color:MUT,background:"transparent",border:"none",outline:"none",marginTop:4,padding:0}} />
            </div>
            {fases.length>0&&(
              <button onClick={handlePrint} style={{display:"flex",alignItems:"center",gap:8,background:GRN,border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:14,fontWeight:700,color:"#0f0f0f",flexShrink:0}}>
                ↓ Generar PDF
              </button>
            )}
          </div>

          <div style={{...cS,textAlign:"center"}}>
            <h2 style={{...h2S,textAlign:"center"}}>🎙 Describir proyecto por voz</h2>
            <p style={{fontSize:12,color:MUT,margin:"0 0 4px",lineHeight:1.7}}>
              Habla naturalmente: cliente, tipo de proyecto, fases, equipo, traslados, materiales.<br/>
              Claude estructurará la cotización automáticamente.
            </p>
            <VoiceButton onTranscript={handleTranscript} disabled={loading}/>
            {loading&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"12px 0"}}>
                <div style={{width:18,height:18,border:"2px solid "+BDR,borderTop:"2px solid "+GRN,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                <span style={{fontSize:13,color:MUT}}>Claude está estructurando tu cotización...</span>
              </div>
            )}
            {err&&<div style={{background:"#7f1d1d22",border:"1px solid #7f1d1d",borderRadius:8,padding:"10px 14px",fontSize:13,color:RED,marginTop:8}}>{err}</div>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>

          <div style={cS}>
            <h2 style={h2S}>Equipo y tarifas</h2>
            <div style={{display:"flex",gap:8,fontSize:11,color:MUT,marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+BDR}}>
              <span style={{flex:2}}>Rol</span>
              <span style={{flex:1,textAlign:"center"}}>UF/h terreno</span>
              <span style={{flex:1,textAlign:"center"}}>UF/h back</span>
              <span style={{width:24}}/>
            </div>
            {roles.map(r=>(
              <div key={r.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                <input value={r.nombre} onChange={e=>setRoles(roles.map(x=>x.id===r.id?{...x,nombre:e.target.value}:x))} style={{flex:2,background:"transparent",border:"1px solid "+BDR,borderRadius:6,padding:"6px 10px",fontSize:13,color:TXT,outline:"none"}} />
                <input type="number" min={0.5} max={20} step={0.5} value={r.terreno} onChange={e=>setRoles(roles.map(x=>x.id===r.id?{...x,terreno:Number(e.target.value)}:x))} style={{flex:1,background:"transparent",border:"1px solid "+BDR,borderRadius:6,padding:"6px 8px",fontSize:13,color:TXT,textAlign:"center",outline:"none"}} />
                <input type="number" min={0.5} max={20} step={0.5} value={r.back} onChange={e=>setRoles(roles.map(x=>x.id===r.id?{...x,back:Number(e.target.value)}:x))} style={{flex:1,background:"transparent",border:"1px solid "+BDR,borderRadius:6,padding:"6px 8px",fontSize:13,color:TXT,textAlign:"center",outline:"none"}} />
                <button onClick={()=>setRoles(roles.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:18,width:24}}>×</button>
              </div>
            ))}
            <button onClick={()=>{setRoles(roles.concat([{id:nRolId,nombre:"Nuevo rol",terreno:3,back:2}]));setNRolId(nRolId+1);}} style={{marginTop:8,width:"100%",padding:8,border:"1px dashed "+BDR,borderRadius:8,background:"none",cursor:"pointer",fontSize:13,color:MUT}}>+ Agregar rol</button>
          </div>

          <div style={cS}>
            <h2 style={h2S}>Parametros globales</h2>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:140}}>
                <div style={{fontSize:11,color:MUT,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Buffer complejidad (%)</div>
                {iNum(buffer,setBuffer,0,50,5)}
              </div>
              <div style={{flex:1,minWidth:140}}>
                <div style={{fontSize:11,color:MUT,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Valor UF (CLP)</div>
                {iNum(ufVal,setUfVal,30000,50000,100)}
              </div>
            </div>
          </div>

          <div style={cS}>
            <h2 style={h2S}>Fases del proyecto</h2>
            {fases.length===0?(
              <div style={{textAlign:"center",padding:"24px 0",color:MUT,fontSize:13}}>
                <div style={{fontSize:32,marginBottom:8}}>☝️</div>
                Usa el micrófono para generar las fases automáticamente,<br/>o agrégalas manualmente.
              </div>
            ):(
              fases.map((f,i)=><FRow key={f.id} f={f} roles={roles}
                onUpd={u=>setFases(fases.map((x,j)=>j===i?u:x))}
                onDel={()=>setFases(fases.filter((_,j)=>j!==i))}
              />)
            )}
            <button onClick={addFase} style={{marginTop:12,width:"100%",padding:10,border:"1px dashed "+BDR,borderRadius:8,background:"none",cursor:"pointer",fontSize:13,color:MUT}}>+ Agregar fase manualmente</button>
          </div>

          {fases.length>0&&(
            <div style={cS}>
              <h2 style={h2S}>Resumen de costos</h2>
              {[
                {label:"Honorarios equipo",val:hon,color:GRN},
                {label:"Traslados y viaticos",val:traslTot,color:YLW},
                {label:"Materiales y entregables",val:matTot,color:BLU},
                {label:`Buffer ${buffer}% complejidad`,val:bufUF,color:MUT},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid "+FAINT}}>
                  <div style={{width:10,height:10,borderRadius:2,background:item.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:13,color:MUT}}>{item.label}</span>
                  <span style={{fontSize:15,fontWeight:700,color:TXT}}>{fmtUF(item.val)}</span>
                  <span style={{fontSize:12,color:MUT,minWidth:90,textAlign:"right"}}>{fmt(item.val*ufVal)}</span>
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid "+BDR}}>
                <div style={{width:10,flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,fontWeight:700,color:TXT}}>Costo total</span>
                <span style={{fontSize:17,fontWeight:800,color:TXT}}>{fmtUF(costo)}</span>
                <span style={{fontSize:12,color:MUT,minWidth:90,textAlign:"right"}}>{fmt(costo*ufVal)}</span>
              </div>
              <div style={{background:FAINT,borderRadius:10,padding:16,margin:"16px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:1}}>Utilidad</span>
                  <span style={{fontSize:22,fontWeight:800,color:GRN}}>{util}%</span>
                </div>
                <input type="range" min={10} max={50} step={1} value={util} onChange={e=>setUtil(Number(e.target.value))} style={{width:"100%",accentColor:GRN,cursor:"pointer"}} />
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginTop:3}}><span>10%</span><span>50%</span></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                  <span style={{fontSize:12,color:MUT}}>Utilidad en UF</span>
                  <span style={{fontSize:14,fontWeight:700,color:GRN}}>+ {fmtUF(utilUF)}</span>
                </div>
              </div>
              <div style={{background:TXT,borderRadius:12,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Precio al cliente</div>
                  <div style={{fontSize:13,color:"#777"}}>Costo + {util}% utilidad</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:30,fontWeight:900,color:BG,lineHeight:1}}>{fmtUF(precio)}</div>
                  <div style={{fontSize:14,color:"#666",marginTop:4}}>{fmt(precio*ufVal)}</div>
                </div>
              </div>
              <div style={{textAlign:"center",marginTop:16}}>
                <button onClick={handlePrint} style={{display:"inline-flex",alignItems:"center",gap:10,background:GRN,border:"none",borderRadius:12,padding:"14px 32px",cursor:"pointer",fontSize:16,fontWeight:800,color:"#0f0f0f"}}>
                  ↓ Generar PDF / Imprimir
                </button>
                <p style={{fontSize:11,color:"#444",marginTop:10}}>Selecciona "Guardar como PDF" en el diálogo de impresión.</p>
              </div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"flex-end",marginTop:4,marginBottom:24}}>
            <button onClick={()=>{if(window.confirm("¿Cambiar API key?"))setApiKey(null);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#333"}}>🔑 Cambiar API key</button>
          </div>

        </div>
      </div>
    </div>
  );
}