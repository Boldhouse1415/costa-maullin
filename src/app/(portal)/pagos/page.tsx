import { crearClienteServidor } from "@/lib/supabase/server";
import { BotonCopiar } from "@/components/ui/BotonCopiar";
import { Icono } from "@/components/ui/Icono";

export default async function PaginaPagos() {
  const supabase = await crearClienteServidor();

  const { data: config } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", "datos_bancarios_tesoreria")
    .maybeSingle();

  const datos = config?.valor as
    | {
        titular?: string;
        rut?: string;
        banco?: string;
        tipo_cuenta?: string;
        numero_cuenta?: string;
      }
    | undefined;

  const filas = datos
    ? [
        { etiqueta: "Titular", valor: datos.titular },
        { etiqueta: "RUT", valor: datos.rut },
        { etiqueta: "Banco", valor: datos.banco },
        { etiqueta: "Tipo de cuenta", valor: datos.tipo_cuenta },
        { etiqueta: "N.° de cuenta", valor: datos.numero_cuenta },
      ].filter((f) => f.valor)
    : [];

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Mis Pagos</h1>

      {filas.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
            Datos para transferencia
          </p>
          <div className="tarjeta flex flex-col divide-y divide-arena-300 p-4">
            {filas.map((f) => (
              <div key={f.etiqueta} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-xs text-bosque-500">{f.etiqueta}</p>
                  <p className="text-sm font-medium text-bosque-900">{f.valor}</p>
                </div>
                <BotonCopiar valor={f.valor!} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
        <Icono nombre="pagos" className="h-8 w-8 text-bosque-500" />
        <p className="text-sm">
          Tu estado de cuenta, historial de pagos y comprobantes se agregan en la siguiente
          etapa.
        </p>
      </div>
    </div>
  );
}
