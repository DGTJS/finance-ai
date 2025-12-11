import { describe, it, expect } from "vitest";
import { detectLogo, getKnownServices } from "../app/_lib/logo-detection";

describe("Logo Detection", () => {
  it("deve detectar logo do Netflix", async () => {
    const result = await detectLogo("Netflix");
    expect(result.ok).toBe(true);
    expect(result.logoUrl).toContain("netflix");
    expect(result.source).toBe("custom");
  });

  it("deve detectar logo do Spotify", async () => {
    const result = await detectLogo("Spotify");
    expect(result.ok).toBe(true);
    expect(result.logoUrl).toContain("spotify");
    expect(result.source).toBe("custom");
  });

  it("deve detectar logo com nome variado (case insensitive)", async () => {
    const result = await detectLogo("NETFLIX BRASIL");
    expect(result.ok).toBe(true);
    expect(result.logoUrl).toContain("netflix");
  });

  it("deve retornar fallback para serviço desconhecido", async () => {
    const result = await detectLogo("Serviço Aleatório Que Não Existe");
    expect(result.ok).toBe(true);
    expect(result.logoUrl).toBe("/logos/default.svg");
    expect(result.source).toBe("fallback");
  });

  it("deve retornar fallback para nome vazio", async () => {
    const result = await detectLogo("");
    expect(result.ok).toBe(false);
    expect(result.logoUrl).toBe("/logos/default.svg");
  });

  it("deve retornar lista de serviços conhecidos", () => {
    const services = getKnownServices();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
    expect(services).toContain("netflix");
    expect(services).toContain("spotify");
  });
});

