// ============================================================
// Kit de ícones SVG premium — substitui emojis nos cards.
// Uso: <Icone nome="cha" cor="#fbd38d" size={20} />
// ============================================================
export function Icone({ nome, cor = "#fbd38d", size = 20 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: cor, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (nome) {
    case "cha": // xícara com vapor
      return (
        <svg {...p}>
          <path d="M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-4z" />
          <path d="M16 11h2a2.5 2.5 0 0 1 0 5h-2" />
          <path d="M8 3c0 1.2-1 1.6-1 2.8" opacity=".7" />
          <path d="M12 3c0 1.2-1 1.6-1 2.8" opacity=".7" />
        </svg>
      );
    case "sol":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "lua":
      return (
        <svg {...p}>
          <path d="M20 13.5A8.5 8.5 0 0 1 10.5 4 8.5 8.5 0 1 0 20 13.5z" />
        </svg>
      );
    case "sino":
      return (
        <svg {...p}>
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "camera":
      return (
        <svg {...p}>
          <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
          <circle cx="12" cy="12.5" r="3.5" />
        </svg>
      );
    case "mapa": // trilha/jornada
      return (
        <svg {...p}>
          <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
          <path d="M9 4v13M15 6.5v13" opacity=".6" />
        </svg>
      );
    case "pessoas":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
          <circle cx="16.8" cy="9" r="2.4" opacity=".7" />
          <path d="M15.5 14.6c2.5.1 4.3 1.4 5 4.4" opacity=".7" />
        </svg>
      );
    case "cadeado":
      return (
        <svg {...p}>
          <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15.2" r="1.1" fill={cor} stroke="none" />
        </svg>
      );
    case "check":
      return (
        <svg {...p} strokeWidth="2.4">
          <path d="M4.5 12.5l5 5L19.5 7" />
        </svg>
      );
    case "grafico":
      return (
        <svg {...p}>
          <path d="M4 19V5" opacity=".5" />
          <path d="M4 19h16" opacity=".5" />
          <path d="M6.5 15.5l4-4.5 3 2.5 4.5-6" />
        </svg>
      );
    case "trofeu":
      return (
        <svg {...p}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
          <path d="M8 5H5.5a0 0 0 0 0 0 0c0 2.8 1 4.2 2.8 4.6M16 5h2.5c0 2.8-1 4.2-2.8 4.6" />
          <path d="M12 13v3M9 20h6M10 20l.5-4h3l.5 4" />
        </svg>
      );
    case "faisca": // energia/acelerador
      return (
        <svg {...p}>
          <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9z" />
        </svg>
      );
    default:
      return null;
  }
}

// Caixa de ícone padrão dos cards (42px, cantos arredondados, tom suave)
export function IconBox({ nome, cor = "#fbd38d", bg }) {
  const fundo = bg || `${cor}1a`;
  return (
    <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center"
      style={{ background: fundo, border: `1px solid ${cor}55` }}>
      <Icone nome={nome} cor={cor} size={21} />
    </div>
  );
}
