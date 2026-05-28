// scripts/generate-sitemap.mjs
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://reiniciometabolico.net";

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const lastmod = `${yyyy}-${mm}-${dd}`;

const urls = [
  { loc: `${BASE_URL}/`, changefreq: "weekly", priority: "1.0", lastmod },
  { loc: `${BASE_URL}/programa`, changefreq: "weekly", priority: "0.8", lastmod },

  { loc: `${BASE_URL}/terminos`, changefreq: "yearly", priority: "0.4", lastmod },
  { loc: `${BASE_URL}/privacidad`, changefreq: "yearly", priority: "0.4", lastmod },
  { loc: `${BASE_URL}/devoluciones`, changefreq: "yearly", priority: "0.4", lastmod },

  { loc: `${BASE_URL}/gracias-kit`, changefreq: "monthly", priority: "0.3" },
  { loc: `${BASE_URL}/gracias-upsell`, changefreq: "monthly", priority: "0.3" },
  { loc: `${BASE_URL}/pago-fallido`, changefreq: "monthly", priority: "0.2" },
  { loc: `${BASE_URL}/pago-pendiente`, changefreq: "monthly", priority: "0.2" },
];

const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");

const items = urls
  .map(({ loc, changefreq, priority, lastmod }) => {
    return `
  <url>
    <loc>${loc}</loc>${
      lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""
    }
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`.trim();

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");

console.log("robots.txt y sitemap.xml generados en /public");