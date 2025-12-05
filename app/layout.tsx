import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aduan Banjir Malang - Lapor Banjir Real-time",
  description: "Sistem pelaporan banjir real-time untuk warga Kota Malang. Lapor dan pantau kondisi banjir di sekitar Anda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="id" className="dark">
        <body className="bg-zinc-950 text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
