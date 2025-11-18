// src/config/api.ts

const ENV = import.meta.env;

/**
 * Determina a base URL da API automaticamente:
 * - Em dev (Vite): usa proxy ou VITE_API_URL
 * - Em produção (build): usa mesma origem (window.location.origin)
 */
function getApiBaseUrl(): string {
  // Se VITE_API_URL está definido, use (dev)
  if (ENV.VITE_API_URL) {
    return ENV.VITE_API_URL;
  }

  // Em produção, FastAPI serve frontend + API na mesma porta
  // Então podemos usar a mesma origem (https://seunome.pythonanywhere.com)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback (não deveria acontecer)
  return 'http://localhost:8001';
}

export const API_CONFIG = {
  // Base URL da API (autodetectada)
  BASE_URL: getApiBaseUrl(),

  // Endpoints
  ENDPOINTS: {
    ALIMENTOS: '/api/alimentos',
    ALIMENTOS_BY_ID: (id: number) => `/api/alimentos/${id}`,
    CATEGORIAS: '/api/categorias',
    REFEICOES: '/api/refeicoes',
    REFEICOES_BY_ID: (id: number) => `/api/refeicoes/${id}`,
    HISTORICO: '/api/historico',
    HISTORICO_BY_ID: (id: number) => `/api/historico/${id}`,
    AGENT: '/api/agent',
  },

  // Timeouts
  TIMEOUT: 30000, // 30 segundos

  // Headers padrão
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * Helper para construir URL completa
 */
export function buildUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Helper para fazer fetch com timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - verifique se o backend está rodando');
    }
    throw error;
  }
}
