import { useEffect, useRef, useState } from "react";
import { createClientOnlyFn } from "@tanstack/react-start";
import { ArrowBigUp, ChevronLeft, ChevronRight, Hand } from "lucide-react";
import { createCasteloInput, type CasteloInputKey } from "@/castelo/input";

// O Phaser só entra por este import dinâmico. createClientOnlyFn tira o import do bundle
// do servidor, então o Worker não carrega a engine (SPEC 9.4, regra 2).
const loadCastelo = createClientOnlyFn(() => import("@/castelo/createGame"));

type Estado = "carregando" | "pronto" | "erro";

export function CasteloGame() {
  const holder = useRef<HTMLDivElement>(null);
  const input = useRef(createCasteloInput());
  const [estado, setEstado] = useState<Estado>("carregando");

  useEffect(() => {
    let cancelado = false;
    let destruir: (() => void) | undefined;
    loadCastelo()
      .then(({ createGame }) => {
        if (cancelado || !holder.current) return;
        destruir = createGame(holder.current, {
          input: input.current,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
        setEstado("pronto");
      })
      .catch((erro) => {
        console.error(erro);
        if (!cancelado) setEstado("erro");
      });
    return () => {
      cancelado = true;
      destruir?.();
    };
  }, []);

  const botao = (tecla: CasteloInputKey, rotulo: string, icone: React.ReactNode) => {
    const soltar = () => {
      input.current[tecla] = false;
    };
    return (
      <button
        type="button"
        aria-label={rotulo}
        onPointerDown={(e) => {
          input.current[tecla] = true;
          // A captura mantém o botão pressionado se o dedo escorregar para fora.
          // Pode falhar se o ponteiro já não estiver ativo; o toque vale do mesmo jeito.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* sem captura */
          }
        }}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onLostPointerCapture={soltar}
        onContextMenu={(e) => e.preventDefault()}
        className="h-14 w-14 touch-none select-none rounded-2xl border border-border bg-card text-foreground shadow-soft flex items-center justify-center active:bg-secondary"
      >
        {icone}
      </button>
    );
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-[#0d0b14]">
        <div
          ref={holder}
          role="application"
          aria-label="Castelo: sala de teste. Use as setas para andar, espaço para pular e E para interagir."
          className="absolute inset-0"
        />
        {estado !== "pronto" && (
          <p
            role="status"
            className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-300"
          >
            {estado === "carregando"
              ? "Abrindo os portões do castelo..."
              : "Não foi possível carregar o castelo neste navegador. O conteúdo completo está nas páginas do menu."}
          </p>
        )}
      </div>

      {/* Controles de toque: só em telas de toque (SPEC 9.2). */}
      <div className="mt-3 hidden items-center justify-between pointer-coarse:flex">
        <div className="flex gap-2">
          {botao("left", "Andar para a esquerda", <ChevronLeft className="h-6 w-6" />)}
          {botao("right", "Andar para a direita", <ChevronRight className="h-6 w-6" />)}
        </div>
        <div className="flex gap-2">
          {botao("interact", "Interagir", <Hand className="h-6 w-6" />)}
          {botao("jump", "Pular", <ArrowBigUp className="h-6 w-6" />)}
        </div>
      </div>
    </div>
  );
}
