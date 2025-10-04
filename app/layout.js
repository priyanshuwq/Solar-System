import "./globals.css";
import Head from "next/head";

export const metadata = {
  title: "Space Explorer",
  description: "3D Interactive Space Journey — Next.js + Three.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@300;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-space text-white font-display">{children}</body>
    </html>
  );
}
