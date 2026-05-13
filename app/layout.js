import "./globals.css";

export const metadata = {
  title: "TM FIT Platform",
  description: "Luxury medical platform",
};

export default function RootLayout({ children }) {
  return <html lang="it"><body>{children}</body></html>;
}
