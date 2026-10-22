import { useRouteContext } from "@tanstack/react-router";

export function useIsAdmin(): boolean {
  const ctx = useRouteContext({ from: "__root__" }) as { isAdmin?: boolean };
  return ctx.isAdmin ?? false;
}
