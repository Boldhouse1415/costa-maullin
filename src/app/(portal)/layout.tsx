import { BarraNavegacionInferior } from "@/components/ui/BarraNavegacionInferior";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-arena-100">
      <main className="flex-1 pb-24 sm:pb-8">{children}</main>
      <BarraNavegacionInferior />
    </div>
  );
}
