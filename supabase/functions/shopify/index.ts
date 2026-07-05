// EthnoExport — Shopify integration Edge Function
// Routes (via ?action=):
//   install   -> redirect merchant to Shopify OAuth consent (grants write_products)
//   callback  -> exchange code for offline access token, store it in app_settings
//   (POST)    -> publish a product (by id) to Shopify as DRAFT  [admin only]
//
// Required secrets (Supabase → Edge Functions → Secrets):
//   SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, SHOPIFY_STORE (e.g. b7yu9f-vu.myshopify.com)
//   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET")!;
const STORE = Deno.env.get("SHOPIFY_STORE")!; // b7yu9f-vu.myshopify.com
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VER = "2024-10";
const SCOPES = "write_products,read_products";

const admin = () => createClient(SUPA_URL, SERVICE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, "Content-Type": "application/json" },
  });
}
function html(body: string, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function getToken(): Promise<string | null> {
  const { data } = await admin().from("app_settings").select("value").eq("key", "shopify_token").single();
  return data?.value ?? null;
}

serveHandler();
function serveHandler() {
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    const url = new URL(req.url);
    const base = `https://${url.host}/functions/v1/shopify`; // həmişə HTTPS (Supabase daxildə http görür)
    const route = url.pathname.split("/").pop(); // install | callback | shopify(root)

    // 1) START OAUTH — open .../shopify/install once in the browser
    if (route === "install") {
      const redirect = encodeURIComponent(`${base}/callback`);
      const authUrl = `https://${STORE}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${redirect}&state=ee`;
      return Response.redirect(authUrl, 302);
    }

    // 2) OAUTH CALLBACK — exchange code, store token
    if (route === "callback") {
      const code = url.searchParams.get("code");
      if (!code) return html("<h2>Xəta: kod yoxdur.</h2>", 400);
      const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
      });
      if (!res.ok) return html(`<h2>Token alınmadı: ${await res.text()}</h2>`, 400);
      const { access_token } = await res.json();
      await admin().from("app_settings").upsert({ key: "shopify_token", value: access_token });
      return html("<h2>✅ Shopify bağlandı! Bu pəncərəni bağlaya bilərsiniz.</h2>");
    }

    // 3) PUBLISH A PRODUCT (POST, admin only)
    if (req.method === "POST") {
      // verify caller is an admin
      const authHeader = req.headers.get("Authorization") || "";
      const jwt = authHeader.replace("Bearer ", "");
      const asUser = createClient(SUPA_URL, Deno.env.get("SUPABASE_ANON_KEY") || SERVICE_KEY, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      });
      const { data: { user } } = await asUser.auth.getUser();
      if (!user) return json({ error: "Giriş tələb olunur" }, 401);
      const { data: prof } = await admin().from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") return json({ error: "Yalnız admin" }, 403);

      const token = await getToken();
      if (!token) return json({ error: "Shopify bağlı deyil. Əvvəlcə ?action=install linkini açın." }, 400);

      const { id } = await req.json();
      const { data: p } = await admin().from("products").select("*").eq("id", id).single();
      if (!p) return json({ error: "Məhsul tapılmadı" }, 404);

      const price = String(Math.round((p.landed || 0) * 1.08)); // sale price (USD)

      // material -> Shopify product_type (kateqoriya təklifləri bunun əsasında gəlir)
      const TYPE_MAP: Record<string, string> = {
        "Mis": "Copperware", "Xalça": "Rugs & Carpets", "Gümüş": "Jewelry",
        "Ağac": "Woodcraft", "Keramika": "Ceramics & Pottery", "Dəri": "Leather Goods",
        "Tekstil / İpək": "Textiles",
      };
      const productType = TYPE_MAP[p.material] || "Handmade Crafts";
      const maker = p.owner_name || "an Azerbaijani artisan";

      // zəngin, uzun elan mətni (SEO üçün)
      const bodyHtml = `
        <p><strong>${p.title || `Handmade Azerbaijani ${p.material}`}</strong></p>
        <p>This piece is entirely handmade by <strong>${maker}</strong>, a traditional craftsperson from rural Azerbaijan, using time-honored <strong>${p.material}</strong> techniques passed down through generations in the Caucasus.</p>
        <p>Every item is truly one of a kind. Subtle natural variations in color, texture and form are the signature of authentic handcraft — a mark of the human hand, never a flaw. It arrives ready to become a cherished part of your home or a meaningful, collectible gift.</p>
        <ul>
          <li>100% handmade in Azerbaijan</li>
          <li>Material: ${p.material}</li>
          <li>Authentic heritage craft, sourced ethically and directly from the maker</li>
          <li>Carefully quality-checked and repacked for safe international shipping</li>
          <li>Ships worldwide with tracked delivery</li>
        </ul>
        <p>By purchasing, you directly support a rural artisan and help preserve endangered Azerbaijani craft traditions.</p>`.trim();

      const productBody: Record<string, unknown> = {
        product: {
          title: p.title || `${p.material} — Handmade Azerbaijani craft`,
          body_html: bodyHtml,
          product_type: productType,
          vendor: "EthnoExport",
          status: "draft",
          tags: Array.isArray(p.tags) ? p.tags.join(",") : "",
          variants: [{ price }],
          images: (Array.isArray(p.photos) && p.photos.length
                    ? p.photos : (p.photo_url ? [p.photo_url] : [])).map((src: string) => ({ src })),
        },
      };
      const shopRes = await fetch(`https://${STORE}/admin/api/${API_VER}/products.json`, {
        method: "POST",
        headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
        body: JSON.stringify(productBody),
      });
      if (!shopRes.ok) return json({ error: "Shopify xətası: " + await shopRes.text() }, 400);
      const created = await shopRes.json();
      const gid = created?.product?.id;
      const handle = created?.product?.handle;
      const shopUrl = handle ? `https://${STORE}/products/${handle}` : null;
      await admin().from("products").update({ shopify_id: String(gid || ""), shopify_url: shopUrl }).eq("id", id);
      return json({ ok: true, shopify_id: gid, shopify_url: shopUrl });
    }

    return html("EthnoExport Shopify function. Use ?action=install to connect.");
  });
}
