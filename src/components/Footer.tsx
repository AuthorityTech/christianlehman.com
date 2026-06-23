const AI_AUDIT_GPT_URL = "https://chatgpt.com/g/g-6a03e35dbf088191a7dc5241511e1c05-ai-visibility-audit";
const AI_AUDIT_GEM_URL = "https://gemini.google.com/gem/1QrM7O1CkQi5hhPt3C-SQiHWOLi1xLY3C?usp=sharing";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-nothing-border">
      <div className="mx-auto max-w-content px-6 pt-10">
        <div className="grid gap-5 border-b border-nothing-border pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-xl">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-nothing-disabled">
              CMO Check
            </p>
            <h2 className="font-sans text-xl font-medium leading-tight tracking-normal text-nothing-display sm:text-2xl">
              Is AI recommending your brand?
            </h2>
            <p className="mt-3 text-sm leading-6 text-nothing-secondary">
              Run a free Machine Relations audit in ChatGPT or Gemini before your next planning meeting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <a
              href={AI_AUDIT_GPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center border border-nothing-primary bg-nothing-primary px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-nothing-page transition-colors duration-200 ease-nothing hover:border-link hover:bg-link"
            >
              ChatGPT Audit
            </a>
            <a
              href={AI_AUDIT_GEM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center border border-nothing-borderHi px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-nothing-primary transition-colors duration-200 ease-nothing hover:border-link hover:text-link"
            >
              Gemini Audit
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-8 font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-secondary sm:flex-row sm:items-center sm:justify-between">
        <span className="normal-case tracking-normal text-nothing-disabled">© {year} Christian Lehman</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
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
