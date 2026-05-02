export default function Footer({ compact = false }) {
  if (compact) {
    return (
      <footer className="flex items-center justify-center gap-3 px-6 py-2 border-t border-border bg-card flex-shrink-0">
        <img
          src="/bl-logo.png"
          alt="Black Line Agency"
          className="h-10 w-auto opacity-100"
        />
        <span className="text-dim text-[10px] tracking-wider">
          © 2026 Black Line Agency · Especialistas em estúdios de tatuagem
        </span>
      </footer>
    )
  }

  return (
    <footer className="mt-10 border-t border-border/50 pt-8 pb-6 flex flex-col items-center gap-4">
      <img
        src="/bl-logo.png"
        alt="Black Line Agency"
        className="h-36 w-auto opacity-100"
      />

      <div className="text-center space-y-0.5">
        <p className="text-text font-bold tracking-widest text-xs uppercase">Black Line</p>
        <p className="text-muted text-xs">Especialistas em estúdios de tatuagem</p>
      </div>

      <div className="flex flex-col items-center gap-1 text-[11px] text-dim">
        <a
          href="https://instagram.com/blackline.mkt"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gold transition-colors"
        >
          @blackline.mkt
        </a>
        <a
          href="mailto:contato.blacklineagency@gmail.com"
          className="hover:text-gold transition-colors"
        >
          contato.blacklineagency@gmail.com
        </a>
      </div>

      <p className="text-dim text-[10px] tracking-wide">
        © 2026 Black Line Agency. Todos os direitos reservados.
      </p>
    </footer>
  )
}
