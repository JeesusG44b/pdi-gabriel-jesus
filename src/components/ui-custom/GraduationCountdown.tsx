import { formatarDataBR, mesesEDiasEntre, parseLocalDate, useAgora } from "@/lib/datas";

// Tempo até a formatura em meses e dias. Se a data não estiver confirmada, mostra "data prevista".
export function GraduationCountdown({ date, confirmed }: { date: string; confirmed: boolean }) {
  const agora = useAgora();
  const alvo = parseLocalDate(date);
  // Antes de montar (agora null) não há contagem; a data abaixo é igual nos dois lados.
  const contagem = agora ? mesesEDiasEntre(agora, alvo) : null;
  const passou = agora !== null && agora >= alvo;
  const meses = contagem?.meses ?? 0;
  const dias = contagem?.dias ?? 0;

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Até a formatura</p>
      {passou ? (
        <p className="mt-2 text-sm">A data da formatura já passou.</p>
      ) : contagem === null ? (
        <p className="mt-1 text-sm">&nbsp;</p>
      ) : (
        <p className="mt-1 text-sm">
          <span className="font-mono text-2xl font-medium tabular-nums text-primary-deep">{meses}</span>{" "}
          {meses === 1 ? "mês" : "meses"} e{" "}
          <span className="font-mono text-2xl font-medium tabular-nums text-primary-deep">{dias}</span>{" "}
          {dias === 1 ? "dia" : "dias"}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {confirmed ? "Formatura em " : "Data prevista: "}
        {formatarDataBR(alvo)}
      </p>
    </div>
  );
}
