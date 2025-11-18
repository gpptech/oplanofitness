/**
 * Serviço para buscar refeições pré-montadas da API
 * Totais nutricionais agora são calculados no backend
 */

import { buildUrl, fetchWithTimeout, API_CONFIG } from '../config/api';
import type { Refeicao, RefeicaoCreate, Totais } from '../types';

// Re-export tipos do types/index.ts para compatibilidade
export type { Refeicao, RefeicaoCreate, Totais };

// Interface para compatibilidade com código existente
export interface RefeicaoComTotais extends Refeicao {}

export interface TotaisNutricionais extends Totais {}

/**
 * Busca refeições do backend
 * Totais já vêm calculados do backend
 */
export async function getRefeicoes(
  tipo?: string,
  limit: number = 5
): Promise<RefeicaoComTotais[]> {
  const params = new URLSearchParams();
  if (tipo) params.append('tipo', tipo);
  params.append('limit', limit.toString());

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.REFEICOES}?${params}`);

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar refeições: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Totais já vêm calculados do backend
  return data.refeicoes;
}

/**
 * Busca uma refeição específica por ID
 */
export async function getRefeicaoById(id: number): Promise<RefeicaoComTotais> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.REFEICOES_BY_ID(id));

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Refeição não encontrada');
    }
    throw new Error(`Erro ao buscar refeição: ${response.status} ${response.statusText}`);
  }

  // Totais já vêm calculados do backend
  return response.json();
}

/**
 * Busca tipos de refeição disponíveis
 */
export async function getTiposDisponiveis(): Promise<string[]> {
  const url = buildUrl('/api/refeicoes/tipos/disponiveis');

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar tipos: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.tipos;
}

/**
 * Cria uma nova refeição com itens
 *
 * @param refeicao - Dados da refeição a criar
 * @returns Resposta com id, nome e totais calculados
 */
export async function createRefeicao(refeicao: RefeicaoCreate): Promise<{
  id: number;
  nome: string;
  mensagem: string;
  totais: Totais;
}> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.REFEICOES);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify(refeicao),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Um ou mais alimentos não foram encontrados');
    }
    throw new Error(error.detail || 'Erro ao criar refeição');
  }

  return response.json();
}

/**
 * Atualiza campos básicos de uma refeição existente
 *
 * @param id - ID da refeição
 * @param updates - Campos a atualizar (nome, tipo, descricao, tags, contexto_culinario, ativa)
 * @returns Resposta com status e refeição atualizada
 */
export async function updateRefeicao(
  id: number,
  updates: {
    nome?: string;
    tipo?: string;
    descricao?: string;
    tags?: string;
    contexto_culinario?: string;
    ativa?: boolean;
  }
): Promise<any> {
  const url = buildUrl(`${API_CONFIG.ENDPOINTS.REFEICOES}/${id}`);

  const response = await fetchWithTimeout(url, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Refeição não encontrada');
    }
    throw new Error(error.detail || error.message || 'Falha ao atualizar refeição');
  }

  return response.json();
}

/**
 * Exclui uma refeição permanentemente
 *
 * @param id - ID da refeição a excluir
 */
export async function deleteRefeicao(id: number): Promise<void> {
  const url = buildUrl(`${API_CONFIG.ENDPOINTS.REFEICOES}/${id}`);

  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Refeição não encontrada');
    }
    throw new Error(error.detail || error.message || 'Falha ao excluir refeição');
  }
}

/**
 * Formata refeição para formato esperado pela UI do meal_planner_app
 */
export function formatarParaUI(refeicao: RefeicaoComTotais) {
  return {
    nome: refeicao.nome,
    ingredientes: refeicao.itens.map(item => ({
      id: item.alimento_id,
      nome: item.alimento_nome,
      categoria: item.categoria,
      porcao: item.porcao_base,
      kcal: item.kcal_100g,
      prot: item.prot_100g,
      carb: item.carb_100g,
      gord: item.gord_100g
    })),
    alimentosComPorcao: refeicao.itens.map(item => ({
      alimento: {
        id: item.alimento_id,
        nome: item.alimento_nome,
        categoria: item.categoria,
        porcao: item.porcao_base,
        kcal: item.kcal_100g,
        prot: item.prot_100g,
        carb: item.carb_100g,
        gord: item.gord_100g
      },
      gramas: item.gramas
    })),
    total: {
      prot: Math.round(refeicao.totais.prot),
      carb: Math.round(refeicao.totais.carb),
      gord: Math.round(refeicao.totais.gord),
      kcal: Math.round(refeicao.totais.kcal)
    },
    erroPercentual: 0 // Refeições do DB são pré-validadas
  };
}
