import { profile } from "@/data/profile";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {profile.name}. PDI pessoal, última atualização: {profile.lastUpdate}.
        </p>
        <div className="flex items-center gap-3">
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-primary-deep transition" aria-label="GitHub"><Github className="h-5 w-5" /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary-deep transition" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
        </div>
      </div>
    </footer>
  );
}
