"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioContacto() {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const { error } = await supabase.from("contactos_utiles").insert({
      nombre,
      cargo: cargo || null,
      telefono: telefono || null,
      whatsapp: whatsapp || null,
      email: email || null,
    });

    setEnviando(false);

    if (error) {
      setError("No se pudo guardar el contacto. Intenta nuevamente.");
      return;
    }

    setNombre("");
    setCargo("");
    setTelefono("");
    setWhatsapp("");
    setEmail("");
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-full bg-bosque-700 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        + Agregar contacto
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-3 p-4">
      <input
        type="text"
        required
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="text"
        placeholder="Cargo o rubro (ej. Electricista)"
        value={cargo}
        onChange={(e) => setCargo(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="tel"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="tel"
        placeholder="WhatsApp (opcional, con +56)"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="email"
        placeholder="Correo (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar contacto"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-full bg-bosque-500 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
