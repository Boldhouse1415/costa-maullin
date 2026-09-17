import Image from "next/image";
import { BarraNavegacionInferior } from "@/components/ui/BarraNavegacionInferior";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-arena-100">
      <header className="flex items-center justify-center border-b border-arena-300 bg-white/80 py-2 backdrop-blur">
        <Image
          src="/logo-costa-maullin.png"
          alt="Costa Maullín"
          width={2070}
          height={760}
          priority
          className="h-8 w-auto"
        />
      </header>
      <main className="flex-1 pb-24 sm:pb-8">{children}</main>
      <BarraNavegacionInferior />
    </div>
  );
}
