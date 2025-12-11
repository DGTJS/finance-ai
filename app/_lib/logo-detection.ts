import type { DetectLogoResponse, LogoMapping } from "@/types/subscription";

// Mapeamento de logos conhecidos usando Simple Icons CDN (gratuito)
const KNOWN_LOGOS: LogoMapping = {
  netflix: "https://cdn.simpleicons.org/netflix/E50914",
  spotify: "https://cdn.simpleicons.org/spotify/1DB954",
  youtube: "https://cdn.simpleicons.org/youtube/FF0000",
  "youtube premium": "https://cdn.simpleicons.org/youtube/FF0000",
  amazon: "https://cdn.simpleicons.org/amazon/FF9900",
  "amazon prime": "https://cdn.simpleicons.org/amazonprime/00A8E1",
  disney: "https://cdn.simpleicons.org/disney/113CCF",
  "disney plus": "https://cdn.simpleicons.org/disneyplus/113CCF",
  "disney+": "https://cdn.simpleicons.org/disneyplus/113CCF",
  apple: "https://cdn.simpleicons.org/apple/000000",
  "apple music": "https://cdn.simpleicons.org/applemusic/FA243C",
  "apple tv": "https://cdn.simpleicons.org/appletv/000000",
  "apple tv+": "https://cdn.simpleicons.org/appletv/000000",
  google: "https://cdn.simpleicons.org/google/4285F4",
  "google one": "https://cdn.simpleicons.org/google/4285F4",
  "google drive": "https://cdn.simpleicons.org/googledrive/4285F4",
  microsoft: "https://cdn.simpleicons.org/microsoft/5E5E5E",
  "microsoft 365": "https://cdn.simpleicons.org/microsoft365/D83B01",
  office365: "https://cdn.simpleicons.org/microsoft365/D83B01",
  dropbox: "https://cdn.simpleicons.org/dropbox/0061FF",
  github: "https://cdn.simpleicons.org/github/181717",
  "github copilot": "https://cdn.simpleicons.org/github/181717",
  linkedin: "https://cdn.simpleicons.org/linkedin/0A66C2",
  "linkedin premium": "https://cdn.simpleicons.org/linkedin/0A66C2",
  twitter: "https://cdn.simpleicons.org/x/000000",
  x: "https://cdn.simpleicons.org/x/000000",
  instagram: "https://cdn.simpleicons.org/instagram/E4405F",
  facebook: "https://cdn.simpleicons.org/facebook/0866FF",
  whatsapp: "https://cdn.simpleicons.org/whatsapp/25D366",
  telegram: "https://cdn.simpleicons.org/telegram/26A5E4",
  slack: "https://cdn.simpleicons.org/slack/4A154B",
  zoom: "https://cdn.simpleicons.org/zoom/0B5CFF",
  adobe: "https://cdn.simpleicons.org/adobe/FF0000",
  "adobe creative cloud":
    "https://cdn.simpleicons.org/adobecreativecloud/DA1F26",
  canva: "https://cdn.simpleicons.org/canva/00C4CC",
  notion: "https://cdn.simpleicons.org/notion/000000",
  trello: "https://cdn.simpleicons.org/trello/0052CC",
  asana: "https://cdn.simpleicons.org/asana/F06A6A",
  figma: "https://cdn.simpleicons.org/figma/F24E1E",
  "hbo max": "https://cdn.simpleicons.org/hbomax/7851A9",
  hbo: "https://cdn.simpleicons.org/hbo/000000",
  "paramount+": "https://cdn.simpleicons.org/paramountplus/0064FF",
  paramount: "https://cdn.simpleicons.org/paramount/0064FF",
  "star+": "https://cdn.simpleicons.org/starplus/FFD900",
  globoplay: "https://cdn.simpleicons.org/globo/FF0000",
  deezer: "https://cdn.simpleicons.org/deezer/FF0000",
  tidal: "https://cdn.simpleicons.org/tidal/000000",
  soundcloud: "https://cdn.simpleicons.org/soundcloud/FF3300",
  audible: "https://cdn.simpleicons.org/audible/FF9900",
  kindle: "https://cdn.simpleicons.org/kindle/FF9900",
  icloud: "https://cdn.simpleicons.org/icloud/3693F3",
  onedrive: "https://cdn.simpleicons.org/microsoftonedrive/0078D4",
  mega: "https://cdn.simpleicons.org/mega/D9272E",
  pcloud: "https://cdn.simpleicons.org/pcloud/00D632",
};

/**
 * Normaliza o nome para comparação
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, " "); // Remove espaços extras
}

/**
 * Tenta encontrar um match no mapeamento conhecido
 */
function findKnownLogo(name: string): string | null {
  const normalized = normalizeName(name);

  // Busca exata
  if (KNOWN_LOGOS[normalized]) {
    return KNOWN_LOGOS[normalized];
  }

  // Busca parcial (contém)
  for (const [key, value] of Object.entries(KNOWN_LOGOS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * Tenta buscar logo via Clearbit (domínio público)
 */
async function tryFetchClearbitLogo(name: string): Promise<string | null> {
  try {
    // Tentar extrair domínio do nome
    const normalized = normalizeName(name);
    const possibleDomain = `${normalized.replace(/\s+/g, "")}.com`;

    const url = `https://logo.clearbit.com/${possibleDomain}`;

    // Verificar se a URL existe (sem fazer download)
    const response = await fetch(url, { method: "HEAD" });

    if (response.ok) {
      return url;
    }
  } catch {
    // Ignorar erros silenciosamente
    console.log("Clearbit não encontrou logo para:", name);
  }

  return null;
}

/**
 * Função principal de detecção de logo
 */
export async function detectLogo(name: string): Promise<DetectLogoResponse> {
  if (!name || name.trim().length === 0) {
    return {
      ok: false,
      logoUrl: "/logos/default.svg",
      source: "fallback",
      error: "Nome vazio",
    };
  }

  // 1. Tentar logo conhecido
  const knownLogo = findKnownLogo(name);
  if (knownLogo) {
    return {
      ok: true,
      logoUrl: knownLogo,
      source: "custom",
    };
  }

  // 2. Tentar Clearbit (apenas em produção, para não abusar)
  if (process.env.NODE_ENV === "production") {
    const clearbitLogo = await tryFetchClearbitLogo(name);
    if (clearbitLogo) {
      return {
        ok: true,
        logoUrl: clearbitLogo,
        source: "clearbit",
      };
    }
  }

  // 3. Fallback para ícone genérico
  return {
    ok: true,
    logoUrl: "/logos/default.svg",
    source: "fallback",
  };
}

/**
 * Exportar a lista de logos conhecidos para referência
 */
export function getKnownServices(): string[] {
  return Object.keys(KNOWN_LOGOS).sort();
}
