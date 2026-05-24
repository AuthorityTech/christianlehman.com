"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Mode = "human" | "machine";

const STORAGE_KEY = "cl-view-mode";

function readStoredMode(): Mode {
  if (typeof window === "undefined") return "human";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "machine"
      ? "machine"
      : "human";
  } catch {
    return "human";
  }
}

function markdownPath(pathname: string): string {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  if (cleanPath === "/") return "/index.md";
  if (cleanPath.endsWith(".md")) return cleanPath;
  return `${cleanPath}.md`;
}

export default function MachineViewToggle() {
  const pathname = usePathname();
  const [mode, setModeState] = useState<Mode>(readStoredMode);
  const [copied, setCopied] = useState(false);
  const [mdMissing, setMdMissing] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  const mdPath = useMemo(() => markdownPath(pathname), [pathname]);

  const setMode = useCallback((nextMode: Mode) => {
    setModeState(nextMode);
    if (nextMode === "human") setMdMissing(false);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.viewMode = mode;
    document.body.classList.toggle("machine-view-active", mode === "machine");
  }, [mode]);

  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute("data-view-mode");
      document.body.classList.remove("machine-view-active");
    };
  }, []);

  useEffect(() => {
    if (mode !== "machine") return;
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("human");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, setMode]);

  useEffect(() => {
    if (mode !== "machine") return;

    let cancelled = false;
    fetch(mdPath, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setMdMissing(!res.ok);
      })
      .catch(() => {
        if (!cancelled) setMdMissing(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mdPath, mode]);

  const copyMarkdown = useCallback(async () => {
    try {
      const res = await fetch(mdPath, {
        headers: { Accept: "text/markdown,text/plain;q=0.9,*/*;q=0.1" },
      });
      if (!res.ok) return;
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard or network unavailable */
    }
  }, [mdPath]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMode(mode === "human" ? "machine" : "human")}
        className="cl-view-switch"
        aria-label={`Switch to ${mode === "human" ? "machine" : "human"} view`}
      >
        <span
          className="cl-view-switch__label"
          data-active={mode === "human" ? "true" : undefined}
        >
          Human
        </span>
        <span className="cl-view-switch__divider" />
        <span
          className="cl-view-switch__label"
          data-active={mode === "machine" ? "true" : undefined}
        >
          Machine
        </span>
      </button>

      {mode === "machine" && (
        <section
          ref={panelRef}
          className="cl-machine-panel"
          aria-label="Machine view"
          tabIndex={-1}
        >
          <div className="cl-machine-panel__bar">
            <span className="cl-machine-panel__title">Machine View</span>
            <div className="cl-machine-panel__actions">
              <button
                type="button"
                onClick={copyMarkdown}
                className="cl-machine-panel__btn"
                disabled={mdMissing}
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={mdPath}
                target="_blank"
                rel="noopener noreferrer"
                className="cl-machine-panel__btn"
              >
                Raw .md
              </a>
              <button
                type="button"
                onClick={() => setMode("human")}
                className="cl-machine-panel__btn"
              >
                Esc
              </button>
            </div>
          </div>
          {mdMissing ? (
            <p className="cl-machine-panel__message">
              No machine view exists for {pathname}
            </p>
          ) : (
            <iframe
              className="cl-machine-panel__frame"
              src={mdPath}
              title={`Machine-readable markdown for ${pathname}`}
            />
          )}
        </section>
      )}
    </>
  );
}
