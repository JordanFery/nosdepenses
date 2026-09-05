import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Dépenses — Jordan & Samya",
  description: "Suivi et équilibrage des dépenses du couple",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 antialiased">
        <Nav />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-10">
          {children}
        </main>
      </body>
    </html>
  );
}
