export default function Nav() {
  return (
    <nav className="border-b border-[#e5e5e5] bg-[#fafafa]/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <a
          href="/"
          className="text-[15px] font-bold tracking-[0.12em] text-[#1a1a1a] hover:text-link transition-colors uppercase"
          aria-label="Christian Lehman"
        >
          JP
        </a>
        <div className="flex items-center gap-6 text-[13px] text-[#6b6b6b]">
          <a href="/blog" className="hover:text-[#1a1a1a] transition-colors">Writing</a>
          <a href="https://authoritytech.io" target="_blank" rel="noopener" className="hover:text-link transition-colors">AuthorityTech</a>
          <a href="https://www.linkedin.com/in/christianhlehman" target="_blank" rel="noopener" className="hover:text-[#1a1a1a] transition-colors">LinkedIn</a>
          <a href="https://x.com/ChristianLehman" target="_blank" rel="noopener" className="hover:text-[#1a1a1a] transition-colors">X</a>
        </div>
      </div>
    </nav>
  );
}