const { useState, useEffect, useRef } = React;
const BACKEND = 'https://wa-scheduler-backend-1.onrender.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/contacts.readonly';
const PEOPLE_API = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses&pageSize=500';

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

async function api(path, opts={}, token) {
  const r = await fetch(BACKEND+path, {
    ...opts,
    headers: { 'Content-Type':'application/json', ...(token ? {Authorization:'Bearer '+token} : {}), ...(opts.headers||{}) }
  });
  const text = await r.text();
  try { return JSON.parse(text); }
  catch { return { error: r.ok ? 'Respuesta inesperada del servidor' : `Error ${r.status}: ${text.slice(0,120)}` }; }
}

function ContactsModal({onClose, contacts, setContacts, token, waReady}) {
  const [tab, setTab] = useState('whatsapp');
  const [clientId, setClientId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [waContacts, setWaContacts] = useState([]);
  const [waSelected, setWaSelected] = useState([]);

  async function loadWaContacts() {
    setLoading(true); setMsg('');
    try {
      const data = await api('/wa-contacts', {}, token);
      if (data.error) { setMsg('❌ '+data.error); setLoading(false); return; }
      if (!Array.isArray(data)) { setMsg('❌ Respuesta inesperada del servidor'); setLoading(false); return; }
      setWaContacts(data);
      setMsg(data.length > 0 ? '✅ '+data.length+' contactos encontrados' : '⚠️ No se encontraron contactos');
    } catch(e) { setMsg('❌ Error al cargar: '+e.message); }
    setLoading(false);
  }

  async function importWaSelected() {
    const toImport = waSelected.length > 0 ? waContacts.filter((_,i)=>waSelected.includes(i)) : waContacts;
    if (!toImport.length) return;
    setLoading(true);
    try {
      const res = await api('/contacts/bulk', {method:'POST', body:JSON.stringify({contacts:toImport.map(c=>({...c,source:'whatsapp'}))})}, token);
      if (res.error) { setMsg('❌ '+res.error); setLoading(false); return; }
      const fresh = await api('/contacts', {}, token);
      if (!fresh.error) setContacts(fresh);
      setMsg('✅ '+(res.inserted||toImport.length)+' contactos importados de WhatsApp');
    } catch(e) { setMsg('❌ Error al importar: '+e.message); }
    setLoading(false);
  }

  function startGoogle() {
    if (!clientId.trim()) return;
    const p = new URLSearchParams({client_id:clientId.trim(), redirect_uri:'about:blank', response_type:'token', scope:GOOGLE_SCOPES});
    const popup = window.open('https://accounts.google.com/o/oauth2/v2/auth?'+p,'gauth','width=500,height=600');
    setLoading(true);
    const poll = setInterval(()=>{
      try {
        if(popup.closed){clearInterval(poll);setLoading(false);return;}
        const hash=popup.location.hash;
        if(hash?.includes('access_token')){
          const tk=new URLSearchParams(hash.slice(1)).get('access_token');
          popup.close(); clearInterval(poll);
          fetchGoogle(tk);
        }
      } catch {}
    },500);
  }

  async function fetchGoogle(tkn) {
    try {
      const r = await fetch(PEOPLE_API,{headers:{Authorization:'Bearer '+tkn}});
      const d = await r.json();
      const c = (d.connections||[]).map(x=>({name:x.names?.[0]?.displayName||'Sin nombre',phone:x.phoneNumbers?.[0]?.value||'',email:x.emailAddresses?.[0]?.value||''})).filter(x=>x.phone);
      if (c.length) {
        await api('/contacts/bulk',{method:'POST',body:JSON.stringify({contacts:c.map(x=>({...x,source:'google'}))})},token);
        const fresh = await api('/contacts',{},token);
        setContacts(fresh);
        setMsg('✅ '+c.length+' contactos de Google importados');
      }
    } catch { setMsg('❌ Error al importar de Google'); }
    setLoading(false);
  }

  async function addManual() {
    if (!manualName.trim()||!manualPhone.trim()) return;
    const data = await api('/contacts',{method:'POST',body:JSON.stringify({name:manualName.trim(),phone:manualPhone.trim()})},token);
    if (!data.error) {
      setContacts(p=>[...p.filter(c=>c.phone!==data.phone),data]);
      setMsg('✅ Contacto agregado: '+manualName.trim());
      setManualName(''); setManualPhone('');
    } else setMsg('❌ '+data.error);
  }

  const tabStyle = t => ({flex:1,padding:'8px 4px',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,background:tab===t?'#fff':'transparent',color:tab===t?'#25d366':'#999',borderBottom:tab===t?'2px solid #25d366':'2px solid transparent'});

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0,fontSize:17}}>👥 Importar contactos</h3>
          <button style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#aaa'}} onClick={onClose}>×</button>
        </div>
        <div style={{display:'flex',borderBottom:'2px solid #f0f0f0',marginBottom:16}}>
          <button style={tabStyle('whatsapp')} onClick={()=>setTab('whatsapp')}>WhatsApp</button>
          <button style={tabStyle('google')} onClick={()=>setTab('google')}>Google</button>
          <button style={tabStyle('manual')} onClick={()=>setTab('manual')}>Manual</button>
        </div>

        {tab==='whatsapp' && (
          <div>
            <p style={{fontSize:13,color:'#666',margin:'0 0 12px'}}>Importa tus contactos directamente desde WhatsApp conectado.</p>
            {!waReady && <div style={{padding:'10px 14px',background:'#fff3cd',borderRadius:8,fontSize:13,color:'#856404',marginBottom:12}}>⚠️ Primero conecta tu WhatsApp</div>}
            {waReady && waContacts.length===0 && (
              <button style={{...S.btn,opacity:loading?0.5:1}} disabled={loading} onClick={loadWaContacts}>
                {loading?'⏳ Cargando...':'📱 Cargar contactos de WhatsApp'}
              </button>
            )}
            {waContacts.length>0 && (
              <div>
                <div style={{fontSize:13,color:'#555',marginBottom:8}}>{waContacts.length} contactos. Selecciona o importa todos:</div>
                <div style={{...S.contactList,maxHeight:200}}>
                  {waContacts.map((c,i)=>(
                    <div key={i} style={{padding:'8px 14px',cursor:'pointer',borderBottom:'1px solid #f5f5f5',display:'flex',alignItems:'center',gap:8,background:waSelected.includes(i)?'#f0fff4':'white',userSelect:'none'}} onMouseDown={(e)=>{e.preventDefault();setWaSelected(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);}}>
                      <span style={{fontSize:16,pointerEvents:'none'}}>{waSelected.includes(i)?'✅':'⬜'}</span>
                      <div><div style={{fontWeight:500,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:'#888'}}>{c.phone}</div></div>
                    </div>
                  ))}
                </div>
                <button style={{...S.btn,marginTop:12,opacity:loading?0.5:1}} disabled={loading} onClick={importWaSelected}>
                  {loading?'⏳ Importando...':'⬇️ Importar '+(waSelected.length>0?waSelected.length+' seleccionados':'todos')}
                </button>
              </div>
            )}
          </div>
        )}

        {tab==='google' && (
          <div>
            <p style={{fontSize:13,color:'#666',margin:'0 0 12px'}}>Conecta Google Contacts. Necesitas el Client ID de Google Cloud Console.</p>
            <label style={S.label}>Google Client ID</label>
            <input style={S.input} placeholder='xxxxx.apps.googleusercontent.com' value={clientId} onChange={e=>setClientId(e.target.value)}/>
            <button style={{...S.btn,marginTop:12,opacity:clientId.trim()&&!loading?1:0.4}} disabled={!clientId.trim()||loading} onClick={startGoogle}>
              {loading?'⏳ Conectando...':'🔗 Conectar Google Contacts'}
            </button>
          </div>
        )}

        {tab==='manual' && (
          <div>
            <p style={{fontSize:13,color:'#666',margin:'0 0 12px'}}>Agrega un contacto con nombre y número.</p>
            <label style={S.label}>Nombre</label>
            <input style={S.input} placeholder='Nombre del contacto' value={manualName} onChange={e=>setManualName(e.target.value)}/>
            <label style={S.label}>Número WhatsApp</label>
            <input style={S.input} placeholder='+56912345678' value={manualPhone} onChange={e=>setManualPhone(e.target.value)}/>
            <button style={{...S.btn,marginTop:12,opacity:(manualName&&manualPhone)?1:0.4}} disabled={!manualName||!manualPhone} onClick={addManual}>
              ➕ Agregar contacto
            </button>
          </div>
        )}

        {msg && <div style={{marginTop:12,padding:'10px 14px',background:'#f0fff4',borderRadius:10,fontSize:13,color:'#1b5e20'}}>{msg}</div>}
        <div style={{marginTop:16,fontSize:12,color:'#aaa',textAlign:'center'}}>{contacts.length} contacto{contacts.length!==1?'s':''} en total</div>
      </div>
    </div>
  );
}

function OnboardingWaImport({token, waReady, contacts, setContacts, onDone}) {
  const [waContacts, setWaContacts] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [imported, setImported] = React.useState(false);

  async function loadWa() {
    setLoading(true); setMsg('');
    try {
      const data = await api('/wa-contacts', {}, token);
      if (data.error) { setMsg('❌ '+data.error); setLoading(false); return; }
      if (!Array.isArray(data) || data.length===0) { setMsg('⚠️ No se encontraron contactos en WhatsApp'); setLoading(false); return; }
      setWaContacts(data);
      setSelected(data.map((_,i)=>i)); // select all by default
      setMsg('');
    } catch(e) { setMsg('❌ '+e.message); }
    setLoading(false);
  }

  async function doImport() {
    const toImport = selected.length>0 ? waContacts.filter((_,i)=>selected.includes(i)) : waContacts;
    if (!toImport.length) return;
    setLoading(true);
    try {
      const res = await api('/contacts/bulk',{method:'POST',body:JSON.stringify({contacts:toImport.map(c=>({...c,source:'whatsapp'}))})},token);
      if (res.error) { setMsg('❌ '+res.error); setLoading(false); return; }
      const fresh = await api('/contacts',{},token);
      if (!fresh.error) setContacts(fresh);
      setImported(true);
      setMsg('✅ '+(res.inserted||toImport.length)+' contactos importados');
    } catch(e) { setMsg('❌ '+e.message); }
    setLoading(false);
  }

  function toggleAll() {
    setSelected(selected.length===waContacts.length ? [] : waContacts.map((_,i)=>i));
  }

  return (
    <div style={{marginTop:16}}>
      {waContacts.length===0 && !imported && (
        <button style={{...S.btn,background:'#e8f5e9',color:'#1b5e20',border:'1.5px solid #a5d6a7',opacity:loading?0.5:1}} disabled={loading} onClick={loadWa}>
          {loading?'⏳ Cargando contactos...':'📱 Importar desde WhatsApp'}
        </button>
      )}
      {waContacts.length>0 && !imported && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <span style={{fontSize:13,color:'#555',fontWeight:600}}>{waContacts.length} contactos</span>
            <button style={{...S.btnSm,fontSize:11}} onClick={toggleAll}>{selected.length===waContacts.length?'Deseleccionar todos':'Seleccionar todos'}</button>
          </div>
          <div style={{...S.contactList,maxHeight:180,marginBottom:8}}>
            {waContacts.map((c,i)=>(
              <div key={i} style={{padding:'7px 12px',cursor:'pointer',borderBottom:'1px solid #f5f5f5',display:'flex',alignItems:'center',gap:8,background:selected.includes(i)?'#f0fff4':'white',userSelect:'none'}} onMouseDown={(e)=>{e.preventDefault();setSelected(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);}}>
                <span style={{fontSize:15,pointerEvents:'none'}}>{selected.includes(i)?'✅':'⬜'}</span>
                <div style={{textAlign:'left'}}>
                  <div style={{fontWeight:500,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:'#888'}}>{c.phone}</div>
                </div>
              </div>
            ))}
          </div>
          <button style={{...S.btn,opacity:loading||selected.length===0?0.4:1}} disabled={loading||selected.length===0} onClick={doImport}>
            {loading?'⏳ Importando...':(`⬇️ Importar ${selected.length} contacto${selected.length!==1?'s':''}`)}
          </button>
        </div>
      )}
      {msg && <div style={{marginTop:10,padding:'9px 12px',background:msg.startsWith('✅')?'#f0fff4':'#fff3f3',borderRadius:8,fontSize:13,color:msg.startsWith('✅')?'#1b5e20':'#c00'}}>{msg}</div>}
      <button style={{...S.btn,background:'#f5f5f5',color:'#555',marginTop:12}} onClick={onDone}>
        {contacts.length>0?`Continuar (${contacts.length} contactos) →`:'Continuar sin contactos →'}
      </button>
    </div>
  );
}

function App() {
  const [step, setStep] = useState(0); // 0=auth, 1=qr, 2=importar, 3=app
  const [authMode, setAuthMode] = useState('login'); // 'login'|'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [qr, setQr] = useState(null);
  const [waReady, setWaReady] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [tick, setTick] = useState(0);
  const [selContact, setSelContact] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [schedAt, setSchedAt] = useState('');
  const [search, setSearch] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [showManual, setShowManual] = useState(false);
  const pollRef = useRef(null);

  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),1000);return()=>clearInterval(id);},[]);

  useEffect(()=>{
    if(step!==1)return;
    pollRef.current=setInterval(async()=>{
      try{
        const d=await api('/status',{},token);
        if(d.ready){setWaReady(true);setQr(null);clearInterval(pollRef.current);
          const c=await api('/contacts',{},token);setContacts(c);setStep(2);}
        else if(d.qr) setQr(d.qr);
      }catch{}
    },2000);
    return()=>clearInterval(pollRef.current);
  },[step,token]);

  // Load contacts from DB whenever token becomes available (or changes)
  useEffect(()=>{
    if(!token) return;
    api('/contacts',{},token).then(d=>{ if(Array.isArray(d) && d.length>=0) setContacts(d); });
  },[token]);

  useEffect(()=>{
    if(step!==3)return;
    const sync=async()=>{try{const d=await api('/messages',{},token);setMessages(d);}catch{}};
    sync();const id=setInterval(sync,5000);return()=>clearInterval(id);
  },[step,token]);

  async function handleAuth() {
    setAuthError(''); setAuthLoading(true);
    try {
      const endpoint = authMode==='login' ? '/auth/login' : '/auth/register';
      const body = authMode==='login' ? {email,password} : {email,password,name};
      const data = await api(endpoint, {method:'POST', body:JSON.stringify(body)});
      if (data.error) { setAuthError(data.error); setAuthLoading(false); return; }
      setToken(data.token); setUser(data.user);
      // Check if WA session is already active — skip QR if so
      const status = await api('/status', {}, data.token);
      if (status.ready) {
        setWaReady(true);
        setStep(3); // Skip QR, contacts will load via useEffect([token])
      } else {
        setStep(1); // Need QR
      }
    } catch(e) { setAuthError('Error de conexión'); }
    setAuthLoading(false);
  }

  async function scheduleMsg(){
    if(!selContact||!msgText.trim()||!schedAt)return alert('Completa todos los campos');
    if(new Date(schedAt).getTime()<=Date.now())return alert('Elige una fecha/hora futura');
    try{
      await api('/schedule',{method:'POST',body:JSON.stringify({phone:selContact.phone,message:msgText.trim(),scheduledAt:new Date(schedAt).toISOString(),contactName:selContact.name})},token);
      setShowForm(false);setSelContact(null);setMsgText('');setSchedAt('');setSearch('');
    }catch{alert('Error al programar.');}
  }

  async function deleteMsg(id){
    try{await api('/messages/'+id,{method:'DELETE'},token);}catch{}
    setMessages(p=>p.filter(m=>m.id!==id));
  }

  const filtered=contacts.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));
  const pending=messages.filter(m=>m.status==='pending').sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt));
  const sent=messages.filter(m=>m.status==='sent'||m.status==='error');
  const nowLocal=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);

  // ---- PASO 0: Login / Registro ----
  if(step===0) return(
    <div style={S.page}><div style={S.card}>
      <div style={{...S.logo,background:'#e8f5e9',color:'#25d366'}}><WaIcon/></div>
      <h1 style={{margin:0,fontSize:26,fontWeight:800}}>WA Scheduler</h1>
      <p style={{margin:'8px 0 20px',color:'#888',fontSize:14}}>Programa mensajes con envio automatico</p>
      <div style={{display:'flex',background:'#f5f5f5',borderRadius:10,padding:3,marginBottom:16}}>
        <button style={{flex:1,padding:'8px 0',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:13,background:authMode==='login'?'#fff':'transparent',color:authMode==='login'?'#222':'#999',boxShadow:authMode==='login'?'0 1px 4px rgba(0,0,0,.1)':'none'}} onClick={()=>{setAuthMode('login');setAuthError('');}}>Entrar</button>
        <button style={{flex:1,padding:'8px 0',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:13,background:authMode==='register'?'#fff':'transparent',color:authMode==='register'?'#222':'#999',boxShadow:authMode==='register'?'0 1px 4px rgba(0,0,0,.1)':'none'}} onClick={()=>{setAuthMode('register');setAuthError('');}}>Crear cuenta</button>
      </div>
      {authMode==='register'&&<><label style={S.label}>Tu nombre</label><input style={S.input} placeholder='Ej: Rodrigo' value={name} onChange={e=>setName(e.target.value)}/></>}
      <label style={S.label}>Email</label>
      <input style={S.input} type='email' placeholder='tu@email.com' value={email} onChange={e=>setEmail(e.target.value)}/>
      <label style={S.label}>Contraseña</label>
      <input style={S.input} type='password' placeholder='••••••••' value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAuth()}/>
      {authError&&<div style={{marginTop:10,padding:'8px 12px',background:'#fff0f0',borderRadius:8,fontSize:13,color:'#c00'}}>{authError}</div>}
      <button style={{...S.btn,marginTop:20,opacity:(email&&password&&(authMode==='login'||name))&&!authLoading?1:0.4}} disabled={!email||!password||(authMode==='register'&&!name)||authLoading} onClick={handleAuth}>
        {authLoading?'⏳ Cargando...':(authMode==='login'?'Entrar':'Crear cuenta')}
      </button>
    </div></div>
  );

  // ---- PASO 1: QR ----
  if(step===1) return(
    <div style={S.page}><div style={S.card}>
      <div style={{...S.logo,background:'#e3f2fd',color:'#1565c0'}}>📱</div>
      <h2 style={{margin:0,fontSize:22,fontWeight:700}}>Conectar WhatsApp</h2>
      <p style={{margin:'8px 0 0',color:'#888',fontSize:14}}>Hola {user?.name} — escanea el QR con tu celular</p>
      <div style={S.qrBox}>
        {qr?<img src={qr} alt='QR' style={{width:200,height:200,borderRadius:8}}/>
          :<div style={{textAlign:'center'}}><div style={{fontSize:32,marginBottom:8}}>⏳</div><div style={{fontSize:13,color:'#888'}}>Generando QR...</div></div>}
      </div>
      {qr&&<div>
        <p style={{fontSize:13,color:'#555',textAlign:'center',margin:'0 0 4px'}}>1. Abre WhatsApp en tu celular</p>
        <p style={{fontSize:13,color:'#555',textAlign:'center',margin:'0 0 4px'}}>2. Menu - Dispositivos vinculados</p>
        <p style={{fontSize:13,color:'#555',textAlign:'center'}}>3. Escanea este codigo</p>
      </div>}
      <button style={{...S.btn,background:'#f5f5f5',color:'#888',marginTop:16,fontSize:13}} onClick={()=>setStep(0)}>Cerrar sesion</button>
      <Dots active={1}/>
    </div></div>
  );

  // ---- PASO 2: Importar desde WA ----
  if(step===2) return(
    <div style={S.page}><div style={{...S.card,maxWidth:460}}>
      <div style={{...S.logo,background:'#e8f5e9',color:'#25d366'}}>✅</div>
      <h2 style={{margin:0,fontSize:22,fontWeight:700}}>WhatsApp conectado!</h2>
      <p style={{margin:'8px 0 4px',color:'#888',fontSize:14}}>Hola {user?.name} — importa tus contactos</p>
      <OnboardingWaImport token={token} waReady={waReady} contacts={contacts} setContacts={setContacts} onDone={()=>setStep(3)}/>
      <Dots active={2}/>
    </div></div>
  );

  // ---- PASO 3: App Principal ----
  return(
    <div style={S.app}>
      <header style={S.header}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{...S.logo,width:34,height:34,borderRadius:10,color:'#25d366',background:'#e8f5e9',margin:0}}><WaIcon/></div>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>WA Scheduler</div>
            <div style={{fontSize:11,color:'#25d366'}}>✅ Conectado · Hola {user?.name}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button style={{...S.btnSm,color:'#1565c0',background:'#e3f2fd'}} onClick={()=>setShowContacts(true)}>👥 Contactos</button>
          <button style={S.btnP} onClick={()=>{setShowForm(true);api('/contacts',{},token).then(d=>{if(Array.isArray(d)&&d.length>0)setContacts(d);});}}>+ Nuevo</button>
        </div>
      </header>
      <main style={S.main}>
        <div style={S.stats}>
          {[['⏳',pending.length,'Pendientes','#25d366'],['✅',sent.filter(m=>m.status==='sent').length,'Enviados','#1565c0'],['👥',contacts.length,'Contactos','#6a1b9a']].map(([ic,n,lb,cl])=>
            <div key={lb} style={S.statCard}><div style={{fontSize:22,fontWeight:800,color:cl}}>{n}</div><div style={{fontSize:11,color:'#999',marginTop:2}}>{lb}</div></div>
          )}
        </div>
        {pending.length>0&&<section>
          <div style={{fontWeight:700,fontSize:13,color:'#777',marginBottom:10}}>PROGRAMADOS</div>
          {pending.map(m=><div key={m.id} style={S.msgCard}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><div style={{fontWeight:600,fontSize:14}}>{m.contactName||m.phone}</div><div style={{fontSize:11,color:'#aaa'}}>{m.phone}</div></div>
              <div style={S.badge}>{countdown(new Date(m.scheduledAt).getTime())}</div>
            </div>
            <div style={{fontSize:13,color:'#555',marginTop:10,background:'#fafafa',borderRadius:8,padding:'8px 12px',borderLeft:'3px solid #25d366'}}>"{m.message}"</div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
              <div style={{fontSize:11,color:'#bbb'}}>{fmt(m.scheduledAt)}</div>
              <button style={{...S.btnSm,color:'#e53935'}} onClick={()=>deleteMsg(m.id)}>Cancelar</button>
            </div>
          </div>)}
        </section>}
        {sent.length>0&&<section style={{marginTop:20}}>
          <div style={{fontWeight:700,fontSize:13,color:'#777',marginBottom:10}}>HISTORIAL</div>
          {sent.map(m=><div key={m.id} style={{...S.msgCard,opacity:.6,background:'#f9f9f9'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div style={{fontWeight:600,fontSize:13}}>{m.contactName||m.phone}</div>
              <div style={{fontSize:11,color:m.status==='error'?'#e53935':'#aaa'}}>{m.status==='error'?'❌ Error':'✅ Enviado'} · {fmt(m.scheduledAt)}</div>
            </div>
            <div style={{fontSize:12,color:'#888',marginTop:4}}>{m.message?.slice(0,80)}</div>
          </div>)}
        </section>}
        {pending.length===0&&sent.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'#bbb'}}>
          <div style={{fontSize:48}}>📭</div>
          <div style={{fontWeight:600,marginTop:12}}>Sin mensajes aun</div>
          <div style={{fontSize:13,marginTop:4}}>Presiona + Nuevo para programar</div>
        </div>}
      </main>
      {showContacts&&<ContactsModal onClose={()=>setShowContacts(false)} contacts={contacts} setContacts={setContacts} token={token} waReady={waReady}/>}
      {showForm&&<div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
        <div style={S.modal}>
          <h3 style={{margin:'0 0 16px',fontSize:17}}>Nuevo mensaje</h3>
          <label style={S.label}>Buscar contacto</label>
          <input style={S.input} placeholder='Nombre o numero...' value={search} onChange={e=>{setSearch(e.target.value);setSelContact(null);}}/>
          {!selContact&&<div style={S.contactList}>
            {filtered.slice(0,6).map(c=><div key={c.id||c.phone} style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f5f5f5'}} onClick={()=>{setSelContact(c);setSearch(c.name);}}>
              <div style={{fontWeight:500,fontSize:13}}>{c.name}</div>
              <div style={{fontSize:11,color:'#888'}}>{c.phone}</div>
            </div>)}
            {filtered.length===0&&<div style={{padding:'10px 14px',fontSize:13,color:'#aaa'}}>{contacts.length===0?'Cargando contactos...':'Sin resultados'}</div>}
          </div>}
          {selContact&&<div style={S.selBadge}>✔ {selContact.name} · {selContact.phone}</div>}
          <button style={{...S.btnSm,marginTop:4,marginBottom:8,color:'#1976d2',border:'1px dashed #90caf9',width:'100%',justifyContent:'center',background:'none'}} onClick={()=>setShowManual(v=>!v)}>
            + Numero manual
          </button>
          {showManual&&<div style={{display:'flex',gap:8,marginBottom:10}}>
            <input style={{...S.input,flex:1,margin:0}} placeholder='Nombre' value={manualName} onChange={e=>setManualName(e.target.value)}/>
            <input style={{...S.input,flex:1,margin:0}} placeholder='+56912345678' value={manualPhone} onChange={e=>setManualPhone(e.target.value)}/>
            <button style={{...S.btn,width:'auto',padding:'0 12px'}} onClick={()=>{if(manualName.trim()&&manualPhone.trim()){const c={id:'m-'+Date.now(),name:manualName.trim(),phone:manualPhone.trim()};setContacts(p=>[...p,c]);setSelContact(c);setSearch(c.name);setManualName('');setManualPhone('');setShowManual(false);}}}>OK</button>
          </div>}
          <label style={S.label}>Mensaje</label>
          <textarea style={{...S.input,height:80,resize:'vertical'}} placeholder='Escribe tu mensaje...' value={msgText} onChange={e=>setMsgText(e.target.value)}/>
          <label style={S.label}>Fecha y hora</label>
          <input type='datetime-local' style={S.input} min={nowLocal} value={schedAt} onChange={e=>setSchedAt(e.target.value)}/>
          <div style={{display:'flex',gap:10,marginTop:12}}>
            <button style={{...S.btn,background:'#f0f0f0',color:'#555',flex:1}} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={{...S.btn,flex:2}} onClick={scheduleMsg}>Programar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
