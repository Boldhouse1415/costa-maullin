import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bosque-900 to-bosque-700 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo-costa-maullin-blanco.png"
            alt="Costa Maullín — Portal de la comunidad"
            width={2069}
            height={760}
            priority
            className="h-auto w-full max-w-[420px]"
          />
        </div>
        <div className="tarjeta p-6 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
