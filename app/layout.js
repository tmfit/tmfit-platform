import "./globals.css";

export const metadata = {
  title: "TM FIT Platform",
  description: "Luxury medical platform per monitoraggio corporeo e piani di allenamento.",
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
