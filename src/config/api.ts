// src/config/api.ts

const ENV = import.meta.env;

/**
 * Determina a base URL da API automaticamente:
 * - Em dev (Vite): usa VITE_API_URL ou localhost
 * - Em produção (Render/Railway): usa mesma URL (backend serve frontend)
 */
function getApiBaseUrl(): string {
  // Se VITE_API_URL está definido, use (dev ou override)
  if (ENV.VITE_API_URL) {
    return ENV.VITE_API_URL;
  }

  // Em produção no Railway: backend e frontend no mesmo serviço
  // URL: https://oplanofitness-api-production.up.railway.app
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('railway.app') ||
       window.location.hostname.includes('up.railway.app'))) {
    // No Railway, usa a mesma URL (backend serve o frontend)
    return window.location.origin;
  }

  // Em produção no Render: frontend e backend são serviços separados
  // Frontend: https://oplanofitness-app.onrender.com
  // Backend:  https://oplanofitness-api.onrender.com
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    // Se estamos no frontend app, apontar para o backend API
    return 'https://oplanofitness-api.onrender.com';
  }

  // Fallback para dev local
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
