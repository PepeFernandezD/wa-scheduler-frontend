const { useState, useEffect, useRef } = React;
const BACKEND = 'https://wa-scheduler-backend.onrender.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/contacts.readonly';
const PEOPLE_API = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers&pageSize=200';
const pad = n => String(n).padStart(2,'0');
const fmt = d => new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
function countdown(ts){const d=ts-Date.now();if(d<=0)return'Enviando...';const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000);return h>0?pad(h)+'h '+pad(m)+'m':pad(m)+'m '+pad(s)+'s';}

const S={
  page:{minHeight:'100vh',background:'#f0f2f5',display:'flex',alignItems:'center',justifyContent:'center',padding:16},
  card:{background:'#fff',borderRadius:24,padding:36,width:'100%',maxWidth:400,boxShadow:'0 4px 40px rgba(0,0,0,.08)',textAlign:'center'},
  logo:{width:52,height:52,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24},
  input:{width:'100%',padding:'11px 14px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit',background:'#fafafa'},
  btn:{width:'100%',padding:13,borderRadius:12,background:'#25d366',color:'#fff',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8},
  btnSm:{padding:'7px 12px',borderRadius:8,background:'#f5f5f5',color:'#555',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:12},
  btnP:{padding:'9px 18px',borderRadius:10,background:'#25d366',color:'#fff',border:'none',cursor:'pointer',fontWeight:600,fontSize:13},
  label:{display:'block',textAlign:'left',fontSize:12,fontWeight:600,color:'#555',marginBottom:5,marginTop:14},
  optCard:{background:'#fafafa',border:'1.5px solid #eee',borderRadius:12,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',marginTop:12,textAlign:'left'},
  qrBox:{background:'#f8f9fa',borderRadius:16,padding:20,margin:'20px 0',display:'flex',alignItems:'center',justifyContent:'center',minHeight:220},
  app:{minHeight:'100vh',background:'#f0f2f5',fontFamily:'inherit'},
  header:{background:'#fff',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 1px 0 #eee',position:'sticky',top:0,zIndex:10},
  main:{padding:20,maxWidth:600,margin:'0 auto'},
  stats:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:20},
  statCard:{background:'#fff',borderRadius:14,padding:'14px 10px',textAlign:'center',boxShadow:'0 1px 4px rgba(0,0,0,.06)'},
  msgCard:{background:'#fff',borderRadius:14,padding:16,boxShadow:'0 1px 4px rgba(0,0,0,.06)',marginBottom:10},
  badge:{background:'#e8f5e9',color:'#1b5e20',fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:20,whiteSpace:'nowrap'},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:100},
  modal:{background:'#fff',borderRadius:'20px 20px 0 0',padding:'24px 20px 36px',width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto'},
  contactList:{background:'#fff',border:'1.5px solid #eee',borderRadius:10,marginTop:4,overflow:'hidden',maxHeight:160,overflowY:'auto'},
  selBadge:{background:'#e8f5e9',color:'#1b5e20',fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:8,textAlign:'left',marginTop:4},
};

function Dots({active}){return(<div style={{display:'flex',gap:6,justifyContent:'center',marginTop:24}}>{[0,1,2].map(i=><span key={i} style={{width:8,height:8,borderRadius:4,background:i===active?'#25d366':'#e0e0e0'}}/>)}</div>);}

function WaIcon(){return(<svg width='22' height='22' viewBox='0 0 24 24' fill='currentColor'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg>);}

function App() {
  const [step,setStep]=useState(0);
  const [userName,setUserName]=useState('');
  const [qr,setQr]=useState(null);
  const [waReady,setWaReady]=useState(false);
  const [contacts,setContacts]=useState([]);
  const [messages,setMessages]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [tick,setTick]=useState(0);
  const [clientId,setClientId]=useState('');
  const [showGoogle,setShowGoogle]=useState(false);
  const [selContact,setSelContact]=useState(null);
  const [msgText,setMsgText]=useState('');
  const [schedAt,setSchedAt]=useState('');
  const [search,setSearch]=useState('');
  const [manualName,setManualName]=useState('');
  const [manualPhone,setManualPhone]=useState('');
  const [showManual,setShowManual]=useState(false);
  const pollRef=useRef(null);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),1000);return()=>clearInterval(id);},[]);
  useEffect(()=>{
    if(step!==1)return;
    pollRef.current=setInterval(async()=>{
      try{const r=await fetch(BACKEND+'/status');const d=await r.json();
        if(d.ready){setWaReady(true);setQr(null);clearInterval(pollRef.current);setStep(2);}
        else if(d.qr)setQr(d.qr);
      }catch{}
    },2000);
    return()=>clearInterval(pollRef.current);
  },[step]);
  useEffect(()=>{
    if(step!==3)return;
    const sync=async()=>{try{const r=await fetch(BACKEND+'/messages');const d=await r.json();setMessages(d);}catch{}};
    sync();const id=setInterval(sync,5000);return()=>clearInterval(id);
  },[step]);
  function startGoogle(){
    if(!clientId.trim())return;
    const p=new URLSearchParams({client_id:clientId.trim(),redirect_uri:'about:blank',response_type:'token',scope:GOOGLE_SCOPES});
    const popup=window.open('https://accounts.google.com/o/oauth2/v2/auth?'+p,'gauth','width=500,height=600');
    const poll=setInterval(()=>{try{if(popup.closed){clearInterval(poll);return;}const hash=popup.location.hash;if(hash?.includes('access_token')){const tk=new URLSearchParams(hash.slice(1)).get('access_token');popup.close();clearInterval(poll);fetchGoogle(tk);}}catch{}},500);
  }
  async function fetchGoogle(tkn){
    try{const r=await fetch(PEOPLE_API,{headers:{Authorization:'Bearer '+tkn}});const d=await r.json();
      const c=(d.connections||[]).map(x=>({id:x.resourceName,name:x.names?.[0]?.displayName||'Sin nombre',phone:x.phoneNumbers?.[0]?.value||''})).filter(x=>x.phone);
      setContacts(prev=>{const ex=new Set(prev.map(x=>x.id));return[...prev,...c.filter(x=>!ex.has(x.id))];});
      setShowGoogle(false);
    }catch{alert('Error al obtener contactos.');}
  }
  function addManual(){if(!manualName.trim()||!manualPhone.trim())return;setContacts(p=>[...p,{id:'m-'+Date.now(),name:manualName.trim(),phone:manualPhone.trim()}]);setManualName('');setManualPhone('');setShowManual(false);}
  async function scheduleMsg(){
    if(!selContact||!msgText.trim()||!schedAt)return alert('Completa todos los campos');
    if(new Date(schedAt).getTime()<=Date.now())return alert('Elige una fecha/hora futura');
    try{await fetch(BACKEND+'/schedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:selContact.phone,message:msgText.trim(),scheduledAt:schedAt,contactName:selContact.name})});
      setShowForm(false);setSelContact(null);setMsgText('');setSchedAt('');setSearch('');
    }catch{alert('Error al programar.');}
  }
  async function deleteMsg(id){try{await fetch(BACKEND+'/messages/'+id,{method:'DELETE'});}catch{}setMessages(p=>p.filter(m=>m.id!==id));}
  const filtered=contacts.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));
  const pending=messages.filter(m=>m.status==='pending').sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt));
  const sent=messages.filter(m=>m.status==='sent'||m.status==='error');
  const nowLocal=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  if(step===0)return(<div style={S.page}><div style={S.card}><div style={{...S.logo,background:'#e8f5e9',color:'#25d366'}}><WaIcon/></div><h1 style={{margin:0,fontSize:26,fontWeight:800}}>WA Scheduler</h1><p style={{margin:'8px 0 0',color:'#888',fontSize:14}}>Programa mensajes con envio automatico</p><label style={S.label}>Tu nombre</label><input style={S.input} placeholder='Ej: Rodrigo' value={userName} onChange={e=>setUserName(e.target.value)}/><button style={{...S.btn,marginTop:20,opacity:userName.trim()?1:0.4}} disabled={!userName.trim()} onClick={()=>setStep(1)}>Continuar</button><Dots active={0}/></div></div>);
  if(step===1)return(<div style={S.page}><div style={S.card}><div style={{...S.logo,background:'#e3f2fd',color:'#1565c0'}}>📱</div><h2 style={{margin:0,fontSize:22,fontWeight:700}}>Conectar WhatsApp</h2><p style={{margin:'8px 0 0',color:'#888',fontSize:14}}>Escanea el QR con tu celular</p><div style={S.qrBox}>{qr?<img src={qr} alt='QR' style={{width:200,height:200,borderRadius:8}}/>:<div style={{textAlign:'center'}}><div style={{fontSize:32,marginBottom:8}}>⏳</div><div style={{fontSize:13,color:'#888'}}>Generando QR...</div></div>}</div>{qr&&<div><p style={{fontSize:13,color:'#555',textAlign:'center',margin:'0 0 4px'}}>1. Abre WhatsApp en tu celular</p><p style={{fontSize:13,color:'#555',textAlign:'center',margin:'0 0 4px'}}>2. Menu - Dispositivos vinculados</p><p style={{fontSize:13,color:'#555',textAlign:'center'}}>3. Escanea este codigo</p></div>}<button style={{...S.btn,background:'#f5f5f5',color:'#888',marginTop:16,fontSize:13}} onClick={()=>setStep(0)}>Volver</button><Dots active={1}/></div></div>);
  if(step===2)return(<div style={S.page}><div style={{...S.card,maxWidth:460}}><div style={{...S.logo,background:'#e8f5e9',color:'#25d366'}}>✅</div><h2 style={{margin:0,fontSize:22,fontWeight:700}}>WhatsApp conectado!</h2><p style={{margin:'8px 0 0',color:'#888',fontSize:14}}>Importa tus contactos</p><div style={S.optCard} onClick={()=>setShowGoogle(v=>!v)}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>G</span><div><div style={{fontWeight:600,fontSize:14}}>Google Contacts</div><div style={{fontSize:12,color:'#888'}}>Importa todos tus contactos</div></div></div><span style={{color:'#aaa'}}>{showGoogle?'▲':'▼'}</span></div>{showGoogle&&<div style={{background:'#f8f9fa',borderRadius:12,padding:14,marginTop:8,textAlign:'left'}}><input style={{...S.input,marginBottom:8}} placeholder='Google Client ID' value={clientId} onChange={e=>setClientId(e.target.value)}/><button style={{...S.btn,opacity:clientId.trim()?1:0.4}} disabled={!clientId.trim()} onClick={startGoogle}>Autorizar con Google</button></div>}<div style={{...S.optCard,marginTop:10}} onClick={()=>setShowManual(v=>!v)}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>✏️</span><div><div style={{fontWeight:600,fontSize:14}}>Agregar manualmente</div><div style={{fontSize:12,color:'#888'}}>Nombre y numero</div></div></div><span style={{color:'#aaa'}}>{showManual?'▲':'▼'}</span></div>{showManual&&<div style={{display:'flex',gap:8,marginTop:8}}><input style={{...S.input,flex:1,margin:0}} placeholder='Nombre' value={manualName} onChange={e=>setManualName(e.target.value)}/><input style={{...S.input,flex:1,margin:0}} placeholder='+56912345678' value={manualPhone} onChange={e=>setManualPhone(e.target.value)}/><button style={{...S.btn,width:'auto',padding:'0 14px'}} onClick={addManual}>OK</button></div>}{contacts.length>0&&<div style={{...S.selBadge,marginTop:12}}>✔ {contacts.length} contacto{contacts.length!==1?'s':''} importado{contacts.length!==1?'s':''}</div>}<button style={{...S.btn,marginTop:20}} onClick={()=>setStep(3)}>{contacts.length>0?'Ir a la app':'Continuar'}</button><Dots active={2}/></div></div>);
  return(<div style={S.app}><header style={S.header}><div style={{display:'flex',alignItems:'center',gap:10}}><div style={{...S.logo,width:34,height:34,borderRadius:10,color:'#25d366',background:'#e8f5e9',margin:0}}><WaIcon/></div><div><div style={{fontWeight:700,fontSize:15}}>WA Scheduler</div><div style={{fontSize:11,color:'#25d366'}}>Conectado - Hola {userName}</div></div></div><button style={S.btnP} onClick={()=>setShowForm(true)}>+ Nuevo</button></header><main style={S.main}><div style={S.stats}>{[['⏳',pending.length,'Pendientes','#25d366'],['✅',sent.filter(m=>m.status==='sent').length,'Enviados','#1565c0'],['👥',contacts.length,'Contactos','#6a1b9a']].map(([ic,n,lb,cl])=><div key={lb} style={S.statCard}><div style={{fontSize:22,fontWeight:800,color:cl}}>{n}</div><div style={{fontSize:11,color:'#999',marginTop:2}}>{lb}</div></div>)}</div>{pending.length>0&&<section><div style={{fontWeight:700,fontSize:13,color:'#777',marginBottom:10}}>PROGRAMADOS</div>{pending.map(m=><div key={m.id} style={S.msgCard}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><div style={{fontWeight:600,fontSize:14}}>{m.contactName||m.phone}</div><div style={{fontSize:11,color:'#aaa'}}>{m.phone}</div></div><div style={S.badge}>{countdown(new Date(m.scheduledAt).getTime())}</div></div><div style={{fontSize:13,color:'#555',marginTop:10,background:'#fafafa',borderRadius:8,padding:'8px 12px',borderLeft:'3px solid #25d366'}}>'{m.message}'</div><div style={{display:'flex',justifyContent:'space-between',marginTop:10}}><div style={{fontSize:11,color:'#bbb'}}>{fmt(m.scheduledAt)}</div><button style={{...S.btnSm,color:'#e53935'}} onClick={()=>deleteMsg(m.id)}>Cancelar</button></div></div>)}</section>}{sent.length>0&&<section style={{marginTop:20}}><div style={{fontWeight:700,fontSize:13,color:'#777',marginBottom:10}}>HISTORIAL</div>{sent.map(m=><div key={m.id} style={{...S.msgCard,opacity:.6,background:'#f9f9f9'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:600,fontSize:13}}>{m.contactName||m.phone}</div><div style={{fontSize:11,color:m.status==='error'?'#e53935':'#aaa'}}>{m.status==='error'?'Error':'Enviado'} - {fmt(m.scheduledAt)}</div></div><div style={{fontSize:12,color:'#888',marginTop:4}}>{m.message?.slice(0,80)}</div></div>)}</section>}{pending.length===0&&sent.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'#bbb'}}><div style={{fontSize:48}}>📭</div><div style={{fontWeight:600,marginTop:12}}>Sin mensajes aun</div><div style={{fontSize:13,marginTop:4}}>Presiona + Nuevo para programar</div></div>}</main>{showForm&&<div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setShowForm(false)}><div style={S.modal}><h3 style={{margin:'0 0 16px',fontSize:17}}>Nuevo mensaje</h3><label style={S.label}>Buscar contacto</label><input style={S.input} placeholder='Nombre o numero...' value={search} onChange={e=>{setSearch(e.target.value);setSelContact(null);}}/>{search.length>0&&!selContact&&<div style={S.contactList}>{filtered.slice(0,6).map(c=><div key={c.id} style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f5f5f5'}} onClick={()=>{setSelContact(c);setSearch(c.name);}}><div style={{fontWeight:500,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:'#888'}}>{c.phone}</div></div>)}{filtered.length===0&&<div style={{padding:'10px 14px',fontSize:13,color:'#aaa'}}>Sin resultados</div>}</div>}{selContact&&<div style={S.selBadge}>✔ {selContact.name} - {selContact.phone}</div>}<button style={{...S.btnSm,marginTop:4,marginBottom:8,color:'#1976d2',border:'1px dashed #90caf9',width:'100%',justifyContent:'center',background:'none'}} onClick={()=>setShowManual(v=>!v)}>+ Numero manual</button>{showManual&&<div style={{display:'flex',gap:8,marginBottom:10}}><input style={{...S.input,flex:1,margin:0}} placeholder='Nombre' value={manualName} onChange={e=>setManualName(e.target.value)}/><input style={{...S.input,flex:1,margin:0}} placeholder='+56912345678' value={manualPhone} onChange={e=>setManualPhone(e.target.value)}/><button style={{...S.btn,width:'auto',padding:'0 12px'}} onClick={()=>{if(manualName.trim()&&manualPhone.trim()){const c={id:'m-'+Date.now(),name:manualName.trim(),phone:manualPhone.trim()};setContacts(p=>[...p,c]);setSelContact(c);setSearch(c.name);setManualName('');setManualPhone('');setShowManual(false);}}}>OK</button></div>}<label style={S.label}>Mensaje</label><textarea style={{...S.input,height:80,resize:'vertical'}} placeholder='Escribe tu mensaje...' value={msgText} onChange={e=>setMsgText(e.target.value)}/><label style={S.label}>Fecha y hora</label><input type='datetime-local' style={S.input} min={nowLocal} value={schedAt} onChange={e=>setSchedAt(e.target.value)}/><div style={{display:'flex',gap:10,marginTop:12}}><button style={{...S.btn,background:'#f0f0f0',color:'#555',flex:1}} onClick={()=>setShowForm(false)}>Cancelar</button><button style={{...S.btn,flex:2}} onClick={scheduleMsg}>Programar</button></div></div></div>}</div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
