import type { Ciclo } from "@/types";
import { diasEntre, formatarDataBR, parseLocalDate, useAgora } from "@/lib/datas";

// Lê o ciclo com status 'atual' (quem chama escolhe o ciclo). Atualiza a cada 60 s.
export function CycleCountdown({ ciclo }: { ciclo: Ciclo | null }) {
  const agora = useAgora();

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Ciclo atual</p>
      {!ciclo ? (
        <p className="mt-2 text-sm text-muted-foreground">Nenhum ciclo ativo no momento.</p>
      ) : (
        <CicloDetalhe ciclo={ciclo} agora={agora} />
      )}
    </div>
  );
}

function CicloDetalhe({ ciclo, agora }: { ciclo: Ciclo; agora: Date | null }) {
  const inicio = parseLocalDate(ciclo.inicio);
  const fim = parseLocalDate(ciclo.fim);
  // Antes de montar (agora null) a contagem fica vazia; nome e datas são iguais nos dois lados.
  const restantes = agora ? diasEntre(agora, fim) : null;

  return (
    <>
      <p className="mt-1 font-semibold">{ciclo.nome}</p>
      <p className="text-xs text-muted-foreground">
        {formatarDataBR(inicio)} a {formatarDataBR(fim)}
      </p>
      <p className="mt-3 text-sm">
        {restantes === null ? (
          ""
        ) : restantes > 0 ? (
          <>
            faltam{" "}
            <span className="font-mono text-2xl font-medium tabular-nums text-primary-deep">
              {restantes}
            </span>{" "}
            {restantes === 1 ? "dia" : "dias"}
          </>
        ) : restantes === 0 ? (
          "Último dia do ciclo"
        ) : (
          "Ciclo encerrado"
        )}
      </p>
    </>
  );
}
