import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn } from "@/api/auth";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin · PDI Gabriel Jesus" }],
  }),
  component: Page,
});

function Page() {
  const router = useRouter();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    try {
      const result = await loginFn({ data: { password } });
      if (!result.ok) {
        toast.error("Senha incorreta");
        return;
      }
      await router.invalidate();
      toast.success("Login realizado!");
      navigate({ to: "/metas" });
    } catch {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="glass rounded-3xl border border-border p-8 w-full max-w-sm space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary text-white flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Área administrativa</h1>
            <p className="text-xs text-muted-foreground">Acesso restrito</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full gradient-primary text-white"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </section>
  );
}
