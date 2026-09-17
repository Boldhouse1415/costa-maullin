export function PantallaCargando({ oscuro = false }: { oscuro?: boolean }) {
  return (
    <div
      className={`flex min-h-[60vh] flex-col items-center justify-center gap-4 ${
        oscuro ? "bg-transparent" : ""
      }`}
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-bosque-500/30" />
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-bosque-300/40 border-t-bosque-700" />
        <span className="h-5 w-5 rounded-full bg-bosque-700" />
      </div>
      <p className="text-sm font-medium tracking-wide text-bosque-500">Cargando…</p>
    </div>
  );
}
