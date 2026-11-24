import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { ArrowBigUp, ArrowRight, ChevronLeft, ChevronRight, Hand } from "lucide-react";
import { createCasteloInput, type CasteloHandle, type CasteloInputKey } from "@/castelo/input";
import {
  abrePergaminho,
  legendaDoAlvo,
  paginaDoLocal,
  type Alvo,
  type CasteloData,
  type LocalCastelo,
} from "@/castelo/model";
import { Pergaminho } from "./Pergaminho";

// O Phaser só entra por este import dinâmico. createClientOnlyFn tira o import do bundle
// do servidor, então o Worker não carrega a engine (SPEC 9.4, regra 2).
const loadCastelo = createClientOnlyFn(() => import("@/castelo/createGame"));

type Estado = "carregando" | "pronto" | "erro";

function legendaDoLocal(local: LocalCastelo, data: CasteloData): string {
  if (local.sala === "salao") return "Salão central. Cada porta leva à ala de uma trilha.";
  const ala = data.alas.find((a) => a.trilhaId === local.trilhaId);
  if (!ala) return `Ala ${local.nome}.`;
  return `Ala ${ala.nome}: ${ala.metasConcluidas} de ${ala.metas.length} metas concluídas.`;
}

export function CasteloGame({ data }: { data: CasteloData }) {
  const holder = useRef<HTMLDivElement>(null);
  const input = useRef(createCasteloInput());
  const handle = useRef<CasteloHandle | null>(null);
  const dataRef = useRef(data);
  const abertoRef = useRef(false);
  const [estado, setEstado] = useState<Estado>("carregando");
  const [foco, setFoco] = useState<Alvo | null>(null);
  const [aberto, setAberto] = useState<Alvo | null>(null);
  const [local, setLocal] = useState<LocalCastelo>({ sala: "salao" });

  useEffect(() => {
    let cancelado = false;
    loadCastelo()
      .then(({ createGame }) => {
        if (cancelado || !holder.current) return;
        handle.current = createGame(holder.current, {
          input: input.current,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          data: dataRef.current,
          onFoco: setFoco,
          onAbrir: setAberto,
          onLocal: setLocal,
        });
        setEstado("pronto");
      })
      .catch((erro) => {
        console.error(erro);
        if (!cancelado) setEstado("erro");
      });
    return () => {
      cancelado = true;
      handle.current?.destruir();
      handle.current = null;
    };
  }, []);

  // O jogo só fica com o teclado quando o foco está nele ou em lugar nenhum. Com o foco em
  // um link, botão ou no pergaminho, Enter, espaço e setas voltam a valer para a página.
  const sincronizarTeclado = useCallback(() => {
    const el = document.activeElement;
    const focoNoJogo = !el || el === document.body || !!holder.current?.contains(el);
    handle.current?.teclado(focoNoJogo && !abertoRef.current);
  }, []);

  useEffect(() => {
    const depois = () => window.setTimeout(sincronizarTeclado, 0);
    document.addEventListener("focusin", sincronizarTeclado);
    document.addEventListener("focusout", depois);
    // Na fase de captura, antes do Phaser ver a tecla: garante o estado certo mesmo que
    // o navegador não tenha disparado os eventos de foco (aba em segundo plano, por exemplo).
    window.addEventListener("keydown", sincronizarTeclado, true);
    return () => {
      document.removeEventListener("focusin", sincronizarTeclado);
      document.removeEventListener("focusout", depois);
      window.removeEventListener("keydown", sincronizarTeclado, true);
    };
  }, [sincronizarTeclado]);

  // Pergaminho aberto: o jogo para e solta o teclado; os botões de toque são zerados.
  useEffect(() => {
    abertoRef.current = aberto !== null;
    if (aberto) Object.assign(input.current, createCasteloInput());
    handle.current?.pausar(aberto !== null);
    sincronizarTeclado();
  }, [aberto, sincronizarTeclado, estado]);

  const fechar = useCallback(() => setAberto(null), []);

  const botao = (tecla: CasteloInputKey, rotulo: string, icone: React.ReactNode) => {
    const soltar = () => {
      input.current[tecla] = false;
    };
    return (
      <button
        type="button"
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
        className="h-16 w-[4.5rem] touch-none select-none rounded-2xl border border-border bg-card text-foreground shadow-soft flex flex-col items-center justify-center gap-0.5 active:bg-secondary"
      >
        {icone}
        <span className="text-xs font-medium">{rotulo}</span>
      </button>
    );
  };

  const pagina = paginaDoLocal(local);
  const acao = foco ? (abrePergaminho(foco) ? "ler" : "entrar") : null;

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-[#272638]">
        <div
          ref={holder}
          role="application"
          tabIndex={0}
          aria-label="Castelo. Use as setas para andar, espaço para pular e E para interagir."
          className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        />
        {estado !== "pronto" && (
          <p
            role="status"
            className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-200"
          >
            {estado === "carregando"
              ? "Abrindo os portões do castelo..."
              : "Não foi possível carregar o castelo neste navegador. O conteúdo completo está nas páginas do menu."}
          </p>
        )}
      </div>

      {/* Legenda: diz por escrito onde o personagem está e o que há à frente. Altura fixa, sem pulo de layout. */}
      <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {foco ? (
            <>
              <span className="font-medium text-foreground">{legendaDoAlvo(foco)}.</span>{" "}
              <span className="pointer-coarse:hidden">
                Aperte <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs">E</kbd> para{" "}
                {acao}.
              </span>
            </>
          ) : (
            legendaDoLocal(local, data)
          )}
        </p>
        <Link
          to={pagina.to}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:bg-secondary"
        >
          Ver como página: {pagina.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Controles de toque: só em telas de toque (SPEC 9.2). */}
      <div className="mt-3 hidden items-center justify-between pointer-coarse:flex">
        <div className="flex gap-2">
          {botao("left", "Esquerda", <ChevronLeft className="h-6 w-6" aria-hidden="true" />)}
          {botao("right", "Direita", <ChevronRight className="h-6 w-6" aria-hidden="true" />)}
        </div>
        <div className="flex gap-2">
          {botao("interact", "Interagir", <Hand className="h-6 w-6" aria-hidden="true" />)}
          {botao("jump", "Pular", <ArrowBigUp className="h-6 w-6" aria-hidden="true" />)}
        </div>
      </div>

      <Pergaminho alvo={aberto} data={data} onFechar={fechar} devolverFoco={holder} />
    </div>
  );
}
