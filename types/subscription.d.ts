// Subscription Types

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  logoUrl: string | null;
  amount: number;
  dueDate: Date;
  recurring: boolean;
  nextDueDate: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  dueDate: Date | string;
  recurring?: boolean;
  nextDueDate?: Date | string;
  active?: boolean;
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  id: string;
  logoUrl?: string | null;
}

export interface DetectLogoRequest {
  name: string;
}

export interface DetectLogoResponse {
  ok: boolean;
  logoUrl: string;
  source?: "custom" | "clearbit" | "fallback";
  error?: string;
}

export interface SubscriptionWithStatus extends Subscription {
  daysUntilDue: number;
  status: "active" | "due_soon" | "overdue" | "inactive";
}

// Logo mapping for popular services
export interface LogoMapping {
  [key: string]: string;
}

export const KNOWN_LOGOS: LogoMapping = {
  netflix: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/netflix.svg",
  spotify: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/spotify.svg",
  youtube: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/youtube.svg",
  amazon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazon.svg",
  disney: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/disney.svg",
  apple: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/apple.svg",
  google: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/google.svg",
  microsoft: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/microsoft.svg",
  dropbox: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dropbox.svg",
  github: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg",
  linkedin: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg",
  twitter: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twitter.svg",
  instagram: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg",
  facebook: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg",
  whatsapp: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg",
  telegram: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/telegram.svg",
  slack: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/slack.svg",
  zoom: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/zoom.svg",
  adobe: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/adobe.svg",
  canva: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/canva.svg",
};

