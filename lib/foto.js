"use client";
// ============================================================
// Foto "antes" — lê o arquivo escolhido, corrige orientação e
// comprime para JPEG pequeno (máx ~600px, qualidade 0.72),
// retornando um dataURL leve o bastante para localStorage +
// coluna text no Supabase (fica em torno de 40–120 KB).
// ============================================================

export function comprimirFoto(file, maxLado = 600, qualidade = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) { reject(new Error("Arquivo não é uma imagem")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao abrir a imagem"));
      img.onload = () => {
        try {
          let { width: w, height: h } = img;
          const escala = Math.min(1, maxLado / Math.max(w, h));
          w = Math.round(w * escala);
          h = Math.round(h * escala);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", qualidade));
        } catch (e) { reject(e); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
