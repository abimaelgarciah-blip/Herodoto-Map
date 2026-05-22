import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa de Heródoto",
  description:
    "Mapa interactivo del mundo antiguo según las Historias de Heródoto de Halicarnaso (484-425 a.C.)",
  keywords: ["Heródoto", "historia antigua", "Grecia", "Persia", "mapa histórico"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-parchment-100 text-ancient-dark font-serif">
        {children}
      </body>
    </html>
  );
}
