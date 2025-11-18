/**
 * Smart Meal Builder
 * Monta refeições automaticamente baseado em metas de macros (P/C/G)
 * Usa clusters nutricionais e compatibilidade culinária
 */

import { Alimento } from '../services/alimentosService';

export interface MetaMacros {
  prot: number;
  carb: number;
  gord: number;
}

export interface AlimentoComPorcao {
  alimento: Alimento;
  gramas: number;
  prot: number;
  carb: number;
  gord: number;
}

export interface RefeicaoMontada {
  alimentos: AlimentoComPorcao[];
  total: MetaMacros;
  erro: number;
  erroPercentual: number;
}

/**
 * Verifica se dois alimentos são compatíveis para serem combinados na mesma refeição
 */
export function saoCompativeis(alimento1: Alimento, alimento2: Alimento): boolean {
  const contexto1 = alimento1.contexto_culinario || '';
  const contexto2 = alimento2.contexto_culinario || '';
  const incomp1 = alimento1.incompativel_com || '';
  const incomp2 = alimento2.incompativel_com || '';

  // 1. Universal sempre combina
  if (contexto1.includes('universal') || contexto2.includes('universal')) {
    return true;
  }

  // 2. Devem ter pelo menos um contexto em comum
  const contextos1 = contexto1.split(',').map(c => c.trim());
  const contextos2 = contexto2.split(',').map(c => c.trim());
  const temContextoComum = contextos1.some(c => contextos2.includes(c));

  if (!temContextoComum) {
    return false;
  }

  // 3. Verificar lista de incompatibilidades
  const incompativeis1 = incomp1.split(',').map(c => c.trim()).filter(c => c);
  const incompativeis2 = incomp2.split(',').map(c => c.trim()).filter(c => c);

  if (incompativeis1.includes(alimento2.categoria) || incompativeis1.includes(alimento2.nome)) {
    return false;
  }
  if (incompativeis2.includes(alimento1.categoria) || incompativeis2.includes(alimento1.nome)) {
    return false;
  }

  // 4. Não repetir mesma categoria (exceto universal)
  if (alimento1.categoria === alimento2.categoria && !contexto1.includes('universal')) {
    return false;
  }

  return true;
}

/**
 * Verifica se um grupo de alimentos é compatível entre si
 */
export function grupoEhCompativel(alimentos: Alimento[]): boolean {
  for (let i = 0; i < alimentos.length; i++) {
    for (let j = i + 1; j < alimentos.length; j++) {
      if (!saoCompativeis(alimentos[i], alimentos[j])) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Calcula macros totais para uma lista de alimentos com porções
 */
function calcularTotalMacros(alimentosComPorcao: AlimentoComPorcao[]): MetaMacros {
  return alimentosComPorcao.reduce(
    (acc, item) => ({
      prot: acc.prot + item.prot,
      carb: acc.carb + item.carb,
      gord: acc.gord + item.gord,
    }),
    { prot: 0, carb: 0, gord: 0 }
  );
}

/**
 * Calcula erro absoluto entre meta e total
 */
function calcularErro(meta: MetaMacros, total: MetaMacros): number {
  return (
    Math.abs(meta.prot - total.prot) +
    Math.abs(meta.carb - total.carb) +
    Math.abs(meta.gord - total.gord)
  );
}

/**
 * Calcula erro percentual médio
 */
function calcularErroPercentual(meta: MetaMacros, total: MetaMacros): number {
  const erroProt = Math.abs(meta.prot - total.prot) / (meta.prot || 1);
  const erroCarb = Math.abs(meta.carb - total.carb) / (meta.carb || 1);
  const erroGord = Math.abs(meta.gord - total.gord) / (meta.gord || 1);
  return ((erroProt + erroCarb + erroGord) / 3) * 100;
}

/**
 * Ajusta porções de alimentos para atingir meta de macros
 * Usa busca em grid com incrementos de 10g
 */
function ajustarPorcoes(
  alimentos: Alimento[],
  meta: MetaMacros,
  minGramas = 50,
  maxGramas = 500,
  incremento = 10
): RefeicaoMontada | null {
  let melhorSolucao: RefeicaoMontada | null = null;
  let menorErro = Infinity;

  // Gerar todas as combinações de porções
  const ranges = alimentos.map(() => {
    const gramasOptions: number[] = [];
    for (let g = minGramas; g <= maxGramas; g += incremento) {
      gramasOptions.push(g);
    }
    return gramasOptions;
  });

  // Função recursiva para testar todas as combinações
  function testarCombinacao(index: number, alimentosComPorcao: AlimentoComPorcao[]) {
    if (index === alimentos.length) {
      const total = calcularTotalMacros(alimentosComPorcao);
      const erro = calcularErro(meta, total);
      const erroPercentual = calcularErroPercentual(meta, total);

      // Aceitar se erro < 10%
      if (erroPercentual < 10 && erro < menorErro) {
        menorErro = erro;
        melhorSolucao = {
          alimentos: [...alimentosComPorcao],
          total,
          erro,
          erroPercentual,
        };
      }
      return;
    }

    const alimento = alimentos[index];
    const porcaoBase = alimento.porcao || 100;

    for (const gramas of ranges[index]) {
      const fator = gramas / porcaoBase;
      const item: AlimentoComPorcao = {
        alimento,
        gramas,
        prot: Math.round(alimento.prot * fator),
        carb: Math.round(alimento.carb * fator),
        gord: Math.round(alimento.gord * fator),
      };

      testarCombinacao(index + 1, [...alimentosComPorcao, item]);

      // Early stopping se já achou uma solução muito boa
      if (melhorSolucao && melhorSolucao.erroPercentual < 3) {
        return;
      }
    }
  }

  testarCombinacao(0, []);
  return melhorSolucao;
}

/**
 * Seleciona alimentos estrategicamente baseado em clusters nutricionais
 */
function selecionarAlimentosPorCluster(
  todosAlimentos: Alimento[],
  meta: MetaMacros,
  contextoDesejado?: string
): Alimento[][] {
  // Filtrar por contexto se especificado
  let alimentosFiltrados = todosAlimentos;
  if (contextoDesejado) {
    alimentosFiltrados = todosAlimentos.filter(
      a =>
        a.contexto_culinario?.includes(contextoDesejado) ||
        a.contexto_culinario?.includes('universal')
    );
  }

  // Separar por clusters nutricionais
  const cluster2ou5 = alimentosFiltrados.filter(a => a.cluster_nutricional === 2 || a.cluster_nutricional === 5); // Proteína
  const cluster3ou4 = alimentosFiltrados.filter(a => a.cluster_nutricional === 3 || a.cluster_nutricional === 4); // Carboidrato
  const cluster0 = alimentosFiltrados.filter(a => a.cluster_nutricional === 0); // Gordura/lanches

  const combinacoes: Alimento[][] = [];

  // Gerar combinações de 2 a 4 alimentos
  // Sempre começar com proteína + carboidrato

  // 2 alimentos: proteína + carbo
  for (const prot of cluster2ou5.slice(0, 10)) {
    for (const carbo of cluster3ou4.slice(0, 10)) {
      if (saoCompativeis(prot, carbo)) {
        combinacoes.push([prot, carbo]);
      }
    }
  }

  // 3 alimentos: proteína + carbo + gordura
  for (const prot of cluster2ou5.slice(0, 8)) {
    for (const carbo of cluster3ou4.slice(0, 8)) {
      for (const gord of cluster0.slice(0, 5)) {
        if (
          saoCompativeis(prot, carbo) &&
          saoCompativeis(prot, gord) &&
          saoCompativeis(carbo, gord)
        ) {
          combinacoes.push([prot, carbo, gord]);
        }
      }
    }
  }

  return combinacoes;
}

/**
 * Monta refeição inteligente baseado na meta de macros
 */
export function montarRefeicaoInteligente(
  meta: MetaMacros,
  todosAlimentos: Alimento[],
  contextoDesejado?: string
): RefeicaoMontada | null {
  console.log(`[SmartBuilder] Montando refeição para meta: P${meta.prot} C${meta.carb} G${meta.gord}`);

  // Selecionar combinações de alimentos
  const combinacoes = selecionarAlimentosPorCluster(todosAlimentos, meta, contextoDesejado);

  console.log(`[SmartBuilder] ${combinacoes.length} combinações de alimentos encontradas`);

  if (combinacoes.length === 0) {
    console.warn('[SmartBuilder] Nenhuma combinação de alimentos compatível encontrada');
    return null;
  }

  // Testar cada combinação e ajustar porções
  let melhorRefeicao: RefeicaoMontada | null = null;
  let melhorErro = Infinity;

  for (const combo of combinacoes) {
    const resultado = ajustarPorcoes(combo, meta);

    if (resultado && resultado.erro < melhorErro) {
      melhorErro = resultado.erro;
      melhorRefeicao = resultado;

      // Se achou uma solução muito boa, pode parar
      if (resultado.erroPercentual < 3) {
        break;
      }
    }
  }

  if (melhorRefeicao) {
    console.log(`[SmartBuilder] ✓ Refeição montada com erro de ${melhorRefeicao.erroPercentual.toFixed(1)}%`);
  } else {
    console.warn('[SmartBuilder] ✗ Não foi possível montar refeição dentro da tolerância');
  }

  return melhorRefeicao;
}

/**
 * Monta múltiplas refeições diferentes para dar opções ao usuário
 */
export function montarVariasRefeicoes(
  meta: MetaMacros,
  todosAlimentos: Alimento[],
  contextoDesejado?: string,
  quantidade: number = 5
): RefeicaoMontada[] {
  const combinacoes = selecionarAlimentosPorCluster(todosAlimentos, meta, contextoDesejado);
  const refeicoesEncontradas: RefeicaoMontada[] = [];
  const combinacoesUsadas = new Set<string>();

  for (const combo of combinacoes) {
    // Criar chave única para a combinação de alimentos
    const chave = combo.map(a => a.id).sort().join('-');

    if (combinacoesUsadas.has(chave)) {
      continue;
    }

    const resultado = ajustarPorcoes(combo, meta);

    if (resultado && resultado.erroPercentual < 10) {
      refeicoesEncontradas.push(resultado);
      combinacoesUsadas.add(chave);

      if (refeicoesEncontradas.length >= quantidade) {
        break;
      }
    }
  }

  return refeicoesEncontradas;
}
