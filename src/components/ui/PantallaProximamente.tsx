export function PantallaProximamente({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col gap-2 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">{titulo}</h1>
      <p className="text-sm text-bosque-500">{descripcion}</p>
      <div className="tarjeta mt-4 flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
        <span className="text-3xl">🌲</span>
        <p className="text-sm">Este módulo se construye en la siguiente etapa.</p>
      </div>
    </div>
  );
}
