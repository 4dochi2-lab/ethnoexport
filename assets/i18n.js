/* EthnoExport — AZ/EN toggle for the landing page.
   Walks text nodes; swaps AZ→EN by exact trimmed match. Untranslated bits stay AZ. */
(function(){
  const EN = {
    // nav
    "Necə işləyir":"How it works","Qiymət":"Pricing","Ekranlar":"Screens","Rəylər":"Reviews",
    "Etibar":"Trust","Suallar":"FAQ","Daxil ol":"Log in",
    // hero
    "Yerli sənətkarlar üçün":"For local artisans",
    "ABAD × Azərxalça əməkdaşlığı":"In partnership with ABAD × Azərxalça",
    "Siz düzəldin,":"You make it,",
    "qalanını biz edək.":"we do the rest.",
    "Şəklini çəkin, qiymətini yazın — qalanını biz edirik. Tərcümə, qablaşdırma, gömrük, dünya bazarında satış: hamısı bizim işimizdir.":
      "Take a photo, set the price — we do the rest. Translation, packaging, customs, selling on global marketplaces: all of it is our job.",
    "Hesab yarat, məhsul göndər":"Create an account, send a product",
    "Necə işləyir?":"How it works?",
    "Pulsuz hesab":"Free account","PayPal lazım deyil":"No PayPal needed","Pul birbaşa kartına":"Money straight to your card",
    // reverse pricing card
    "Tərs qiymət mühərriki · canlı":"Reverse pricing engine · live",
    "Sən məbləği yaz — qalanını biz hesablayaq":"You name the amount — we calculate the rest",
    "Cibinə düşməsini istədiyiniz təmiz məbləği yazın":"Enter the clean amount you want in your pocket",
    "Siz təmiz":"You net a clean","₼ alırsınız":"₼",
    "Sənin təmiz məbləğin":"Your clean amount",
    "Beynəlxalq çatdırılma (orta çəki)":"International shipping (avg. weight)",
    "EthnoExport xidmət haqqı · 15%":"EthnoExport service fee · 15%",
    "Bazar əməliyyat haqqı":"Marketplace transaction fee",
    "Xarici alıcının gördüyü qiymət":"Price the foreign buyer sees",
    "Sənə yenə də təmiz":"You still net a clean",
    "₼ çatır":"₼",
    "Nümunə düstur (kurs ≈ 1.66). Real qiymət dəqiq çəki və marşruta görə hesablanır.":
      "Example formula (rate ≈ 1.66). Real price is calculated from exact weight and route.",
    // marquee
    "Satış kanalları:":"Sales channels:","Sənə":"You need","heç bir hesab":"no account","lazım deyil":"at all",
    "Pul birbaşa":"Money straight","kartına":"to your card",
    // video
    "1 dəqiqəlik video":"1-minute video","Necə işləyir — göz qabağında":"How it works — see for yourself",
    "Videoya bax: sənətkar məhsulunu necə 60 saniyəyə dünya bazarına çıxarır.":
      "Watch: how an artisan gets their product to the global market in 60 seconds.",
    // stats
    "Sənətkarın işi bu qədər çəkir":"That's all the artisan's part takes",
    "Böyük satış platforması":"Major sales platforms",
    "Ödəniş manatla, kartına":"Paid in AZN, to your card",
    "Sənin ödədiyin ön xərc":"Upfront cost you pay",
    // materials
    "Kəndin əl işləri":"Village handcraft","Nəsillərin sənəti — dünya bazarına":"Generations of craft — to the world market",
    "Lahıc misi, Quba xalçası, Şəki zərgərliyi… hansı sənətin varsa, biz onu satırıq.":
      "Lahij copper, Quba carpets, Sheki silver… whatever your craft, we sell it.",
    "Mis":"Copper","Xalça":"Carpet","Gümüş":"Silver","Ağac":"Wood","Keramika":"Ceramics",
    "Döymə qablar, sinilər":"Hammered bowls, trays","Əl toxuması, kilim":"Handwoven rugs, kilim",
    "Zərgərlik, bəzək":"Jewelry, ornaments","Oyma, xatəmkarlıq":"Carving, inlay","Şirli saxsı, boşqab":"Glazed pottery, plates",
    // how
    "4 addım":"4 steps","Sənin işin telefonda 1 dəqiqə çəkir":"Your part takes 1 minute on the phone",
    "Qalan hər şeyi — mətn, foto redaktə, qiymət, qablaşdırma, göndəriş — komandamız görür.":
      "Everything else — copy, photo editing, pricing, packaging, shipping — our team handles.",
    "Şəkil çək":"Take a photo","Məhsulunun aydın bir şəklini çək. Bir düymə — vəssalam.":
      "Take a clear photo of your product. One button — done.",
    "Qiymətini yaz":"Set your price","Cibinə təmiz neçə manat istəyirsən — onu yaz. Məsələn: 50.":
      "How many clean manat you want in your pocket — type it. E.g. 50.",
    "Biz satırıq":"We sell it","AI ingiliscə başlıq, təsvir və 13–20 açar söz yazır. Komanda yoxlayıb bizim mağazamıza qoyur.":
      "AI writes an English title, description and 13–20 keywords. The team reviews and lists it in our store.",
    "Kartına pul gəlir":"Money hits your card","Məhsul satılanda SMS gəlir, sən Azərpoçta verirsən. Çatanda pul kartına köçürülür.":
      "When it sells you get an SMS, you drop it at Azərpoçt. On delivery, money is sent to your card.",
    // story
    "Lahıclı misgər Rəsimin hekayəsi":"The story of Rasim, a Lahij coppersmith",
    "48 yaşlı Rəsim beş gün ərzində gözəl bir mis qab döyür. Bu ay turist azdır, pula ehtiyacı var. Telefonda EthnoExport-u açır: bir böyük düymə. Qabın şəklini çəkir, siyahıdan “Mis” seçir və “50” yazır — cibinə təmiz 50 manat düşsün deyə. “Göndər” deyir və telefonu cibinə qoyur. Onun işi bitdi.":
      "48-year-old Rasim spends five days hammering a beautiful copper bowl. Tourists are rare this month, he needs money. He opens EthnoExport on his phone: one big button. He photographs the bowl, picks “Copper” from a list and types “50” — to get a clean 50 manat in his pocket. He hits “Send” and puts the phone away. His part is done.",
    "— Lahıc, Azərbaycan · nəsillərdən gələn ustalıq":"— Lahij, Azerbaijan · craftsmanship passed down generations",
    // pricing / channels
    "Dürüst qiymət":"Honest pricing","Sən nə istəsən, onu alırsan":"You get exactly what you ask for",
    "Logistika, bazar haqqı və 15% xidmət haqqı alıcının qiymətinin üstünə gəlir — sənin manatına toxunmur. Komandamız məhsulu eyni anda üç böyük platformada — EthnoExport mağazamız altında — yerləşdirir.":
      "Logistics, marketplace fees and a 15% service fee are added on top of the buyer's price — your manat is untouched. Our team lists the product on three major platforms at once — under our EthnoExport store.",
    "ƏSAS KANAL":"MAIN CHANNEL","ABŞ və Avropa alıcıları · milyonlarla istifadəçi":"US & European buyers · millions of users",
    "Nadir və unikal əl işləri bazarı":"A marketplace for rare, unique handcraft",
    "EthnoExport storefront · birbaşa satış":"EthnoExport storefront · direct sales",
    // demo
    "Tətbiqin özü":"The app itself","Barmağınla sına.":"Try it with your finger.","Ekranlar Azərbaycanca.":"Screens in Azerbaijani.",
    "Bütün tətbiq ana dilindədir — çünki əsas odur ki, rahat başa düşəsən. Aşağıdakı telefon işləkdir: düymələrə toxun, dörd addımı özün keç.":
      "The whole app is in the native language — because what matters is that you understand it easily. The phone below is live: tap the buttons and walk through the four steps yourself.",
    "Bir toxunuş, məhsulun şəkli.":"One tap, your product's photo.","Qısa siyahıdan seç.":"Pick from a short list.",
    "İstədiyin təmiz məbləği daxil et.":"Enter the clean amount you want.","Vəssalam — qalanı bizdə.":"That's it — the rest is on us.",
    "Yenidən başla":"Start over","Məhsulunu kadra sal":"Frame your product",
    "Aydın bir şəkil çək. Başqa heç nə lazım deyil.":"Take a clear photo. Nothing else is needed.",
    "Material seç":"Choose material","Cibinə təmiz neçə manat düşsün?":"How much clean manat should you get?",
    "Göndər":"Send","Göndərildi!":"Sent!",
    // reviews
    "Sənətkarların rəyləri":"Artisan reviews","Kənddən dünyaya çıxanlar":"From village to the world",
    "Real sənətkarların foto rəyləri. Öz sözləri, öz məhsulları, öz kartlarına düşən pul.":
      "Photo reviews from real artisans. Their words, their products, money on their own cards.",
    "“Onlayn satış nədir bilmirdim. İndi mis qablarım Amerikaya gedir. Pul birbaşa kartıma gəlir.”":
      "“I didn't know what online selling was. Now my copper bowls go to America. Money comes straight to my card.”",
    "Misgər · Lahıc":"Coppersmith · Lahij",
    "“Xalçalarımı özüm satmağı bacarmırdım. İndi şəkil çəkirəm, qalanını onlar edir.”":
      "“I couldn't sell my carpets myself. Now I take a photo, they do the rest.”",
    "Xalçaçı · Quba":"Weaver · Quba",
    "“Bir ayda üç gümüş bəzək satıldı. SMS gəlir, Azərpoçta verirəm, pul çatır. Çox rahatdır.”":
      "“Three silver ornaments sold in a month. SMS arrives, I drop it at Azərpoçt, money comes. Very easy.”",
    "Zərgər · Şəki":"Jeweler · Sheki",
    // dashboard
    "Pərdə arxası":"Behind the scenes","Komandamızın gördüyü panel":"The panel our team sees",
    "Sən “Göndər” deyəndən sonra məhsulun bizim mərkəzi panelə düşür. AI mətni hazırlayır, komanda keyfiyyəti yoxlayır və bir kliklə bizim mağazamıza qoyur.":
      "After you hit “Send”, your product lands on our central panel. AI prepares the copy, the team checks quality and lists it in our store with one click.",
    "QC keçdi · orijinal":"QC passed · authentic","Sənətkar:":"Artisan:","Material:":"Material:","İstək:":"Wants:",
    "Landed cost":"Landed cost","Satış qiyməti":"Sale price","Kanallarda dərc et":"Publish to channels","Düzəliş et":"Edit",
    // trust
    "Nəyə zəmanət veririk":"What we guarantee","Sənin işin bitəndən sonra başlayan hər şey":"Everything that starts after your part ends",
    "Aşağıdakı altı xidmət platformamızın nüvəsidir — sən şəkli göndərəndən sonrasını tam bizim komanda aparır.":
      "These six services are the core of our platform — after you send the photo, our team runs everything.",
    "Zəmanətli AZN ödəniş":"Guaranteed AZN payout",
    "Pul birbaşa kartına — M10, Birbank və ya Leobank vasitəsilə. Xarici hesab, valyuta dərdi yoxdur.":
      "Money straight to your card — via M10, Birbank or Leobank. No foreign account, no currency hassle.",
    "WhatsApp dəstək":"WhatsApp support",
    "Sifariş, sual, ödəniş yeniliyi — hamısı WhatsApp-da, ana dilində. Bir mesaj uzaqlıqda canlı insan.":
      "Orders, questions, payment updates — all on WhatsApp, in your language. A real person one message away.",
    "Komanda listing":"Team listing",
    "Sən mağaza açmırsan. Komandamız məhsulu eBay, Bonanza və Shopify-də — EthnoExport mağazamız altında — özü yerləşdirir.":
      "You don't open a store. Our team lists the product on eBay, Bonanza and Shopify — under our EthnoExport store.",
    "Azərpoçt → Bakı logistika":"Azərpoçt → Baku logistics",
    "Kənd Azərpoçtundan Bakı mərkəzimizə. Biz keyfiyyəti yoxlayır, dünya standartında yenidən qablaşdırıb DHL ilə göndəririk.":
      "From the village Azərpoçt to our Baku hub. We check quality, repack to global standards and ship via DHL.",
    "AI elan mətni":"AI listing copy",
    "İngiliscə peşəkar başlıq, satış təsviri və 13–20 SEO açar sözü Claude ilə yazılır, komanda əl ilə yoxlayır.":
      "A professional English title, sales description and 13–20 SEO keywords written with Claude, checked by hand.",
    "Alıcı etibar paketi":"Buyer trust pack",
    "Hər bağlamada çap olunmuş mənşə/mədəniyyət kartı və sənətkarın əl yazısı ilə qeyd — alıcının etibarını qazanır.":
      "Each parcel includes a printed origin/culture card and a handwritten note from the artisan — winning the buyer's trust.",
    // faq
    "Tez-tez verilən suallar":"Frequently asked questions","Ağlına gələn suallar":"Questions on your mind",
    "İngilis dili bilmirəm, olar?":"I don't know English, is that okay?",
    "Bəli. Bütün elan mətnini — ingiliscə başlıq, təsvir və açar sözləri — AI və komandamız yazır. Sənin heç bir dil bilməyinə ehtiyac yoxdur.":
      "Yes. All the listing copy — English title, description and keywords — is written by AI and our team. You don't need to know any language.",
    "Pulu necə və nə vaxt alıram?":"How and when do I get paid?",
    "Məhsul satılıb alıcıya çatan kimi, sən istədiyin təmiz məbləğ (məsələn 50 ₼) M10, Birbank və ya Leobank kartına köçürülür.":
      "As soon as the product sells and reaches the buyer, the clean amount you wanted (e.g. 50 ₼) is sent to your M10, Birbank or Leobank card.",
    "Məhsulu haradan göndərməliyəm?":"Where do I ship the product from?",
    "Ən yaxın Azərpoçt filialından. Bağlama Bakıdakı mərkəzimizə gəlir, biz keyfiyyəti yoxlayıb yenidən qablaşdırıb dünyaya göndəririk.":
      "From the nearest Azərpoçt branch. The parcel comes to our Baku hub, we check quality, repack and ship worldwide.",
    "Xidmət haqqı nə qədərdir?":"How much is the service fee?",
    "15% xidmət haqqı və logistika alıcının qiymətinin üstünə gəlir — sənin istədiyin manata toxunmur. Sən nə istəsən, onu alırsan.":
      "A 15% service fee and logistics are added on top of the buyer's price — your requested manat is untouched. You get exactly what you ask for.",
    "Öz mağazamı açmalıyam?":"Do I need to open my own store?",
    "Xeyr. Komandamız hər şeyi EthnoExport-un öz mağazası altında idarə edir. Sənə heç bir hesab və ya mağaza lazım deyil.":
      "No. Our team manages everything under EthnoExport's own store. You need no account or store.",
    // cta
    "Məhsulunu bu gün dünyaya çıxar":"Take your product global today",
    "Bir şəkil, bir qiymət. Qalanını biz edirik. İngilis dili, hesab, gömrük dərdi — heç biri sənin işin deyil.":
      "One photo, one price. We do the rest. English, accounts, customs — none of it is your job.",
    "WhatsApp ilə başla":"Start on WhatsApp","Pulsuz hesab yarat":"Create a free account",
    // partners / footer
    "Etibarlı tərəfdaşlarımız":"Our trusted partners",
    "Azərbaycanın aparıcı əl-işi təşkilatları ilə əməkdaşlıqda":"In partnership with Azerbaijan's leading handcraft organizations",
    "Kənd sənətkarlarını dünya bazarına birləşdiririk · Azərbaycan":"Connecting rural artisans to the world market · Azerbaijan",
    "Əlaqə":"Contact","© 2026 EthnoExport · Bütün hüquqlar qorunur":"© 2026 EthnoExport · All rights reserved",
    "Yenidən başla":"Start over"
  };

  const SKIP=/^(SCRIPT|STYLE|NOSCRIPT)$/;
  const nodes=[];
  (function collect(el){
    el.childNodes.forEach(n=>{
      if(n.nodeType===3){const t=n.nodeValue.trim(); if(t && EN[t]!==undefined){n.__az=n.nodeValue;nodes.push(n);}}
      else if(n.nodeType===1 && !SKIP.test(n.tagName)) collect(n);
    });
  })(document.body);

  let LANG=localStorage.getItem('lang')||'az';
  function apply(){
    nodes.forEach(n=>{
      const t=n.__az.trim();
      n.nodeValue = LANG==='en' ? n.__az.replace(t, EN[t]) : n.__az;
    });
    document.documentElement.lang=LANG;
    document.querySelectorAll('[data-lang-btn]').forEach(b=>b.textContent = LANG==='en'?'AZ':'EN');
  }
  window.toggleLang=function(){LANG=LANG==='en'?'az':'en';localStorage.setItem('lang',LANG);apply();};
  apply();
})();
