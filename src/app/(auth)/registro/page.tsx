"use client";

import { useState } from "react";
import Link from "next/link";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaRegistro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const supabase = crearClienteNavegador();

  async function registrarse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setCargando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="text-center text-bosque-900">
        <p className="font-medium">Revisa tu correo</p>
        <p className="mt-2 text-sm text-bosque-500">
          Te enviamos un link para confirmar tu cuenta y continuar con tu registro.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-center text-lg font-medium text-bosque-900">
        Bienvenido a Costa Maullín
      </h2>
      <p className="text-center text-sm text-bosque-500">
        Crea tu cuenta para completar tu perfil e ingresar a la comunidad.
      </p>

      <form onSubmit={registrarse} className="flex flex-col gap-3">
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
          minLength={8}
          placeholder="Crea una contraseña"
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
          {cargando ? "Creando cuenta…" : "Registrarme con email"}
        </button>
      </form>

      <p className="text-center text-sm text-bosque-500">¿Ya tienes cuenta?</p>
      <Link
        href="/login"
        className="rounded-full bg-arena-200 py-2.5 text-center text-sm font-medium text-bosque-900 transition hover:bg-arena-300"
      >
        Ingresa aquí
      </Link>
    </div>
  );
}
