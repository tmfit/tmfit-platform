import "./globals.css";

export const metadata = {
  title: "TMFIT",
  description: "Allenamento, nutrizione, check-in e progressi.",
  applicationName: "TMFIT",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TMFIT",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#07111f"
};


export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
