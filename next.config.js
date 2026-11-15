/** @type {import('next').NextConfig} */

// En GitHub Pages el sitio se sirve como archivos estáticos bajo /<repositorio>.
// El flujo de trabajo de Pages define GITHUB_PAGES y PAGES_BASE_PATH; en Vercel
// y en local no existen y la configuración queda como estaba.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? process.env.PAGES_BASE_PATH || "" : "";

const nextConfig = {
  // El lector carga el texto del libro desde /public con esta ruta base
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isPages
    ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
    : {}),
};

module.exports = nextConfig;
