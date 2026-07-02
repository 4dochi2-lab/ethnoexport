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
      const c=calc(50), ai=aiCopy('Mis');
      write(P,[{id:'pdemo',owner:'resim@lahij.az',ownerName:'Rəsim Quliyev',material:'Mis',manat:50,
        photo:null,status:'qc',landed:c.landed,title:ai.title,tags:ai.tags,created:Date.now()-86400000}]);
    }
  }

  return {initTheme,register,login,logout,session,currentUser,requireRole,calc,
          addProduct,products,myProducts,setStatus,statusBadge,STATUS,aiCopy,seed,ADMIN};
})();
EE.initTheme();
EE.seed();
