export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/30 py-10 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Mate Shop</p>
          <p className="mt-2 text-sm text-white/60">
            Frosted gifts and luminous delights, curated on Base.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-white/60">
          <a href="#" className="hover:text-white">
            About
          </a>
          <a href="#" className="hover:text-white">
            Contact
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
