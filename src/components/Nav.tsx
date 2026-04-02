import ThemeNavButton from "@/components/ThemeNavButton";

export default function Nav() {
  return (
    <nav className="border-b border-nothing-border bg-nothing-surface/95">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a
          href="/"
          className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-nothing-display transition-colors duration-200 ease-nothing hover:text-link"
          aria-label="Christian Lehman"
        >
          CL
        </a>
        <div className="flex items-center gap-5 sm:gap-6">
          <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.08em] text-nothing-secondary sm:gap-6">
            <a href="/blog" className="transition-colors duration-200 ease-nothing hover:text-nothing-primary">
              Writing
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
              href="https://www.linkedin.com/in/christianhlehman"
              target="_blank"
              rel="noopener"
              className="transition-colors duration-200 ease-nothing hover:text-nothing-primary"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/ChristianLehman"
              target="_blank"
              rel="noopener"
              className="transition-colors duration-200 ease-nothing hover:text-nothing-primary"
            >
              X
            </a>
          </div>
          <ThemeNavButton />
        </div>
      </div>
    </nav>
  );
}
