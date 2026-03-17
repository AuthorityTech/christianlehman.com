export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#e5e5e5] mt-24">
      <div className="max-w-2xl mx-auto px-6 py-8 flex items-center justify-between text-[12px] text-[#6b6b6b]">
        <span>© {year} Christian Lehman</span>
        <div className="flex gap-5">
          <a href="https://x.com/ChristianLehman" target="_blank" rel="noopener" className="hover:text-[#1a1a1a] transition-colors">X</a>
          <a href="https://www.linkedin.com/in/christianhlehman" target="_blank" rel="noopener" className="hover:text-[#1a1a1a] transition-colors">LinkedIn</a>
          <a href="https://authoritytech.io" target="_blank" rel="noopener" className="hover:text-link transition-colors">AuthorityTech</a>
          <a href="https://machinerelations.ai" target="_blank" rel="noopener" className="hover:text-link transition-colors">MachineRelations</a>
        </div>
      </div>
    </footer>
  );
}