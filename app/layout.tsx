import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ἱστορίαι — Las Historias de Heródoto",
  description: "Mapa interactivo de todos los lugares mencionados en las Historias de Heródoto de Halicarnaso · Siglo V a.C.",
  keywords: ["Heródoto", "Historias", "mapa histórico", "Grecia antigua", "Persia"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
