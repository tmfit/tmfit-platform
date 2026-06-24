export default function manifest() {
  return {
    name: "TMFIT - Allenamento & Nutrizione",
    short_name: "TMFIT",
    description: "Webapp TMFIT per allenamento, dieta, check-in e progressi.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#07111f",
    orientation: "portrait",
    categories: ["health", "fitness", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
}
