"use client";

import { useState } from "react";
import Link from "next/link";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = crearClienteNavegador();

  async function iniciarSesionConEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    window.location.href = "/inicio";
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-center text-lg font-medium text-bosque-900">Ingresar</h2>

      <form onSubmit={iniciarSesionConEmail} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="tu@correo.cl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-xl border border-arena-300 bg-white px-4 text-bosque-900 outline-none focus:border-bosque-500"
        />

        {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="h-12 rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <div className="flex gap-2">
        <Link
          href="/recuperar"
          className="flex-1 rounded-full bg-arena-200 py-2.5 text-center text-sm font-medium text-bosque-900 transition hover:bg-arena-300"
        >
          Olvidé mi contraseña
        </Link>
        <Link
          href="/registro"
          className="flex-1 rounded-full bg-bosque-500 py-2.5 text-center text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
