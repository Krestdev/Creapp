import type { Metadata } from "next";
import { Poppins, Work_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import useAuthGuard from "@/hooks/useAuthGuard";

const sans = Work_Sans({
  variable: "--font-worksans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const mono = Poppins({
  variable: "--font-poppins",
  subsets : ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"]
})


export const metadata: Metadata = {
  title: {
    template: "%s - CreApp",
    default: "CreApp",
  },
  icons: {
    icon: "/logo-icon.svg",
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  authors: [{name: "KrestDev", url: "https://krestdev.com"}],
  creator: "KrestDev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${sans.variable} ${mono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
