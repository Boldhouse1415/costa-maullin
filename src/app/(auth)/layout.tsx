export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bosque-900 to-bosque-700 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-bosque-300">
            Portal de la comunidad
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-arena-100">Costa Maullín</h1>
        </div>
        <div className="tarjeta p-6 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
