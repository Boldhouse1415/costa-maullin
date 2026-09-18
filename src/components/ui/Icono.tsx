export type NombreIcono =
  | "inicio"
  | "parcela"
  | "reportar"
  | "comunidad"
  | "perfil"
  | "mapa"
  | "pagos"
  | "calendario"
  | "documentos"
  | "acceso"
  | "contactos"
  | "noticias"
  | "sol"
  | "nublado"
  | "lluvia"
  | "check"
  | "alerta"
  | "llave"
  | "flecha"
  | "tesoreria"
  | "votaciones";

const trazos: Record<NombreIcono, React.ReactNode> = {
  inicio: (
    <path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" />
  ),
  parcela: (
    <>
      <path d="M12 21c4.5-3.2 7-6.9 7-10.5A7 7 0 0 0 5 10.5C5 14.1 7.5 17.8 12 21Z" />
      <path d="M12 21v-7" />
    </>
  ),
  reportar: (
    <>
      <circle cx="12" cy="10.5" r="6.5" />
      <path d="M12 4v2.2M12 14.8V17M5.5 10.5h2.2M16.3 10.5h2.2" />
      <path d="M12 21c1.6-1.7 2.4-3 2.4-4H9.6c0 1 .8 2.3 2.4 4Z" />
    </>
  ),
  comunidad: (
    <>
      <path d="M8 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M16 11.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" />
      <path d="M3 19v-.8c0-2.3 2.2-4.2 5-4.2s5 1.9 5 4.2V19" />
      <path d="M14.2 14.4c2.3.2 4.3 1.9 4.3 4v.6" />
    </>
  ),
  perfil: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
    </>
  ),
  mapa: (
    <>
      <path d="M9 4.5 3.5 6.3v13.2L9 17.7l6 2 5.5-1.8V4.7l-5.5 1.8-6-2Z" />
      <path d="M9 4.5v13.2M15 6.7v13" />
    </>
  ),
  pagos: (
    <>
      <rect x="3" y="6" width="18" height="12.5" rx="2" />
      <path d="M3 10h18" />
      <path d="M6.5 14.5h4" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8 3.5V7M16 3.5V7" />
      <path d="M8 14h2M14 14h2M8 17h2M14 17h2" />
    </>
  ),
  documentos: (
    <>
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12.5h6M9 15.8h6" />
    </>
  ),
  acceso: (
    <>
      <circle cx="8.5" cy="15.5" r="3.5" />
      <path d="M11.3 12.8 18.5 5.6M16 8l2 2M18.3 5.7l2 2" />
    </>
  ),
  contactos: (
    <path d="M6.5 4.5c.6 1.7 1.4 3.2 2.5 4.3-1 1-1 1.6-.5 2.5.9 1.7 2.5 3.3 4.2 4.2.9.5 1.5.5 2.5-.5 1.1 1.1 2.6 1.9 4.3 2.5.6.2 1 .8.9 1.4l-.4 2a1.2 1.2 0 0 1-1.3 1c-8-.8-14.5-7.3-15.3-15.3a1.2 1.2 0 0 1 1-1.3l2-.4c.6-.1 1.2.3 1.4.9Z" />
  ),
  noticias: (
    <>
      <path d="M3 9.5v5a1 1 0 0 0 1 1h2.3l8.4 4V4.5l-8.4 4H4a1 1 0 0 0-1 1Z" />
      <path d="M9.5 15.3v3a1.4 1.4 0 0 0 1.4 1.4h.4a1.4 1.4 0 0 0 1.4-1.6l-.4-2.4" />
      <path d="M18.2 9.2a4.2 4.2 0 0 1 0 5.6M20.5 7.2a7.3 7.3 0 0 1 0 9.6" />
    </>
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2.2M12 18.8V21M4.2 12H2M22 12h-2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
    </>
  ),
  nublado: (
    <path d="M7 18.5a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.2 9.1 4.2 4.2 0 0 1 16.8 18.5H7Z" />
  ),
  lluvia: (
    <>
      <path d="M7 15.5a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.2 6.6 4.2 4.2 0 0 1 16.8 15.5H7Z" />
      <path d="M8.5 18v1.6M12 18v1.6M15.5 18v1.6" />
    </>
  ),
  check: <path d="M4.5 12.8 9 17.3 19.5 6.7" />,
  alerta: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4.2M12 17.2v.1" />
    </>
  ),
  llave: (
    <>
      <circle cx="7" cy="12" r="3.3" />
      <path d="M10.2 12H20M16 12v3M19 12v2" />
    </>
  ),
  flecha: <path d="M9 5.5 15.5 12 9 18.5" />,
  tesoreria: (
    <>
      <circle cx="8.5" cy="8.5" r="4.5" />
      <circle cx="15" cy="14.5" r="4.5" />
      <path d="M8.5 8.5v0M15 14.5v0" />
    </>
  ),
  votaciones: (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="2" />
      <path d="M8 10.5h8M8 14h5" />
      <circle cx="7" cy="10.5" r="0.6" fill="currentColor" />
      <circle cx="7" cy="14" r="0.6" fill="currentColor" />
    </>
  ),
};

export function Icono({
  nombre,
  className = "h-5 w-5",
}: {
  nombre: NombreIcono;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {trazos[nombre]}
    </svg>
  );
}
