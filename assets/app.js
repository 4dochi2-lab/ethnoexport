/* EthnoExport — shared front-end logic (localStorage prototype, no backend) */
const EE = (() => {
  const U='ee_users', P='ee_products', S='ee_session';
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

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

  // ---- auth ----
  const ADMIN={email:'admin@ethnoexport.az',pass:'admin123'};
  function register({name,email,pass,card}){
    email=email.trim().toLowerCase();
    const users=read(U,[]);
    if(users.some(u=>u.email===email)) throw new Error('Bu e-poçt artıq qeydiyyatdadır.');
    users.push({name,email,pass,card,created:Date.now()});
    write(U,users); write(S,{email,role:'artisan'}); return true;
  }
  function login({email,pass}){
    email=email.trim().toLowerCase();
    if(email===ADMIN.email && pass===ADMIN.pass){write(S,{email,role:'admin'});return 'admin';}
    const u=read(U,[]).find(u=>u.email===email && u.pass===pass);
    if(!u) throw new Error('E-poçt və ya şifrə yanlışdır.');
    write(S,{email,role:'artisan'}); return 'artisan';
  }
  function session(){return read(S,null)}
  function logout(){localStorage.removeItem(S);location.href='daxil.html'}
  function currentUser(){const s=session();return s?read(U,[]).find(u=>u.email===s.email):null}
  function requireRole(role){
    const s=session();
    if(!s){location.href='daxil.html';return null}
    if(s.role!==role){location.href=s.role==='admin'?'admin.html':'panel.html';return null}
    return s;
  }

  // ---- reverse pricing ----
  const RATE=1.66, SHIP=18;
  function calc(m){
    m=+m||0; const art=m/RATE, svc=art*0.15, sub=art+SHIP+svc, mkt=sub*0.13, landed=sub+mkt;
    return {art:Math.round(art),ship:SHIP,svc:Math.round(svc),mkt:Math.round(mkt),landed:Math.round(landed)};
  }

  // ---- AI copy (mock, offline) ----
  const TITLES={
    'Mis':'Handmade Azerbaijani Copper {x} — Traditional Lahij Coppersmith Art',
    'Xalça':'Hand-Woven Azerbaijani Wool Rug — Authentic Caucasus {x} Carpet',
    'Gümüş':'Handcrafted Azerbaijani Silver {x} — Traditional Filigree Jewelry',
    'Ağac':'Hand-Carved Azerbaijani Wooden {x} — Rustic Folk Craft',
    'Keramika':'Handmade Azerbaijani Ceramic {x} — Traditional Glazed Pottery'
  };
  const TAGS={
    'Mis':['copper','handmade','azerbaijan','lahij','coppersmith','folk art','hammered copper','rustic decor','home decor','artisan','gift','traditional','caucasus','ethnic'],
    'Xalça':['wool rug','handwoven','azerbaijan','carpet','caucasus','kilim','ethnic decor','vintage rug','wall hanging','artisan','traditional','oriental','folk','gift'],
    'Gümüş':['silver jewelry','handmade','azerbaijan','filigree','ethnic jewelry','artisan','traditional','caucasus','gift for her','boho','statement','folk','vintage','handcraft'],
    'Ağac':['wood carving','handmade','azerbaijan','folk craft','rustic','artisan','home decor','traditional','caucasus','gift','carved','ethnic','wooden art','handcraft'],
    'Keramika':['ceramic','pottery','handmade','azerbaijan','glazed','artisan','home decor','traditional','caucasus','gift','folk','ethnic','tableware','handcraft']
  };
  function aiCopy(mat){
    return {title:(TITLES[mat]||TITLES['Mis']).replace('{x}','Bowl'), tags:(TAGS[mat]||TAGS['Mis'])};
  }

  // ---- products ----
  const STATUS={wait:'Gözləyir',qc:'QC yoxlanır',live:'Etsy-də canlı',sold:'Satıldı',paid:'Ödənildi'};
  function statusBadge(s){return `<span class="badge ${s}">${STATUS[s]||s}</span>`}
  function addProduct({owner,ownerName,material,manat,photo}){
    const ps=read(P,[]); const c=calc(manat); const ai=aiCopy(material);
    ps.unshift({id:'p'+Date.now(),owner,ownerName,material,manat:+manat,photo,status:'wait',
      landed:c.landed, title:ai.title, tags:ai.tags, created:Date.now()});
    write(P,ps); return true;
  }
  function products(){return read(P,[])}
  function myProducts(email){return products().filter(p=>p.owner===email)}
  function setStatus(id,st){const ps=products();const p=ps.find(x=>x.id===id);if(p){p.status=st;write(P,ps)}}

  // seed one demo product for admin view (only once)
  function seed(){
    if(read(P,null)===null){
      const mk=(owner,name,mat,manat,status,ago)=>{const c=calc(manat),ai=aiCopy(mat);
        return {id:'p'+ago,owner,ownerName:name,material:mat,manat,photo:null,status,
          landed:c.landed,title:ai.title,tags:ai.tags,created:Date.now()-ago};};
      write(P,[
        mk('resim@lahij.az','Rəsim Quliyev','Mis',50,'wait',1200),
        mk('sekine@quba.az','Səkinə Məmmədova','Xalça',180,'qc',86400000),
        mk('elshen@sheki.az','Elşən Bağırov','Gümüş',90,'live',172800000),
        mk('gulnar@lahij.az','Gülnar Əliyeva','Keramika',40,'sold',259200000),
        mk('resim@lahij.az','Rəsim Quliyev','Mis',65,'paid',432000000)
      ]);
    }
  }

  function resetDemo(){localStorage.removeItem(P);seed();}

  return {initTheme,register,login,logout,session,currentUser,requireRole,calc,
          addProduct,products,myProducts,setStatus,statusBadge,STATUS,aiCopy,seed,resetDemo,ADMIN};
})();
EE.initTheme();
EE.seed();

/* ---- shared UI helpers (animations) ---- */
EE.STAGES=['wait','qc','live','sold','paid'];
EE.STAGE_LABEL={wait:'Gözləyir',qc:'QC',live:'Canlı',sold:'Satıldı',paid:'Ödənildi'};
EE.pipeline=function(status){
  const i=EE.STAGES.indexOf(status);
  return `<div class="pipe">`+EE.STAGES.map((s,k)=>{
    const st=k<i?'done':k===i?'now':'todo';
    return `<div class="pipe-step ${st}"><span class="pd"></span><small>${EE.STAGE_LABEL[s]}</small></div>`;
  }).join('<span class="pipe-line"></span>')+`</div>`;
};
EE.countUp=function(el,to,suf){
  const from=0,d=900;let s=null;
  function f(t){if(!s)s=t;const p=Math.min((t-s)/d,1);
    el.textContent=Math.round((0.5-Math.cos(p*Math.PI)/2)*(to-from)+from)+(suf||'');
    if(p<1)requestAnimationFrame(f);}
  requestAnimationFrame(f);
};
EE.reveal=function(root){
  const els=(root||document).querySelectorAll('.reveal:not(.in)');
  if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.1});
  els.forEach((e,i)=>{e.style.transitionDelay=(Math.min(i,8)*45)+'ms';io.observe(e);});
};
EE.toast=function(msg,type){
  let box=document.getElementById('ee-toasts');
  if(!box){box=document.createElement('div');box.id='ee-toasts';document.body.appendChild(box);}
  const t=document.createElement('div');
  t.className='ee-toast '+(type||'');
  t.innerHTML=`<span class="tk"></span><span>${msg}</span>`;
  box.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},2600);
};
