// src/services/historicoService.ts

import { buildUrl, fetchWithTimeout, API_CONFIG } from '../config/api';
import type {
  HistoricoCreate,
  HistoricoRefeicao,
  HistoricoRefeicaoDB,
  HistoricoItemDB,
  adaptHistoricoFromDB,
} from '../types';

/**
 * Registra uma refeição no histórico
 *
 * @param registro - Dados do registro (pode incluir refeicao_id OU itens[])
 * @returns Resposta com id e totais calculados
 */
export async function registrarHistorico(registro: HistoricoCreate): Promise<{
  id: number;
  mensagem: string;
  totais: { kcal: number; prot: number; carb: number; gord: number };
}> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.HISTORICO);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: JSON.stringify(registro),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao registrar no histórico');
  }

  return response.json();
}

/**
 * Lista registros do histórico com filtros opcionais
 *
 * @param params - URLSearchParams com filtros (data, tipo, tags, texto)
 * @returns Lista de registros com itens e totais
 */
export async function listarHistorico(
  params?: URLSearchParams
): Promise<HistoricoRefeicao[]> {
  const queryString = params ? `?${params.toString()}` : '';
  const url = buildUrl(`${API_CONFIG.ENDPOINTS.HISTORICO}${queryString}`);

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error('Erro ao listar histórico');
  }

  const data = await response.json();
  return data.historico || [];
}

/**
 * Busca um registro específico do histórico por ID
 *
 * @param id - ID do registro
 * @returns Registro completo com itens e totais
 */
export async function obterHistorico(id: number): Promise<HistoricoRefeicao> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.HISTORICO_BY_ID(id));

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Registro ${id} não encontrado`);
    }
    throw new Error('Erro ao buscar registro');
  }

  return response.json();
}

/**
 * Deleta um registro do histórico
 *
 * @param id - ID do registro a deletar
 * @returns void (204 No Content)
 */
export async function excluirHistorico(id: number): Promise<void> {
  const url = buildUrl(API_CONFIG.ENDPOINTS.HISTORICO_BY_ID(id));

  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Registro ${id} não encontrado`);
    }
    throw new Error('Erro ao excluir registro');
  }

  // 204 No Content não retorna body
}

/**
 * Helper para criar params de filtro
 */
export function criarFiltrosHistorico(filtros: {
  data?: string;
  tipo?: string[];
  tags?: string;
  texto?: string;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (filtros.data) {
    params.append('data', filtros.data);
  }

  if (filtros.tipo && filtros.tipo.length > 0) {
    params.append('tipo', filtros.tipo.join(','));
  }

  if (filtros.tags) {
    params.append('tags', filtros.tags);
  }

  if (filtros.texto) {
    params.append('texto', filtros.texto);
  }

  return params;
}
