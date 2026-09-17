import { Icono, type NombreIcono } from "./Icono";

type Variante = "neutro" | "oscuro" | "claro" | "amarillo" | "rojo";

const ESTILOS: Record<
  Variante,
  {
    fondo: string;
    texto: string;
    detalle: string;
    punto: string;
    circuloIcono: string | null;
  }
> = {
  neutro: {
    fondo: "tarjeta",
    texto: "text-bosque-900",
    detalle: "text-bosque-500",
    punto: "bg-bosque-500",
    circuloIcono: null,
  },
  oscuro: {
    fondo: "bg-bosque-900",
    texto: "text-arena-100",
    detalle: "text-bosque-300",
    punto: "bg-arena-100",
    circuloIcono: null,
  },
  claro: {
    fondo: "bg-bosque-300/45",
    texto: "text-bosque-900",
    detalle: "text-bosque-700",
    punto: "bg-bosque-700",
    circuloIcono: "bg-white text-bosque-700",
  },
  amarillo: {
    fondo: "bg-amarillo-semaforo",
    texto: "text-bosque-900",
    detalle: "text-bosque-700",
    punto: "bg-bosque-900",
    circuloIcono: "bg-white text-bosque-700",
  },
  rojo: {
    fondo: "bg-rojo-semaforo",
    texto: "text-arena-100",
    detalle: "text-arena-200",
    punto: "bg-arena-100",
    circuloIcono: "bg-white text-rojo-semaforo",
  },
};

export function TarjetaResumen({
  titulo,
  valor,
  detalle,
  icono,
  variante = "neutro",
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  icono?: NombreIcono;
  variante?: Variante;
}) {
  const e = ESTILOS[variante];
  const esOscuro = variante === "oscuro";

  return (
    <div className={`flex flex-col gap-2 rounded-2xl p-4 ${e.fondo}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${e.punto}`} />
          <p className={`text-[11px] font-medium uppercase tracking-wide ${e.detalle}`}>
            {titulo}
          </p>
        </div>
        {icono && e.circuloIcono && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${e.circuloIcono}`}
          >
            <Icono nombre={icono} className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {icono && esOscuro && <Icono nombre={icono} className={`h-7 w-7 ${e.texto}`} />}
        <p className={`text-2xl font-bold ${e.texto}`}>{valor}</p>
      </div>

      {detalle && <p className={`text-xs ${e.detalle}`}>{detalle}</p>}
    </div>
  );
}
