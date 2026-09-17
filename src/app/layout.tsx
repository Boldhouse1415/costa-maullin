import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://costa-maullin.netlify.app"),
  title: "Costa Maullín",
  description: "Portal digital de la comunidad de Costa Maullín",
  openGraph: {
    title: "Costa Maullín",
    description: "Portal digital de la comunidad de Costa Maullín",
    url: "https://costa-maullin.netlify.app",
    siteName: "Costa Maullín",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Costa Maullín",
    description: "Portal digital de la comunidad de Costa Maullín",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-arena-100 text-foreground">
        {children}
      </body>
    </html>
  );
}
