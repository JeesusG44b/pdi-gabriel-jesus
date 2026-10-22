import { useEffect, useRef, useState } from "react";
import type { Ciclo } from "@/types";
import { profile } from "@/data/profile";
import { GradientCard } from "@/components/ui-custom/GradientCard";
import { CycleCountdown } from "@/components/ui-custom/CycleCountdown";
import { GraduationCountdown } from "@/components/ui-custom/GraduationCountdown";
import { Github, Linkedin, Building2, Briefcase, GraduationCap, CalendarDays } from "lucide-react";

// Iniciais do nome: "Gabriel Jesus" vira "GJ".
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.charAt(0) ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.charAt(0) ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

// Foto de perfil. Se não carregar (ex.: public/images/profile.jpg ainda não existe), mostra as iniciais.
function Avatar() {
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Erro que acontece antes da hidratação não dispara onError no React: checa no mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgFailed(true);
  }, []);

  if (!profile.profileImage || imgFailed) {
    return (
      <div
        className="h-12 w-12 rounded-2xl gradient-primary text-white flex items-center justify-center font-display text-lg"
        role="img"
        aria-label={`Iniciais de ${profile.name}`}
      >
        {iniciais(profile.name)}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={profile.profileImage}
      alt={`Foto de ${profile.name}`}
      onError={() => setImgFailed(true)}
      className="h-12 w-12 rounded-2xl object-cover shadow-soft"
    />
  );
}

export function HeroSection({ ciclos }: { ciclos: Ciclo[] }) {
  const cicloAtual = ciclos.find((c) => c.status === "atual") ?? null;

  return (
    <section className="relative pt-12 pb-10">
      <div className="absolute inset-0 -z-10 gradient-soft opacity-60 rounded-3xl blur-3xl" />
      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        <div className="lg:col-span-3 animate-fade-in">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary-deep mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
            Plano de Desenvolvimento Individual
          </span>
          <h1 className="text-4xl md:text-6xl leading-tight">
            Olá, eu sou{" "}
            <span className="bg-clip-text text-transparent gradient-primary">{profile.name}</span>
          </h1>
          <p className="mt-3 text-lg md:text-xl font-medium text-foreground">{profile.title}</p>
          <p className="mt-2 text-muted-foreground">{profile.subtitle}</p>
          <p className="mt-6 max-w-xl text-foreground/80">{profile.bio}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-white font-medium shadow-soft hover-scale"
            >
              <Github className="h-4 w-4" aria-hidden="true" /> GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border font-medium hover:border-primary hover-scale"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
            </a>
          </div>
        </div>

        <div className="lg:col-span-2 animate-fade-in">
          <GradientCard glow>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar />
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.title}</p>
                </div>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-primary-deep" aria-hidden="true" />
                  <dt className="sr-only">Empresa</dt>
                  <dd>{profile.company}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 mt-0.5 shrink-0 text-primary-deep" aria-hidden="true" />
                  <dt className="sr-only">Área</dt>
                  <dd>{profile.area}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 mt-0.5 shrink-0 text-primary-deep" aria-hidden="true" />
                  <dt className="sr-only">Curso</dt>
                  <dd>{profile.course}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-primary-deep" aria-hidden="true" />
                  <dt className="sr-only">Ciclo atual</dt>
                  <dd>{cicloAtual ? cicloAtual.nome : "Sem ciclo ativo"}</dd>
                </div>
              </dl>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <CycleCountdown ciclo={cicloAtual} />
                <GraduationCountdown date={profile.graduationDate} confirmed={profile.graduationDateConfirmed} />
              </div>

              <p className="text-xs text-muted-foreground pt-1">Última atualização: {profile.lastUpdate}</p>
            </div>
          </GradientCard>
        </div>
      </div>
    </section>
  );
}
