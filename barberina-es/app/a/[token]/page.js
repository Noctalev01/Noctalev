"use client";
// LINK PRÓPRIO: https://app/a/<token> — a clienta entra direto, já com o nome dela.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { accederToken, perfilCompleto, frascoRecibido } from "../../../lib/store";
import { Splash } from "../../../components/ui";
import { linkCamila } from "../../../lib/config";

const MSG = {
  link: "Este enlace no es válido o ha caducado.",
  cancelado: "Este pedido figura como cancelado o devuelto.",
  red: "No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo.",
};

export default function Acceso() {
  const { token } = useParams();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    let vivo = true;
    accederToken(token).then((r) => {
      if (!vivo) return;
      if (!r.ok) { setErr(r.error); return; }
      const s = r.s;
      router.replace(!perfilCompleto(s) ? "/bienvenida" : frascoRecibido(s) && !s.vistos?.recibido ? "/recibido" : "/");
    });
    return () => { vivo = false; };
  }, [token, router, intento]);

  if (!err) return <Splash />;
  return (
    <div className="max-w-md mx-auto min-h-dvh bg-fondo flex flex-col items-center justify-center px-8 text-center">
      <img src="/img/frasco.png" alt="" className="w-24 h-28 object-contain" />
      <h1 className="font-sora font-extrabold text-[22px] mt-4">Vaya…</h1>
      <p className="text-[14px] text-sub font-medium mt-2 leading-relaxed">{MSG[err] || MSG.link}</p>
      {err === "red" && <button onClick={() => { setErr(""); setIntento((x) => x + 1); }} className="btn-verde w-full py-4 mt-6">Reintentar</button>}
      <Link href="/entrar" className="btn-linea w-full py-4 mt-3 block">Entrar con mi email</Link>
      <a href={linkCamila("", "No puedo entrar en la app.")} target="_blank" rel="noreferrer" className="btn-wa w-full py-4 mt-3 block">💬 Hablar con Camila</a>
    </div>
  );
}
