const items = [
  "METODO",
  "NUTRIZIONE",
  "ALLENAMENTO",
  "MONITORAGGIO",
  "COACHING ONLINE",
  "TMFIT PLATFORM",
];

export function MarqueeStrip() {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-white/10 bg-teal-300 py-3 text-[#07111f]">
      <div className="marquee-track flex min-w-max items-center">
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center">
            <span className="px-5 text-[11px] font-black uppercase tracking-[0.24em] sm:px-8 sm:text-xs">
              {item}
            </span>
            <span className="size-1.5 rounded-full bg-[#07111f]" />
          </span>
        ))}
      </div>
    </div>
  );
}
