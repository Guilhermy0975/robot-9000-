import "./globals.css";
import { Inter, Anton } from "next/font/google";
import localFont from "next/font/local";
import { BRAND } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
// EB Garamond (licença SIL OFL, veja app/fonts/EBGaramond-OFL.txt)
const garamond = localFont({
  src: [
    { path: "./fonts/EBGaramond12-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/EBGaramond12-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-garamond",
  display: "swap",
});

export const metadata = {
  title: BRAND.name,
  description: BRAND.description,
  applicationName: BRAND.name,
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#070506",
};

// Aplica o tema salvo antes da página aparecer (evita "piscar" de cor)
const themeScript = `try{var t=localStorage.getItem("robot9000:theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-theme="dark" className={`${inter.variable} ${anton.variable} ${garamond.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased grain">{children}</body>
    </html>
  );
}
