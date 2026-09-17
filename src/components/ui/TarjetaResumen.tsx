export function TarjetaResumen({
  titulo,
  valor,
  detalle,
  tono = "neutro",
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  tono?: "neutro" | "verde" | "amarillo" | "rojo";
}) {
  const colorPunto = {
    neutro: "bg-bosque-500",
    verde: "bg-verde-semaforo",
    amarillo: "bg-amarillo-semaforo",
    rojo: "bg-rojo-semaforo",
  }[tono];

  return (
    <div className="tarjeta flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorPunto}`} />
        <p className="text-xs uppercase tracking-wide text-bosque-500">{titulo}</p>
      </div>
      <p className="text-xl font-semibold text-bosque-900">{valor}</p>
      {detalle && <p className="text-sm text-bosque-500">{detalle}</p>}
    </div>
  );
}
