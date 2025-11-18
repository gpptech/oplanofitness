/**
 * Service for fetching food data from the API
 */

import { buildUrl, fetchWithTimeout, API_CONFIG } from '../config/api';
import type {
  Alimento,
  AlimentoCreate,
  AlimentoDB,
} from '../types';
import { adaptAlimentoFromDB } from '../types';

export type { Alimento, AlimentoCreate };

export async function getAllAlimentos(categoria?: string, search?: string): Promise<Alimento[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (search) params.append('search', search);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = buildUrl(`${API_CONFIG.ENDPOINTS.ALIMENTOS}${queryString}`);

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar alimentos: ${response.statusText}`);
  }

  const data = await response.json();

  // Adaptar de snake_case (backend) para camelCase (frontend)
  const alimentosDB: AlimentoDB[] = data.alimentos;
  return alimentosDB.map(adaptAlimentoFromDB);
}

export async function getCategorias(): Promise<string[]> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.CATEGORIAS);

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
  }

  const data = await response.json();
  return data.categorias;
}

export interface AddFoodResponse {
  status: 'inserted' | 'duplicate';
  id?: number;
  record?: any;
  verdict?: any;
  conflicts?: any[];
}

export async function addFood(prompt: string): Promise<AddFoodResponse> {
  const url = buildUrl('/api/add-food');

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao adicionar alimento: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Adiciona um novo alimento na base de dados
 *
 * @param alimento - Dados do alimento a criar
 * @returns Resposta com id e alimento criado
 */
export async function addAlimento(alimento: AlimentoCreate): Promise<{
  id: number;
  mensagem: string;
  alimento: Alimento;
}> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.ALIMENTOS);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify(alimento),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error(`Alimento '${alimento.nome}' já existe`);
    }
    throw new Error(error.detail || 'Erro ao adicionar alimento');
  }

  const data = await response.json();

  return {
    id: data.id,
    mensagem: data.mensagem,
    alimento: adaptAlimentoFromDB(data.alimento),
  };
}
