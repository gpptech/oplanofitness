// src/hooks/useSmartFoodSearch.ts

import { useMemo, useState, useEffect } from 'react';
import type { Alimento } from '../types';

interface FoodScore {
  alimento: Alimento;
  score: number;
}

interface UseSmartFoodSearchParams {
  alimentos: Alimento[];
  nome: string;
  descricao: string;
  searchQuery?: string;
  alimentosSelecionadosIds: number[];
  maxResults?: number;
}

/**
 * Hook para busca inteligente de alimentos com ranking otimizado
 *
 * Prioridades (ordem importa!):
 * 1. searchQuery manual (se fornecido)
 * 2. Palavras do nome da refeição (peso 2x)
 * 3. Palavras da descrição (peso 1x)
 *
 * Scoring (sistema otimizado - prioriza matches no início):
 * - Match EXATO do nome completo: 100 pontos (nome idêntico)
 * - Match no INÍCIO do nome (startsWith): 50 pontos (máxima prioridade)
 * - Match de FRASE EXATA (includes): 20 pontos
 * - Match SEQUENCIAL de tokens: 10 pontos (respeita ordem)
 * - Match EXATO de palavra: 3 pontos × BOOST DE POSIÇÃO
 *   * Posição 0 (primeira palavra): 3.0× (9 pontos)
 *   * Posição 1 (segunda palavra): 2.0× (6 pontos)
 *   * Posição 2 (terceira palavra): 1.5× (4.5 pontos)
 *   * Posição 3+ (demais): 1.0× (3 pontos)
 * - Match PARCIAL (substring): 0.5 ponto (fallback)
 * - Contexto culinário compatível: boost 1.3x
 */
export function useSmartFoodSearch({
  alimentos,
  nome,
  descricao,
  searchQuery,
  alimentosSelecionadosIds,
  maxResults = 5,
}: UseSmartFoodSearchParams): Alimento[] {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery || '');

  // Debounce do searchQuery (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery || '');
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tokenização: divide texto em palavras normalizadas
  const tokenize = (text: string): string[] => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .split(/\s+/)
      .filter(word => word.length > 2); // Ignora palavras muito curtas
  };

  // Normalização: remove acentos e caracteres especiais
  const normalizar = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .trim();
  };

  // Indexação: pré-processa alimentos para busca rápida
  const alimentosIndexados = useMemo(() => {
    return alimentos.map(alimento => ({
      alimento,
      tokens: [
        ...tokenize(alimento.nome),
        ...tokenize(alimento.categoria.replace(/_/g, ' ')),
        ...tokenize(alimento.contexto_culinario),
      ],
      nomeNormalizado: normalizar(alimento.nome),
    }));
  }, [alimentos]);

  // Função de scoring
  const calcularScore = (
    alimentoIndexado: typeof alimentosIndexados[0],
    queryTokens: string[],
    nomeTokens: string[],
    descricaoTokens: string[]
  ): number => {
    let score = 0;

    const todosTokens = [...queryTokens, ...nomeTokens, ...descricaoTokens];

    // Se tem query manual, só considera ela (prioridade absoluta)
    const tokensRelevantes = queryTokens.length > 0
      ? queryTokens
      : [...nomeTokens.map(t => ({ token: t, weight: 2 })), ...descricaoTokens.map(t => ({ token: t, weight: 1 }))];

    if (queryTokens.length > 0) {
      // Modo busca manual: score otimizado priorizando início do nome
      const queryCompleta = normalizar(debouncedQuery);
      const nomeNorm = alimentoIndexado.nomeNormalizado;

      // 1. MATCH EXATO COMPLETO: +100 pontos (nome idêntico)
      if (nomeNorm === queryCompleta) {
        score += 100;
      }

      // 2. MATCH NO INÍCIO DO NOME: +50 pontos (MÁXIMA PRIORIDADE)
      // Ex: "peito de frango" → "Peito de frango cozido" = +50
      if (nomeNorm.startsWith(queryCompleta)) {
        score += 50;
      }

      // 3. MATCH DE FRASE EXATA: +20 pontos
      // Ex: "frango cozido" → "Sopa de frango cozido" = +20
      if (nomeNorm.includes(queryCompleta) && !nomeNorm.startsWith(queryCompleta)) {
        score += 20;
      }

      // 4. MATCH SEQUENCIAL DE TOKENS: +10 pontos (respeita ordem)
      // Ex: "carne moida" → "Carne bovina moída" = +10
      if (queryTokens.length > 1) {
        let posicaoAnterior = -1;
        let sequenciaValida = true;

        for (const queryToken of queryTokens) {
          const posicao = nomeNorm.indexOf(queryToken, posicaoAnterior + 1);
          if (posicao === -1 || posicao <= posicaoAnterior) {
            sequenciaValida = false;
            break;
          }
          posicaoAnterior = posicao;
        }

        if (sequenciaValida) {
          score += 10;
        }
      }

      // 5. MATCH EXATO DE PALAVRA: +3 pontos (por token) + BOOST POR POSIÇÃO
      // Ex: "frango" → "Frango grelhado" (pos 0) = +3 * 3.0 = +9
      // Ex: "frango" → "Peito de frango" (pos 2) = +3 * 1.5 = +4.5
      // Ex: "frango" → "Sopa com legumes e frango" (pos 4+) = +3 * 1.0 = +3
      for (const queryToken of queryTokens) {
        // Encontrar posição do token no nome normalizado
        const nomeTokens = tokenize(alimentoIndexado.nomeNormalizado);
        const posicao = nomeTokens.findIndex(t => t === queryToken);

        if (posicao !== -1) {
          // Boost baseado na posição (quanto mais no início, maior o multiplicador)
          let positionBoost = 1.0;
          if (posicao === 0) positionBoost = 3.0;      // Primeira palavra: 3x
          else if (posicao === 1) positionBoost = 2.0; // Segunda palavra: 2x
          else if (posicao === 2) positionBoost = 1.5; // Terceira palavra: 1.5x
          // Demais posições: 1.0x (sem boost)

          score += 3 * positionBoost;
        }
      }

      // 6. MATCH PARCIAL (substring): +0.5 ponto (fallback apenas)
      // Ex: "frang" → "frango" = +0.5
      for (const queryToken of queryTokens) {
        for (const token of alimentoIndexado.tokens) {
          if (token !== queryToken && (token.includes(queryToken) || queryToken.includes(token))) {
            score += 0.5;
          }
        }
      }
    } else {
      // Modo inteligente: usa nome + descrição com pesos (também otimizado)
      const contextoCompleto = normalizar([nome, descricao].filter(Boolean).join(' '));
      const nomeNorm = alimentoIndexado.nomeNormalizado;

      // Match de frase completa no contexto
      if (contextoCompleto && nomeNorm.includes(contextoCompleto)) {
        score += 8;
      }

      // Match exato de tokens com peso
      for (const { token, weight } of tokensRelevantes as Array<{ token: string; weight: number }>) {
        for (const alimentoToken of alimentoIndexado.tokens) {
          if (alimentoToken === token) {
            score += 3 * weight;
          }
          // Match parcial com peso reduzido
          else if (alimentoToken.includes(token) || token.includes(alimentoToken)) {
            score += 0.5 * weight;
          }
        }
      }

      // Boost por contexto culinário compatível
      const contextoRefeicao = [...nomeTokens, ...descricaoTokens].join(' ');
      const contextoAlimento = alimentoIndexado.alimento.contexto_culinario.toLowerCase();

      if (contextoRefeicao && contextoAlimento) {
        const contextoTokensRefeicao = tokenize(contextoRefeicao);
        const contextoTokensAlimento = tokenize(contextoAlimento);

        const overlap = contextoTokensRefeicao.filter(t =>
          contextoTokensAlimento.some(at => at === t || at.includes(t) || t.includes(at))
        ).length;

        if (overlap > 0) {
          score *= 1.3; // Boost de 30%
        }
      }
    }

    return score;
  };

  // Busca e ranking
  const resultados = useMemo(() => {
    // Se não tem query e não tem nome/descrição, retorna vazio
    if (!debouncedQuery && !nome && !descricao) {
      return [];
    }

    const queryTokens = tokenize(debouncedQuery);
    const nomeTokens = tokenize(nome);
    const descricaoTokens = tokenize(descricao);

    // Filtra alimentos já selecionados
    const alimentosDisponiveis = alimentosIndexados.filter(
      ({ alimento }) => !alimentosSelecionadosIds.includes(alimento.id)
    );

    // Calcula scores
    const scored: FoodScore[] = alimentosDisponiveis
      .map(alimentoIndexado => ({
        alimento: alimentoIndexado.alimento,
        score: calcularScore(alimentoIndexado, queryTokens, nomeTokens, descricaoTokens),
      }))
      .filter(({ score }) => score > 0); // Remove scores zero

    // Ordena por score (desc) e retorna top N
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, maxResults).map(({ alimento }) => alimento);
  }, [alimentosIndexados, debouncedQuery, nome, descricao, alimentosSelecionadosIds, maxResults]);

  return resultados;
}
