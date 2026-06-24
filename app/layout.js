import "./globals.css";

export const metadata = {
  title: "TMFIT",
  description: "TMFIT Coaching Platform"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07111f"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
