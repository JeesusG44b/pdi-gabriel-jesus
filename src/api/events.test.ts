import { describe, expect, it } from "vitest";
import { eventSchema, rowToEvent } from "./events";

describe("eventSchema", () => {
  it("aceita um evento válido", () => {
    const result = eventSchema.safeParse({
      id: "evento-1",
      title: "Meetup Tech",
      description: "Descrição do evento",
      date: "Janeiro 2026",
      location: "SP",
      type: "Meetup",
      image: "/images/foo.jpg",
      highlights: ["AWS", "Networking"],
      link: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("aplica defaults para campos opcionais", () => {
    const result = eventSchema.parse({
      id: "evento-2",
      title: "Workshop",
      date: "Fevereiro 2026",
      location: "RJ",
      type: "Workshop",
    });
    expect(result.description).toBe("");
    expect(result.image).toBe("");
    expect(result.highlights).toEqual([]);
  });

  it("rejeita título vazio", () => {
    const result = eventSchema.safeParse({
      id: "evento-3",
      title: "   ",
      date: "Março 2026",
      location: "SP",
      type: "Curso",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita type fora do enum", () => {
    const result = eventSchema.safeParse({
      id: "evento-4",
      title: "Evento X",
      date: "Abril 2026",
      location: "SP",
      type: "Festa",
    });
    expect(result.success).toBe(false);
  });
});

describe("rowToEvent", () => {
  it("faz parse do highlights (JSON string) e trata link nulo", () => {
    const event = rowToEvent({
      id: "evento-1",
      title: "Meetup Tech",
      description: "desc",
      date: "Janeiro 2026",
      location: "SP",
      type: "Meetup",
      image: "/images/foo.jpg",
      highlights: '["AWS","Networking"]',
      link: null,
      sort_order: 0,
    });
    expect(event.highlights).toEqual(["AWS", "Networking"]);
    expect(event.link).toBeUndefined();
    expect(event.type).toBe("Meetup");
  });

  it("preserva o link quando presente", () => {
    const event = rowToEvent({
      id: "evento-2",
      title: "Summit",
      description: "desc",
      date: "Fevereiro 2026",
      location: "SP",
      type: "Summit",
      image: "",
      highlights: "[]",
      link: "https://example.com",
      sort_order: 1,
    });
    expect(event.link).toBe("https://example.com");
  });
});
