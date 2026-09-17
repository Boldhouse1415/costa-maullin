"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaRecuperar() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const supabase = crearClienteNavegador();

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setEnviado(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-lg font-medium text-bosque-900">
        Recuperar contraseña
      </h2>
      {enviado ? (
        <p className="text-center text-sm text-bosque-500">
          Si el correo existe, te enviamos un link para crear una nueva contraseña.
        </p>
      ) : (
        <form onSubmit={enviarLink} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="tu@correo.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900"
          >
            Enviar link
          </button>
        </form>
      )}
    </div>
  );
}
