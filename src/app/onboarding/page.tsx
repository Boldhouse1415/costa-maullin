"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

type Paso = 1 | 2 | 3 | 4;

export default function PaginaOnboarding() {
  const [paso, setPaso] = useState<Paso>(1);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [numeroParcela, setNumeroParcela] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = crearClienteNavegador();

  async function guardarDatosYContinuar() {
    setGuardando(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Tu sesión expiró, vuelve a iniciar sesión.");
      setGuardando(false);
      return;
    }

    const { error: errorPerfil } = await supabase
      .from("perfiles")
      .update({ nombre, apellidos, telefono, whatsapp })
      .eq("usuario_id", user.id);

    setGuardando(false);
    if (errorPerfil) {
      setError("No pudimos guardar tus datos, intenta de nuevo.");
      return;
    }
    setPaso(3);
  }

  async function solicitarVinculacion() {
    setGuardando(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Tu sesión expiró, vuelve a iniciar sesión.");
      setGuardando(false);
      return;
    }

    const { data: parcela, error: errorBusqueda } = await supabase
      .from("parcelas")
      .select("id")
      .eq("numero", numeroParcela.trim())
      .maybeSingle();

    if (errorBusqueda || !parcela) {
      setGuardando(false);
      setError(
        `No encontramos la Parcela N.° ${numeroParcela}. Verifica el número o contacta a administración.`,
      );
      return;
    }

    const { error: errorSolicitud } = await supabase.from("propietario_parcela").insert({
      usuario_id: user.id,
      parcela_id: parcela.id,
      estado: "pendiente",
    });

    setGuardando(false);
    if (errorSolicitud) {
      setError("No pudimos enviar tu solicitud, intenta de nuevo.");
      return;
    }
    setPaso(4);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bosque-900 to-bosque-700 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 w-10 rounded-full ${
                paso >= n ? "bg-arena-100" : "bg-bosque-500"
              }`}
            />
          ))}
        </div>

        <div className="tarjeta p-6 shadow-xl">
          {paso === 1 && (
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-lg font-medium text-bosque-900">
                Bienvenido a Costa Maullín
              </h2>
              <p className="text-sm text-bosque-500">
                Completa tu perfil para ingresar a la comunidad. Toma menos de un minuto.
              </p>
              <button
                onClick={() => setPaso(2)}
                className="h-12 rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900"
              >
                Comenzar
              </button>
            </div>
          )}

          {paso === 2 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-medium text-bosque-900">Tus datos</h2>
              <input
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
              />
              <input
                placeholder="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
              />
              <input
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
              />
              <input
                placeholder="WhatsApp (si es distinto)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
              />
              {error && <p className="text-sm text-rojo-semaforo">{error}</p>}
              <button
                onClick={guardarDatosYContinuar}
                disabled={guardando || !nombre || !apellidos}
                className="h-12 rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Continuar"}
              </button>
            </div>
          )}

          {paso === 3 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-medium text-bosque-900">Tu parcela</h2>
              <p className="text-sm text-bosque-500">
                Indica el número de tu parcela. Un administrador validará el vínculo
                antes de darte acceso a su información.
              </p>
              <input
                placeholder="N.° de parcela"
                value={numeroParcela}
                onChange={(e) => setNumeroParcela(e.target.value)}
                className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
              />
              {error && <p className="text-sm text-rojo-semaforo">{error}</p>}
              <button
                onClick={solicitarVinculacion}
                disabled={guardando || !numeroParcela}
                className="h-12 rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
              >
                {guardando ? "Enviando…" : "Solicitar vinculación"}
              </button>
            </div>
          )}

          {paso === 4 && (
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-lg font-medium text-bosque-900">
                Solicitud enviada
              </h2>
              <p className="text-sm text-bosque-500">
                Administración recibió tu solicitud para vincular la Parcela N.°{" "}
                {numeroParcela}. Te avisaremos apenas sea aprobada.
              </p>
              <a
                href="/inicio"
                className="h-12 flex items-center justify-center rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900"
              >
                Ir a mi Home
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
