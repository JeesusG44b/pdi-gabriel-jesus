import { useState } from "react";
import type { Disciplina, Fase, Status, Trilha, Visibilidade } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mesma regra do zod em src/api/disciplinas.ts (MOTIVO_MIN e MOTIVO_MSG).
const MOTIVO_MIN = 3;
const MOTIVO_MSG = "Motivo do arquivamento precisa ter pelo menos 3 caracteres";

export interface DisciplinaPayload {
  id: string;
  nome: string;
  semestre: number;
  fase: Fase;
  trilhaId: string | null;
  ementaResumo: string;
  ementaFonte: "generica" | "plano-de-ensino";
  aplicacaoTrabalho: string;
  recursoTitulo: string;
  recursoUrl: string | null;
  entregavel: string;
  dominio: Status;
  arquivada: boolean;
  motivoArquivamento?: string;
  visibilidade: Visibilidade;
  notaAdmin: string | null;
}

interface Props {
  isOpen: boolean;
  disciplina: Disciplina;
  trilhas: Trilha[];
  onClose: () => void;
  onSave: (payload: DisciplinaPayload) => Promise<boolean>;
}

const FASES: { value: Fase; label: string }[] = [
  { value: "cursada", label: "Cursada" },
  { value: "cursando", label: "Cursando" },
  { value: "futura", label: "Futura" },
];
const DOMINIOS: { value: Status; label: string }[] = [
  { value: "domino", label: "Domino" },
  { value: "estudando", label: "Estudando" },
  { value: "preciso-estudar", label: "Preciso estudar" },
];
const SEM_TRILHA = "nenhuma";

function urlValida(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function DisciplinaModal({ isOpen, disciplina, trilhas, onClose, onSave }: Props) {
  const [form, setForm] = useState<Disciplina>(disciplina);
  const [motivo, setMotivo] = useState(disciplina.motivoArquivamento ?? "");
  const [notaTexto, setNotaTexto] = useState(disciplina.notaAdmin ?? "");
  const [semestreTexto, setSemestreTexto] = useState(String(disciplina.semestre));
  const [recursoUrlTexto, setRecursoUrlTexto] = useState(disciplina.recursoUrl ?? "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const set = <K extends keyof Disciplina>(campo: K, valor: Disciplina[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const validar = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    const semestre = Number(semestreTexto);
    if (!Number.isInteger(semestre) || semestre < 1 || semestre > 10) {
      e.semestre = "Semestre deve ser um número de 1 a 10";
    }
    if (recursoUrlTexto.trim() && !urlValida(recursoUrlTexto.trim())) {
      e.recursoUrl = "Informe uma URL válida, começando com https://";
    }
    if (form.arquivada && motivo.trim().length < MOTIVO_MIN) e.motivo = MOTIVO_MSG;
    return e;
  };

  const handleSave = async () => {
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;
    const arquivada = form.arquivada;
    const payload: DisciplinaPayload = {
      id: form.id,
      nome: form.nome.trim(),
      semestre: Number(semestreTexto),
      fase: form.fase,
      trilhaId: form.trilhaId ?? null,
      ementaResumo: form.ementaResumo.trim(),
      ementaFonte: form.ementaFonte,
      aplicacaoTrabalho: form.aplicacaoTrabalho.trim(),
      recursoTitulo: form.recursoTitulo.trim(),
      recursoUrl: recursoUrlTexto.trim() || null,
      entregavel: form.entregavel.trim(),
      dominio: form.dominio,
      arquivada,
      ...(arquivada ? { motivoArquivamento: motivo.trim() } : {}),
      visibilidade: form.visibilidade,
      notaAdmin: notaTexto.trim() || null,
    };
    setSalvando(true);
    const ok = await onSave(payload);
    setSalvando(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Editar disciplina</DialogTitle>
          <DialogDescription>
            Campos marcados como visíveis só no admin não aparecem no site público.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            void handleSave();
          }}
        >
          <Campo id="d-nome" label="Nome" erro={erros.nome}>
            <Input id="d-nome" value={form.nome} onChange={(ev) => set("nome", ev.target.value)} aria-invalid={!!erros.nome} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo id="d-semestre" label="Semestre" erro={erros.semestre}>
              <Input
                id="d-semestre"
                type="number"
                min={1}
                max={10}
                value={semestreTexto}
                onChange={(ev) => setSemestreTexto(ev.target.value)}
                aria-invalid={!!erros.semestre}
              />
            </Campo>
            <Campo id="d-fase" label="Fase">
              <Select value={form.fase} onValueChange={(v) => set("fase", v as Fase)}>
                <SelectTrigger id="d-fase"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FASES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo id="d-dominio" label="Domínio">
              <Select value={form.dominio} onValueChange={(v) => set("dominio", v as Status)}>
                <SelectTrigger id="d-dominio"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOMINIOS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="d-trilha" label="Trilha">
              <Select
                value={form.trilhaId ?? SEM_TRILHA}
                onValueChange={(v) => set("trilhaId", v === SEM_TRILHA ? null : v)}
              >
                <SelectTrigger id="d-trilha"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_TRILHA}>Sem trilha</SelectItem>
                  {trilhas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo id="d-visibilidade" label="Visibilidade">
              <Select value={form.visibilidade} onValueChange={(v) => set("visibilidade", v as Visibilidade)}>
                <SelectTrigger id="d-visibilidade"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="publica">Pública</SelectItem>
                  <SelectItem value="admin">Só admin</SelectItem>
                </SelectContent>
              </Select>
            </Campo>
          </div>

          <Campo id="d-ementa" label="Ementa resumida">
            <Textarea id="d-ementa" rows={2} value={form.ementaResumo} onChange={(ev) => set("ementaResumo", ev.target.value)} />
          </Campo>
          <Campo id="d-trabalho" label="No trabalho">
            <Textarea id="d-trabalho" rows={2} value={form.aplicacaoTrabalho} onChange={(ev) => set("aplicacaoTrabalho", ev.target.value)} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="d-recurso-titulo" label="Recurso (título)">
              <Input id="d-recurso-titulo" value={form.recursoTitulo} onChange={(ev) => set("recursoTitulo", ev.target.value)} />
            </Campo>
            <Campo id="d-recurso-url" label="Recurso (URL)" erro={erros.recursoUrl}>
              <Input
                id="d-recurso-url"
                type="url"
                inputMode="url"
                placeholder="https://"
                value={recursoUrlTexto}
                onChange={(ev) => setRecursoUrlTexto(ev.target.value)}
                aria-invalid={!!erros.recursoUrl}
              />
            </Campo>
          </div>

          <Campo id="d-entregavel" label="Entregável">
            <Input id="d-entregavel" value={form.entregavel} onChange={(ev) => set("entregavel", ev.target.value)} />
          </Campo>

          <Campo id="d-nota" label="Nota do admin (não aparece no público)">
            <Textarea id="d-nota" rows={2} value={notaTexto} onChange={(ev) => setNotaTexto(ev.target.value)} />
          </Campo>

          <fieldset className="space-y-3 rounded-2xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold">Arquivamento</legend>
            <div className="flex items-start gap-3">
              <Checkbox
                id="d-arquivar"
                checked={form.arquivada}
                onCheckedChange={(v) => set("arquivada", v === true)}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="d-arquivar">Arquivar disciplina</Label>
                <p className="text-xs text-muted-foreground">
                  Arquivada, ela some do site público e fica em Arquivadas, onde pode ser restaurada.
                </p>
              </div>
            </div>
            {form.arquivada && (
              <Campo id="d-motivo" label="Motivo do arquivamento (obrigatório)" erro={erros.motivo}>
                <Textarea
                  id="d-motivo"
                  rows={2}
                  value={motivo}
                  onChange={(ev) => setMotivo(ev.target.value)}
                  aria-invalid={!!erros.motivo}
                />
              </Campo>
            )}
          </fieldset>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando} className="gradient-primary text-white">
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  id,
  label,
  erro,
  children,
}: {
  id: string;
  label: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {erro && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
