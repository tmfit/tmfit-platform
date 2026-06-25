import "./globals.css";

export const metadata = {
  title: "TMFIT",
  description: "TMFIT Coaching Platform",
  applicationName: "TMFIT",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TMFIT",
    statusBarStyle: "black"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07111f"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
