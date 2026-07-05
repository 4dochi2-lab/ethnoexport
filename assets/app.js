/* EthnoExport — Supabase-backed logic (real auth, DB, storage) */
const SUPA_URL = 'https://sizpugjktcqtrvaudtbr.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpenB1Z2prdGNxdHJ2YXVkdGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTQyMzcsImV4cCI6MjA5ODU5MDIzN30.lElf9mAKR_xYTTjcgDxlfJ7WzGzN6EHCWW12hTRFfQ4';
const SB = window.supabase.createClient(SUPA_URL, SUPA_KEY);

const EE = (() => {
  // ---- theme ----
  function initTheme(){
    const r=document.documentElement;
    const s=localStorage.getItem('theme')||'light';
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
    if(m.includes('invalid totp')||m.includes('invalid code')||m.includes('code is invalid')) return 'Kod yanlışdır. Yenidən yoxlayın.';
    if(m.includes('mfa')&&m.includes('already')) return '2FA artıq aktivdir.';
    if(m.includes('user not found')) return 'Bu e-poçt tapılmadı.';
    if(m.includes('signups not allowed')||m.includes('otp_disabled')) return 'Bu e-poçt tapılmadı. Əvvəlcə qeydiyyatdan keçin.';
    if(m.includes('token has expired')||m.includes('expired')) return 'Kodun vaxtı keçib. Yeni kod istəyin.';
    if(m.includes('rate limit')||m.includes('too many')) return 'Çox sayda cəhd. Bir az gözləyin.';
    return m;
  }

  // ---- auth ----
  async function signUp({name,email,pass,phone,location:loc,craft,website,social}){
    email=email.trim().toLowerCase();
    const meta={name,phone:phone||null,location:loc||null,craft:craft||null,website:website||null,social:social||null};
    const {data,error}=await SB.auth.signUp({email,password:pass,
      options:{ data:meta, emailRedirectTo: window.location.origin+'/panel' }});
    if(error) throw new Error(mapErr(error.message));
    if(data.session){
      // e-poçt təsdiqi SÖNDÜRÜLÜB — profili dərhal yarat
      await SB.from('profiles').insert(Object.assign({id:data.user.id,role:'artisan'},meta));
      return {role:'artisan'};
    }
    // e-poçt təsdiqi AÇIQ — təsdiq linki göndərildi, profil sonra yaranacaq (metadata-dan)
    return {confirm:true};
  }
  async function ensureProfile(){
    const {data:{user}}=await SB.auth.getUser();
    if(!user) return null;
    let {data:p}=await SB.from('profiles').select('*').eq('id',user.id).single();
    if(!p){
      const m=user.user_metadata||{};
      const row={id:user.id,role:'artisan',name:m.name||null,phone:m.phone||null,
        location:m.location||null,craft:m.craft||null,website:m.website||null,social:m.social||null};
      const {error}=await SB.from('profiles').upsert(row);
      if(!error) p=row;
    }
    return p;
  }
  async function signIn({email,pass}){
    email=email.trim().toLowerCase();
    const {error}=await SB.auth.signInWithPassword({email,password:pass});
    if(error) throw new Error(mapErr(error.message));
    if(await mfaNeeded()) return {mfa:true};
    const p=await getProfile();
    return {role:(p&&p.role)||'artisan'};
  }
  async function roleAfterMfa(){const p=await getProfile();return (p&&p.role)||'artisan';}
  async function sendEmailOtp(email){
    const {error}=await SB.auth.signInWithOtp({email:email.trim().toLowerCase(),
      options:{shouldCreateUser:false}});
    if(error){
      const m=(error.message||'').toLowerCase();
      if(m.includes('signups not allowed')||m.includes('not found')||m.includes('user not found'))
        throw new Error('Bu e-poçtla hesab tapılmadı. Əvvəlcə qeydiyyatdan keçin.');
      throw new Error(mapErr(error.message));
    }
  }
  async function verifyEmailOtp(email,token){
    const {error}=await SB.auth.verifyOtp({email:email.trim().toLowerCase(),token:token.trim(),type:'email'});
    if(error) throw new Error(mapErr(error.message));
    const p=await getProfile();
    return (p&&p.role)||'artisan';
  }
  async function signInWithGoogle(){
    const {error}=await SB.auth.signInWithOAuth({provider:'google',
      options:{redirectTo:location.origin+'/panel'}});
    if(error) throw new Error(mapErr(error.message));
  }
  async function saveProfile(f){
    const {data:{user}}=await SB.auth.getUser();
    const row=Object.assign({id:user.id,role:'artisan'},f);
    const {error}=await SB.from('profiles').upsert(row);
    if(error) throw new Error(error.message);
  }
  async function signOut(){await SB.auth.signOut();location.href='daxil.html';}

  // ---- password reset ----
  async function resetPassword(email){
    const {error}=await SB.auth.resetPasswordForEmail(email.trim().toLowerCase(),
      {redirectTo:location.origin+'/yenile-sifre'});
    if(error) throw new Error(mapErr(error.message));
  }
  async function updatePassword(pass){
    const {error}=await SB.auth.updateUser({password:pass});
    if(error) throw new Error(mapErr(error.message));
  }

  // ---- 2FA (TOTP / authenticator app) ----
  async function mfaFactors(){const {data}=await SB.auth.mfa.listFactors();return data||{totp:[]};}
  async function mfaActive(){const f=await mfaFactors();return (f.totp||[]).some(x=>x.status==='verified');}
  async function mfaNeeded(){
    const {data}=await SB.auth.mfa.getAuthenticatorAssuranceLevel();
    return !!data && data.nextLevel==='aal2' && data.currentLevel==='aal1';
  }
  async function mfaEnroll(){
    const {data,error}=await SB.auth.mfa.enroll({factorType:'totp'});
    if(error) throw new Error(mapErr(error.message));
    return data; // {id, totp:{qr_code, secret, uri}}
  }
  async function mfaActivate(factorId,code){
    const {error}=await SB.auth.mfa.challengeAndVerify({factorId,code:code.trim()});
    if(error) throw new Error(mapErr(error.message));
  }
  async function mfaVerifyLogin(code){
    const f=await mfaFactors();
    const t=(f.totp||[]).find(x=>x.status==='verified')||(f.totp||[])[0];
    if(!t) throw new Error('2FA faktoru tapılmadı.');
    const {error}=await SB.auth.mfa.challengeAndVerify({factorId:t.id,code:code.trim()});
    if(error) throw new Error(mapErr(error.message));
  }
  async function mfaDisable(){
    const f=await mfaFactors();
    for(const t of (f.totp||[])) await SB.auth.mfa.unenroll({factorId:t.id});
  }
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
    if(await mfaNeeded()){location.href='daxil.html';return null;} // 2FA tamamlanmayıb — panelə buraxma
    const p=await ensureProfile();
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
  const STATUS={wait:'Gözləyir',qc:'QC yoxlanır',live:'Kanallarda canlı',sold:'Satıldı',paid:'Ödənildi'};
  const STAGES=['wait','qc','live','sold','paid'];
  const STAGE_LABEL={wait:'Gözləyir',qc:'QC',live:'Canlı',sold:'Satıldı',paid:'Ödənildi'};
  function statusBadge(s){return `<span class="badge ${s}">${STATUS[s]||s}</span>`;}

  async function addProduct({material,manat,blobs}){
    const {data:{user}}=await SB.auth.getUser();
    const p=await getProfile();
    const c=calc(manat), ai=aiCopy(material);
    const urls=[];
    for(const blob of (blobs||[])){
      if(!blob) continue;
      const path=user.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.jpg';
      const {error:ue}=await SB.storage.from('photos').upload(path,blob,{contentType:'image/jpeg'});
      if(!ue) urls.push(SB.storage.from('photos').getPublicUrl(path).data.publicUrl);
    }
    const {error}=await SB.from('products').insert({
      owner:user.id, owner_name:(p&&p.name)||'Sənətkar', material, manat:+manat,
      landed:c.landed, title:ai.title, tags:ai.tags,
      photo_url:urls[0]||null, photos:urls, status:'wait'});
    if(error) throw new Error(error.message);
  }
  async function publishToShopify(id){
    const {data:{session}}=await SB.auth.getSession();
    const res=await fetch(SUPA_URL+'/functions/v1/shopify',{
      method:'POST',
      headers:{'Authorization':'Bearer '+session.access_token,'apikey':SUPA_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({id})
    });
    const j=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(j.error||('Shopify xətası ('+res.status+')'));
    return j;
  }
  async function getProfilesMap(){
    const {data,error}=await SB.from('profiles').select('*');
    if(error) return {};
    const m={}; (data||[]).forEach(p=>m[p.id]=p); return m;
  }
  async function getProducts(){
    const {data,error}=await SB.from('products').select('*').order('created_at',{ascending:false});
    if(error) throw new Error(error.message);
    return data||[];
  }
  async function getMyProducts(){
    const {data:{user}}=await SB.auth.getUser();
    if(!user) return [];
    const {data,error}=await SB.from('products').select('*').eq('owner',user.id).order('created_at',{ascending:false});
    if(error) throw new Error(error.message);
    return data||[];
  }
  async function setStatus(id,st){
    const {error}=await SB.from('products').update({status:st}).eq('id',id);
    if(error) throw new Error(error.message);
  }
  async function deleteProduct(id){
    const {data:{user}}=await SB.auth.getUser();
    const {error}=await SB.from('products').delete().eq('id',id).eq('owner',user.id);
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

  return {initTheme,signUp,ensureProfile,signIn,roleAfterMfa,signInWithGoogle,sendEmailOtp,verifyEmailOtp,saveProfile,signOut,getSession,getProfile,requireRole,
          resetPassword,updatePassword,
          mfaFactors,mfaActive,mfaNeeded,mfaEnroll,mfaActivate,mfaVerifyLogin,mfaDisable,
          calc,aiCopy,addProduct,getProducts,getMyProducts,getProfilesMap,setStatus,deleteProduct,publishToShopify,subscribe,
          statusBadge,pipeline,STATUS,STAGES,STAGE_LABEL,countUp,reveal,toast,SB};
})();
EE.initTheme();
