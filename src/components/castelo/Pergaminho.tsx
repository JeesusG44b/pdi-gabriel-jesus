import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { profile } from "@/data/profile";
import { formatarDataBR, parseLocalDate } from "@/lib/datas";
import {
  ROTULO_DOMINIO,
  ROTULO_FASE,
  type Alvo,
  type CasteloData,
  type MetaCastelo,
  type TomoCastelo,
} from "@/castelo/model";

interface Props {
  alvo: Alvo | null;
  data: CasteloData;
  onFechar: () => void;
  /** Recebe o foco quando o painel fecha: o jogo, que foi quem abriu. */
  devolverFoco: React.RefObject<HTMLElement | null>;
}

// Painel lateral que abre quando o personagem aciona um objeto (SPEC 9.2).
// É leitura rápida, então entra como painel lateral e mantém o jogo à vista.
// O Sheet (Radix Dialog) prende o foco, fecha com Esc e devolve o foco ao fechar (SPEC 9.4, regra 6).
export function Pergaminho({ alvo, data, onFechar, devolverFoco }: Props) {
  return (
    <Sheet open={alvo !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto pt-14 sm:max-w-md motion-reduce:animate-none! motion-reduce:transition-none!"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          devolverFoco.current?.focus();
        }}
      >
        {alvo && <Conteudo alvo={alvo} data={data} />}
      </SheetContent>
    </Sheet>
  );
}

function Conteudo({ alvo, data }: { alvo: Alvo; data: CasteloData }) {
  switch (alvo.tipo) {
    case "meta":
      return <Meta meta={alvo.meta} />;
    case "estandarte":
      return (
        <>
          <Cabecalho rotulo="Tecnologia" titulo={alvo.estandarte.nome} />
          <Campos
            campos={[
              ["Domínio", ROTULO_DOMINIO[alvo.estandarte.status]],
              ["Trilha", alvo.estandarte.trilhaNome],
            ]}
          />
          <VerNaPagina to="/roadmap" label="Roadmap" />
        </>
      );
    case "estante":
      return (
        <>
          <Cabecalho
            rotulo="Disciplinas da graduação"
            titulo={`Estante de ${alvo.ala.nome}`}
            descricao={
              alvo.ala.tomos.length === 0
                ? "Nenhuma disciplina ligada a esta trilha ainda."
                : "Cada tomo é uma disciplina que apoia esta trilha."
            }
          />
          <ul className="mt-6 space-y-6">
            {alvo.ala.tomos.map((tomo) => (
              <li key={tomo.id} className="border-t border-border pt-4">
                <Tomo tomo={tomo} />
              </li>
            ))}
          </ul>
          <VerNaPagina to="/roadmap" label="Roadmap" />
        </>
      );
    case "porta":
      return (
        <>
          <Cabecalho
            rotulo="Ala em obras"
            titulo={alvo.ala.nome}
            descricao="Esta ala do castelo ainda não foi aberta. O conteúdo dela já está nas páginas do site."
          />
          <Campos
            campos={[
              ["Foco", alvo.ala.foco],
              ["Metas", `${alvo.ala.metasConcluidas} de ${alvo.ala.metas.length} concluídas`],
              ["Tecnologias", String(alvo.ala.estandartes.length)],
              ["Disciplinas", String(alvo.ala.tomos.length)],
            ]}
          />
          <VerNaPagina to="/metas" label="Metas" />
        </>
      );
    case "sobre":
      return (
        <>
          <Cabecalho rotulo={profile.title} titulo={profile.name} descricao={profile.bio} />
          {data.cicloAtual && (
            <Campos
              campos={[
                ["Ciclo atual", data.cicloAtual.nome],
                [
                  "Período",
                  `${formatarDataBR(parseLocalDate(data.cicloAtual.inicio))} a ${formatarDataBR(parseLocalDate(data.cicloAtual.fim))}`,
                ],
              ]}
            />
          )}
          <h3 className="mt-6 font-display text-base tracking-wide">Rotina semanal</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {data.alas.map((ala) => (
              <li key={ala.trilhaId} className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <span className="capitalize text-muted-foreground">{ala.diaSemana}</span>
                <span className="text-right font-medium">
                  {ala.nome}
                  <span className="ml-2 font-mono text-xs text-muted-foreground tabular-nums">
                    {String(ala.horasSemana).replace(".", ",")} h
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <VerNaPagina to="/" label="Sobre" />
        </>
      );
    case "saida":
      return null;
  }
}

function Meta({ meta }: { meta: MetaCastelo }) {
  const campos: [string, string][] = [
    ["Status", meta.status],
    ["Trilha", meta.trilhaNome],
  ];
  if (meta.cicloNome) campos.push(["Ciclo", meta.cicloNome]);
  campos.push(["Prazo", formatarDataBR(parseLocalDate(meta.prazo))], ["Prioridade", meta.prioridade]);
  if (meta.progresso !== undefined) campos.push(["Progresso", `${meta.progresso}%`]);
  return (
    <>
      <Cabecalho rotulo="Meta" titulo={meta.titulo} descricao={meta.descricao} />
      <Campos campos={campos} />
      <VerNaPagina to="/metas" label="Metas" />
    </>
  );
}

function Tomo({ tomo }: { tomo: TomoCastelo }) {
  return (
    <>
      <h3 className="font-medium">{tomo.nome}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Semestre {tomo.semestre} · {ROTULO_FASE[tomo.fase]} · {ROTULO_DOMINIO[tomo.dominio]}
      </p>
      {tomo.ementa && <p className="mt-2 text-sm text-muted-foreground">{tomo.ementa}</p>}
      <dl className="mt-2 space-y-1 text-sm">
        {tomo.aplicacao && <Linha termo="No trabalho" valor={tomo.aplicacao} />}
        {tomo.recursoTitulo && (
          <div>
            <dt className="inline font-medium">Recurso: </dt>
            <dd className="inline text-muted-foreground">
              {tomo.recursoUrl ? (
                <a
                  href={tomo.recursoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-deep underline underline-offset-2"
                >
                  {tomo.recursoTitulo}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              ) : (
                tomo.recursoTitulo
              )}
            </dd>
          </div>
        )}
        {tomo.entregavel && <Linha termo="Entregável" valor={tomo.entregavel} />}
      </dl>
    </>
  );
}

function Linha({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div>
      <dt className="inline font-medium">{termo}: </dt>
      <dd className="inline text-muted-foreground">{valor}</dd>
    </div>
  );
}

function Cabecalho({ rotulo, titulo, descricao }: { rotulo: string; titulo: string; descricao?: string }) {
  return (
    <SheetHeader className="text-left">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary-deep">{rotulo}</span>
      <SheetTitle className="font-display text-2xl font-normal tracking-wide">{titulo}</SheetTitle>
      {/* Radix exige uma descrição; quando não há texto, fica só para leitor de tela. */}
      <SheetDescription className={descricao ? undefined : "sr-only"}>{descricao ?? rotulo}</SheetDescription>
    </SheetHeader>
  );
}

function Campos({ campos }: { campos: [string, string][] }) {
  return (
    <dl className="mt-6 space-y-2 text-sm">
      {campos.map(([termo, valor]) => (
        <div key={termo} className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
          <dt className="text-muted-foreground">{termo}</dt>
          <dd className="text-right font-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function VerNaPagina({ to, label }: { to: "/" | "/metas" | "/roadmap"; label: string }) {
  return (
    <Link
      to={to}
      className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:bg-secondary"
    >
      Ver na página {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
