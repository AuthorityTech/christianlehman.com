export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-nothing-border">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-8 font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-secondary">
        <span className="normal-case tracking-normal text-nothing-disabled">© {year} Christian Lehman</span>
        <div className="flex gap-5">
          <a
            href="https://x.com/ChristianLehman"
            target="_blank"
            rel="noopener"
            className="transition-colors duration-200 ease-nothing hover:text-nothing-primary"
          >
            X
          </a>
          <a
            href="https://www.linkedin.com/in/christianhlehman"
            target="_blank"
            rel="noopener"
            className="transition-colors duration-200 ease-nothing hover:text-nothing-primary"
          >
            LinkedIn
          </a>
          <a
            href="https://authoritytech.io"
            target="_blank"
            rel="noopener"
            className="transition-colors duration-200 ease-nothing hover:text-link"
          >
            AuthorityTech
          </a>
          <a
            href="https://machinerelations.ai"
            target="_blank"
            rel="noopener"
            className="transition-colors duration-200 ease-nothing hover:text-link"
          >
            MachineRelations
          </a>
        </div>
      </div>
    </footer>
  );
}
