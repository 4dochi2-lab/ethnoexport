/* EthnoExport — Supabase-backed logic (real auth, DB, storage) */
const SUPA_URL = 'https://sizpugjktcqtrvaudtbr.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpenB1Z2prdGNxdHJ2YXVkdGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTQyMzcsImV4cCI6MjA5ODU5MDIzN30.lElf9mAKR_xYTTjcgDxlfJ7WzGzN6EHCWW12hTRFfQ4';
const SB = window.supabase.createClient(SUPA_URL, SUPA_KEY);

const EE = (() => {
  // ---- theme ----
  function initTheme(){
    const r=document.documentElement;
    const s=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
    r.setAttribute('data-theme',s);
    document.querySelectorAll('[data-theme-btn]').forEach(b=>b.onclick=()=>{
      const n=r.getAttribute('data-theme')==='dark'?'light':'dark';
      r.setAttribute('data-theme',n);localStorage.setItem('theme',n);
    });
  }

  // ---- error messages (AZ) ----
  function mapErr(m){
    m=(m||'').toLowerCase();
    if(m.includes('invalid login')) return 'E-poçt və ya şifrə yanlışdır.';
    if(m.includes('already registered')||m.includes('already been registered')) return 'Bu e-poçt artıq qeydiyyatdadır.';
    if(m.includes('password should be at least')) return 'Şifrə ən azı 6 simvol olmalıdır.';
    if(m.includes('unable to validate email')||m.includes('invalid email')) return 'E-poçt düzgün deyil.';
    if(m.includes('email not confirmed')) return 'E-poçt təsdiqlənməyib.';
    return m;
  }

  // ---- auth ----
  async function signUp({name,email,pass,card}){
    email=email.trim().toLowerCase();
    const {data,error}=await SB.auth.signUp({email,password:pass});
    if(error) throw new Error(mapErr(error.message));
    if(!data.session){ // ensure session for RLS insert
      const {error:se}=await SB.auth.signInWithPassword({email,password:pass});
      if(se) throw new Error(mapErr(se.message));
    }
    const {data:{user}}=await SB.auth.getUser();
    const {error:pe}=await SB.from('profiles').insert({id:user.id,name,card,role:'artisan'});
    if(pe) throw new Error(pe.message);
    return 'artisan';
  }
  async function signIn({email,pass}){
    email=email.trim().toLowerCase();
    const {error}=await SB.auth.signInWithPassword({email,password:pass});
    if(error) throw new Error(mapErr(error.message));
    const p=await getProfile();
    return (p&&p.role)||'artisan';
  }
  async function signOut(){await SB.auth.signOut();location.href='daxil.html';}
  async function getSession(){const {data}=await SB.auth.getSession();return data.session;}
  async function getProfile(){
    const {data:{user}}=await SB.auth.getUser();
    if(!user) return null;
    const {data}=await SB.from('profiles').select('*').eq('id',user.id).single();
    return data;
  }
  async function requireRole(role){
    const s=await getSession();
    if(!s){location.href='daxil.html';return null;}
    const p=await getProfile();
    const r=(p&&p.role)||'artisan';
    if(r!==role){location.href=r==='admin'?'admin.html':'panel.html';return null;}
    return {user:s.user,profile:p};
  }

  // ---- reverse pricing ----
  const RATE=1.66, SHIP=18;
  function calc(m){m=+m||0;const art=m/RATE,svc=art*0.15,sub=art+SHIP+svc,mkt=sub*0.13,landed=sub+mkt;
    return {art:Math.round(art),ship:SHIP,svc:Math.round(svc),mkt:Math.round(mkt),landed:Math.round(landed)};}

  // ---- AI copy (offline mock) ----
  const TITLES={
    'Mis':'Handmade Azerbaijani Copper Bowl — Traditional Lahij Coppersmith Art',
    'Xalça':'Hand-Woven Azerbaijani Wool Rug — Authentic Caucasus Carpet',
    'Gümüş':'Handcrafted Azerbaijani Silver Jewelry — Traditional Filigree',
    'Ağac':'Hand-Carved Azerbaijani Wooden Craft — Rustic Folk Art',
    'Keramika':'Handmade Azerbaijani Ceramic Pottery — Traditional Glazed'};
  const TAGS={
    'Mis':['copper','handmade','azerbaijan','lahij','coppersmith','folk art','hammered copper','rustic decor','home decor','artisan','gift','traditional','caucasus','ethnic'],
    'Xalça':['wool rug','handwoven','azerbaijan','carpet','caucasus','kilim','ethnic decor','vintage rug','wall hanging','artisan','traditional','oriental','folk','gift'],
    'Gümüş':['silver jewelry','handmade','azerbaijan','filigree','ethnic jewelry','artisan','traditional','caucasus','gift for her','boho','statement','folk','vintage','handcraft'],
    'Ağac':['wood carving','handmade','azerbaijan','folk craft','rustic','artisan','home decor','traditional','caucasus','gift','carved','ethnic','wooden art','handcraft'],
    'Keramika':['ceramic','pottery','handmade','azerbaijan','glazed','artisan','home decor','traditional','caucasus','gift','folk','ethnic','tableware','handcraft']};
  function aiCopy(mat){return {title:TITLES[mat]||TITLES['Mis'], tags:TAGS[mat]||TAGS['Mis']};}

  // ---- products ----
  const STATUS={wait:'Gözləyir',qc:'QC yoxlanır',live:'Etsy-də canlı',sold:'Satıldı',paid:'Ödənildi'};
  const STAGES=['wait','qc','live','sold','paid'];
  const STAGE_LABEL={wait:'Gözləyir',qc:'QC',live:'Canlı',sold:'Satıldı',paid:'Ödənildi'};
  function statusBadge(s){return `<span class="badge ${s}">${STATUS[s]||s}</span>`;}

  async function addProduct({material,manat,blob}){
    const {data:{user}}=await SB.auth.getUser();
    const p=await getProfile();
    const c=calc(manat), ai=aiCopy(material);
    let photo_url=null;
    if(blob){
      const path=user.id+'/'+Date.now()+'.jpg';
      const {error:ue}=await SB.storage.from('photos').upload(path,blob,{contentType:'image/jpeg'});
      if(!ue) photo_url=SB.storage.from('photos').getPublicUrl(path).data.publicUrl;
    }
    const {error}=await SB.from('products').insert({
      owner:user.id, owner_name:(p&&p.name)||'Sənətkar', material, manat:+manat,
      landed:c.landed, title:ai.title, tags:ai.tags, photo_url, status:'wait'});
    if(error) throw new Error(error.message);
  }
  async function getProducts(){
    const {data,error}=await SB.from('products').select('*').order('created_at',{ascending:false});
    if(error) throw new Error(error.message);
    return data||[];
  }
  async function setStatus(id,st){
    const {error}=await SB.from('products').update({status:st}).eq('id',id);
    if(error) throw new Error(error.message);
  }
  function subscribe(cb){
    return SB.channel('products-rt')
      .on('postgres_changes',{event:'*',schema:'public',table:'products'},cb)
      .subscribe();
  }

  // ---- UI helpers ----
  function pipeline(status){
    const i=STAGES.indexOf(status);
    return `<div class="pipe">`+STAGES.map((s,k)=>{
      const st=k<i?'done':k===i?'now':'todo';
      return `<div class="pipe-step ${st}"><span class="pd"></span><small>${STAGE_LABEL[s]}</small></div>`;
    }).join('<span class="pipe-line"></span>')+`</div>`;
  }
  function countUp(el,to,suf){const d=900;let s=null;
    function f(t){if(!s)s=t;const p=Math.min((t-s)/d,1);
      el.textContent=Math.round((0.5-Math.cos(p*Math.PI)/2)*to)+(suf||'');
      if(p<1)requestAnimationFrame(f);}requestAnimationFrame(f);}
  function reveal(root){
    const els=(root||document).querySelectorAll('.reveal:not(.in)');
    if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('in'));return;}
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.1});
    els.forEach((e,i)=>{e.style.transitionDelay=(Math.min(i,8)*45)+'ms';io.observe(e);});
  }
  function toast(msg,type){
    let box=document.getElementById('ee-toasts');
    if(!box){box=document.createElement('div');box.id='ee-toasts';document.body.appendChild(box);}
    const t=document.createElement('div');t.className='ee-toast '+(type||'');
    t.innerHTML=`<span class="tk"></span><span>${msg}</span>`;box.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},2800);
  }

  return {initTheme,signUp,signIn,signOut,getSession,getProfile,requireRole,
          calc,aiCopy,addProduct,getProducts,setStatus,subscribe,
          statusBadge,pipeline,STATUS,STAGES,STAGE_LABEL,countUp,reveal,toast,SB};
})();
EE.initTheme();
