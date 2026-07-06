/* EthnoExport — AZ/EN for inner pages (daxil / panel / admin / profil ...).
   Walks text nodes + input placeholders; re-translates dynamic content via MutationObserver.
   Untranslated strings stay AZ. Shares the 'lang' key with the landing. */
(function(){
  const DICT={
  // ---- nav / common ----
  "Salam,":"Hello,","Profilim":"My profile","Çıxış":"Sign out","← Panel":"← Panel","← Ana səhifə":"← Home",
  "Yadda saxla":"Save","Yadda saxlanılır…":"Saving…","Yadda saxlanıldı ✓":"Saved ✓","Gözləyin…":"Please wait…",
  "Göndər":"Send","Göndərilir…":"Sending…","Ləğv et":"Cancel","Bağla":"Close","(varsa)":"(if any)","Seçin…":"Select…",
  // ---- crafts / materials ----
  "Material":"Material","Materialını yaz":"Write your material","Sənətkarlıq növü":"Craft type",
  "Sənətkarlıq növünü yazın":"Write your craft type","Misgərlik":"Coppersmithing",
  "Xalçaçılıq / Xalça toxuma":"Carpet weaving","Zərgərlik (Gümüş)":"Jewelry (Silver)","Dulusçuluq":"Pottery",
  "Ağac oymaçılığı / Şəbəkə sənəti":"Wood carving / Shabaka art","Dəri işləmə sənəti":"Leatherwork",
  "İpəkçilik və Toxuculuq":"Silk & Weaving","Digər":"Other","Mis":"Copper","Xalça":"Carpet","Gümüş":"Silver",
  "Ağac":"Wood","Keramika":"Ceramics","Dəri":"Leather","Tekstil / İpək":"Textile / Silk",
  // ---- auth (daxil) ----
  "Sənətkar hesabı":"Artisan account","Xoş gəldin":"Welcome","Hesabına daxil ol və məhsullarını izlə.":"Sign in and track your products.",
  "Bir neçə saniyə — dünyaya çıxmağa hazırsan.":"A few seconds — and you're ready to go global.",
  "Daxil ol":"Sign in","Qeydiyyat":"Register","Google ilə davam et":"Continue with Google","və ya":"or",
  "E-poçt":"Email","Şifrə":"Password","E-poçt kodu ilə gir (şifrəsiz)":"Sign in with email code (passwordless)",
  "Şifrəni unutmusunuz?":"Forgot your password?","E-poçtunuzu yazın — 6 rəqəmli giriş kodu göndərəcəyik.":"Enter your email — we'll send a 6-digit sign-in code.",
  "Kod e-poçtunuza göndərildi. Yoxlayın (spam qovluğuna da baxın).":"The code was sent to your email. Check it (also the spam folder).",
  "6 rəqəmli kod":"6-digit code","Kod göndər":"Send code","Təsdiqlə və gir":"Confirm and sign in","← Girişə qayıt":"← Back to sign in",
  "Şifrə doğrudur. Authenticator tətbiqinizdəki 6 rəqəmli kodu yazın.":"Password correct. Enter the 6-digit code from your authenticator app.",
  "Təsdiq kodu":"Verification code","Təsdiqlə və daxil ol":"Confirm and sign in",
  "E-poçtunuzu yazın — şifrəni yeniləmək üçün link göndərəcəyik.":"Enter your email — we'll send a password reset link.",
  "Link göndər":"Send link","Şifrəni yenilə":"Reset password","Yeni kod istə":"Request new code",
  "Yeni kod göndərildi. E-poçtunuzu yoxlayın.":"New code sent. Check your email.","Təsdiq gözlənilir":"Awaiting confirmation",
  "Kodun vaxtı bitib. Yeni kod istəyin.":"The code has expired. Request a new one.","Göndərilir…":"Sending…",
  "Link göndərildi! E-poçtunuzu yoxlayın (spam qovluğuna da baxın).":"Link sent! Check your email (also the spam folder).",
  "Ad, Soyad":"Full name","Əlaqə nömrəsi":"Phone number","Yaşadığınız yer (şəhər / kənd)":"Where you live (city / village)",
  "E-poçt (giriş üçün)":"Email (for sign in)","Ən azı 6 simvol":"At least 6 characters","Şifrəni təkrar yazın":"Repeat the password",
  "Əl işlərinizi qoyduğunuz sayt":"Website where you post your work","Sosial media mağazası":"Social media shop",
  "TikTok, Instagram və ya Facebook-da mağazanız varsa yazın.":"Write it if you have a shop on TikTok, Instagram or Facebook.",
  "Hesab yarat":"Create account","İki mərhələli təsdiq":"Two-factor authentication",
  "Komanda üzvüsən? Eyni formadan öz hesabınla daxil ol — panelə avtomatik yönləndiriləcəksən.":"Team member? Sign in with your own account from the same form — you'll be redirected to the panel automatically.",
  "Şifrələr eyni deyil. Yenidən yoxlayın.":"Passwords don't match. Please check again.",
  "Hesab yaradıldı! E-poçtunuza təsdiq linki göndərdik — linkə basıb təsdiqləyin, sonra daxil olun.":"Account created! We've sent a confirmation link to your email — click it to confirm, then sign in.",
  // ---- reset page (yenile-sifre) ----
  "Təhlükəsizlik":"Security","Yeni şifrə təyin edin":"Set a new password","İki dəfə eyni şifrəni yazın.":"Enter the same password twice.",
  "Yeni şifrə":"New password","Yeni şifrəni təkrar":"Repeat new password","Eyni şifrəni bir də yazın":"Type the same password again",
  "Şifrə yeniləndi! Panelə yönləndirilirsiniz…":"Password updated! Redirecting you to the panel…",
  // ---- complete profile ----
  "Bir addım qaldı":"One step left","Profilinizi tamamlayın":"Complete your profile","Sizinlə əlaqə və ödəniş üçün bu məlumatlar lazımdır.":"We need this info to contact you and pay you.",
  // ---- profile ----
  "Hesab":"Account","Məlumatlarınızı yeniləyin":"Update your information","Ödəniş rekviziti":"Payment details",
  "Satışdan sonra pul bu karta/hesaba köçürüləcək. Yalnız komanda görür.":"After a sale the money is sent to this card/account. Only the team can see it.",
  "Pulu almaq istədiyiniz 16 rəqəmli kart nömrəsi":"The 16-digit card number you want to be paid to",
  "Əl işləri saytı":"Craft website","Instagram / TikTok / Facebook":"Instagram / TikTok / Facebook",
  // ---- panel ----
  "Sənətkar paneli":"Artisan panel","Xoş gəldin,":"Welcome,","Məhsullarını izlə · pul birbaşa kartına":"Track your products · money straight to your card",
  "Ümumi məhsul":"Total products","Satışdadır":"On sale","Satıldı":"Sold","Kartıma köçürüldü (₼)":"Paid to my card (₼)",
  "Yeni məhsul göndər":"Send a new product","Məhsulun şəkli":"Product photo","Şəkil əlavə et":"Add photo",
  "Zəhmət olmasa məhsulun fərqli bucaqlardan şəkillərini yükləyin (maksimum 10 şəkil).":"Please upload photos of your product from different angles (max 10 photos).",
  "Cibinə düşməsini istədiyin təmiz məbləğ (₼)":"Clean amount you want to receive (₼)",
  "Elan mətnini biz hazırlayırıq — sənə heç nə yazmaq lazım deyil.":"We write the listing text — you don't need to write anything.",
  "Göndərdiklərim":"My submissions","Hələ məhsul göndərməmisən.":"You haven't sent a product yet.","Soldan ilk məhsulunu göndər.":"Send your first product on the left.",
  "İstədiyin:":"You want:","Satış:":"Sale:","kartına köçürüldü":"paid to your card",
  "Göndərildi! Komandamız yoxlayıb kanallarda dərc edəcək.":"Sent! Our team will review and publish it on the channels.",
  "Məhsul ləğv edildi":"Product cancelled","Bu məhsulu ləğv etmək istəyirsən? Geri qaytarmaq olmaz.":"Do you want to cancel this product? This cannot be undone.",
  "Bütün məhsullarım":"All my products","Satışda olan məhsullarım":"My products on sale","Satılan məhsullarım":"My sold products","Kartıma köçürülənlər":"Paid to my card",
  "Shopify mağazamızda öz məhsullarına bax":"See your products in our Shopify store","Bonanza mağazamızda bax":"See in our Bonanza store",
  "Hazırda satışda məhsulun yoxdur.":"You have no products on sale right now.","Hələ satış yoxdur.":"No sales yet.","Hələ ödəniş yoxdur.":"No payments yet.","Hələ məhsul yoxdur.":"No products yet.",
  "indiyə kimi kartına köçürülən ümumi məbləğ":"total amount paid to your card so far",
  "əşyası":"item",
  // ---- statuses / pipeline (app.js STATUS) ----
  "Gözləyir":"Waiting","QC":"QC","QC yoxlanır":"QC check","Canlı":"Live","Kanallarda canlı":"Live on channels","Ödənildi":"Paid","Ödəniş gözləyir":"Awaiting payment",
  // ---- 2FA ----
  "İki mərhələli təsdiq (2FA)":"Two-factor authentication (2FA)",
  "Hesabınızı oğurlanmadan qoruyun. Aktiv edəndə, hər girişdə telefonunuzdakı authenticator tətbiqinin 6 rəqəmli kodu tələb olunacaq — şifrəni bilən belə kodsuz girə bilməz.":"Protect your account from theft. When enabled, every sign-in will require the 6-digit code from your authenticator app — even someone with your password can't get in without the code.",
  "Yoxlanılır…":"Checking…","Hazırda söndürülüb. Tövsiyə olunur — aktiv edin.":"Currently off. Recommended — enable it.",
  "Aktiv et":"Enable","2FA-nı söndür":"Disable 2FA","Təsdiqlə və aktiv et":"Confirm and enable","2FA aktiv edildi ✓":"2FA enabled ✓","2FA söndürüldü":"2FA disabled","2FA söndürülsün?":"Disable 2FA?",
  "Telefonda":"On your phone","və ya":"or","yükləyin.":"install it.","Aşağıdakı QR kodu tətbiqlə skan edin (və ya açarı əl ilə əlavə edin).":"Scan the QR code below with the app (or add the key manually).","Tətbiqdəki 6 rəqəmli kodu yazıb təsdiqləyin.":"Enter and confirm the 6-digit code from the app.",
  "Əl ilə açar:":"Manual key:",
  // ---- admin ----
  "Komanda paneli":"Team panel","Bütün göndərişlər":"All submissions","Canlı axın · sənətkarlardan gələn məhsullar real-time yenilənir":"Live feed · products from artisans update in real time",
  "QC gözləyir":"Awaiting QC","Ödəniş gözləyir (₼)":"Awaiting payment (₼)",
  "Ümumi Dövriyyə · GMV":"Gross Merchandise Value · GMV","Platformadan keçən ümumi satış həcmi":"Total sales volume through the platform",
  "Xalis Platforma Gəliri":"Net platform revenue","Bizim 15% xidmət haqqımız":"Our 15% service fee",
  "Logistika · Çatdırılma":"Logistics · Shipping","Azərpoçt ilə göndərilən bağlamalar":"Parcels shipped via Azerpost",
  "Status üzrə bölgü":"Breakdown by status","məhsul":"products","Sənətkar və ya material axtar…":"Search artisan or material…","CSV yüklə":"Download CSV",
  "Hamısı":"All","QC-yə götür":"Send to QC","Kanallarda dərc et":"Publish to channels","Satıldı işarələ":"Mark as sold","Kartına ödə":"Pay to card",
  "Tərs qiymət kalkulyatoru":"Reverse pricing calculator","Sənətkarın məbləği → alıcı qiyməti":"Artisan's amount → buyer price",
  "Sənin təmiz məbləğin":"Artisan's clean amount","Beynəlxalq çatdırılma":"International shipping","Xidmət haqqı · 15%":"Service fee · 15%","Bazar əməliyyat haqqı":"Marketplace transaction fee","Alıcının gördüyü qiymət":"Price the buyer sees",
  "Shopify-da bax ↗":"View on Shopify ↗","Azərpoçta göndər":"Send to Azerpost","Azərpoçt sisteminə bağlama sorğusu göndərildi ✓":"Parcel request sent to the Azerpost system ✓",
  "QC-yə götürüldü":"Sent to QC","Shopify mağazasında dərc olundu 🌍":"Published to the Shopify store 🌍","Satıldı — SMS göndərildi":"Sold — SMS sent","Kartına köçürüldü":"Paid to card",
  "Shopify-a göndərilir…":"Sending to Shopify…","Bu bölmədə göndəriş yoxdur.":"No submissions in this section.","CSV yükləndi":"CSV downloaded",
  "AI başlıq:":"AI title:","tag:":"tags:","Yer:":"Location:","Tel:":"Tel:","sayt":"website","Ödəniş rekviziti:":"Payment details:","əlaqə məlumatı yoxdur":"no contact info"
  };

  const LANGKEY='lang';
  function tr(str,l){ const t=str.trim(); if(!t)return null; if(l==='en'){return DICT[t]!==undefined?str.replace(t,DICT[t]):null;} return null; }
  function walk(root,l){
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(n=>{
      if(l==='en'){ const r=tr(n.nodeValue,'en'); if(r!==null){ if(n._az===undefined)n._az=n.nodeValue; n.nodeValue=r; } }
      else { if(n._az!==undefined) n.nodeValue=n._az; }
    });
    // placeholders
    root.querySelectorAll?.('input[placeholder],textarea[placeholder]').forEach(el=>{
      if(l==='en'){ const t=el.placeholder.trim(); if(DICT[t]!==undefined){ if(el._azph===undefined)el._azph=el.placeholder; el.placeholder=el.placeholder.replace(t,DICT[t]); } }
      else { if(el._azph!==undefined) el.placeholder=el._azph; }
    });
  }
  let LANG=localStorage.getItem(LANGKEY)||'az';
  function apply(l){ LANG=l; localStorage.setItem(LANGKEY,l); walk(document.body,l);
    document.documentElement.lang=l; const b=document.getElementById('langBtn'); if(b)b.textContent=l==='en'?'AZ':'EN'; }

  function boot(){
    const b=document.getElementById('langBtn');
    if(b) b.onclick=()=>apply(LANG==='en'?'az':'en');
    if(LANG==='en') apply('en');
    // dinamik məzmun (panel/admin render-dən sonra əlavə olunan) — yenidən tərcümə et
    const mo=new MutationObserver(muts=>{
      if(LANG!=='en')return;
      muts.forEach(m=>m.addedNodes.forEach(nd=>{ if(nd.nodeType===1) walk(nd,'en'); else if(nd.nodeType===3){const r=tr(nd.nodeValue,'en'); if(r!==null){nd._az=nd.nodeValue;nd.nodeValue=r;}} }));
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.EEi18n={apply,get lang(){return LANG;}};
})();
