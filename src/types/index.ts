// src/types/index.ts

/**
 * TIPOS DO BACKEND (snake_case)
 * Representação exata do que o backend retorna
 */

export interface AlimentoDB {
  id: number;
  nome: string;
  categoria: string;
  porcao_g: number;
  kcal: number;
  prot_g: number;
  carb_g: number;
  gord_g: number;
  contexto_culinario: string;
  incompativel_com: string;
  cluster_nutricional?: number;
}

export interface RefeicaoDB {
  id: number;
  nome: string;
  tipo: string;
  contexto_culinario: string | null;
  descricao: string | null;
  tags: string | null;
  criada_em: string;
  ativa: boolean;
}

export interface RefeicaoItemDB {
  id: number;
  refeicao_id: number;
  alimento_id: number;
  gramas: number;
  ordem: number;
  // Joins com alimentos
  alimento_nome?: string;
  alimento_porcao_g?: number;
  alimento_kcal?: number;
  alimento_prot_g?: number;
  alimento_carb_g?: number;
  alimento_gord_g?: number;
}

export interface HistoricoRefeicaoDB {
  id: number;
  data: string; // YYYY-MM-DD
  refeicao_id: number | null;
  nome: string;
  tipo: string;
  descricao: string | null;
  tags: string | null;
  criada_em: string;
}

export interface HistoricoItemDB {
  id: number;
  historico_id: number;
  alimento_id: number;
  gramas: number;
  ordem: number;
  // Joins com alimentos
  alimento_nome?: string;
  alimento_porcao_g?: number;
  alimento_kcal?: number;
  alimento_prot_g?: number;
  alimento_carb_g?: number;
  alimento_gord_g?: number;
}

/**
 * TIPOS DO FRONTEND (camelCase + totais calculados)
 * Representação otimizada para uso na UI
 */

export interface Alimento {
  id: number;
  nome: string;
  categoria: string;
  porcao: number;
  kcal: number;
  prot: number;
  carb: number;
  gord: number;
  contexto_culinario: string;
  incompativel_com: string;
  cluster_nutricional?: number;
}

export interface Totais {
  kcal: number;
  prot: number;
  carb: number;
  gord: number;
}

export interface RefeicaoItem {
  alimento_id: number;
  alimento_nome: string;
  gramas: number;
  ordem: number;
  // Valores por 100g
  porcao: number;
  kcal: number;
  prot: number;
  carb: number;
  gord: number;
}

export interface Refeicao {
  id: number;
  nome: string;
  tipo: string;
  contexto_culinario: string | null;
  descricao: string | null;
  tags: string | null;
  criada_em: string;
  ativa: boolean;
  itens: RefeicaoItem[];
  totais: Totais;
}

export interface HistoricoRefeicao {
  id: number;
  data: string;
  refeicao_id: number | null;
  nome: string;
  tipo: string;
  descricao: string | null;
  tags: string | null;
  criada_em: string;
  itens: RefeicaoItem[];
  totais: Totais;
}

/**
 * TIPOS PARA CRIAÇÃO (Payloads)
 */

export interface AlimentoCreate {
  nome: string;
  categoria: string;
  porcao_g: number;
  kcal: number;
  prot_g: number;
  carb_g: number;
  gord_g: number;
  contexto_culinario: string;
  incompativel_com?: string;
}

export interface ItemCreate {
  alimento_id: number;
  gramas: number;
}

export interface RefeicaoCreate {
  nome: string;
  tipo: string;
  contexto_culinario?: string;
  descricao?: string;
  tags?: string;
  itens: ItemCreate[];
}

export interface HistoricoCreate {
  data: string; // YYYY-MM-DD
  refeicao_id?: number;
  nome: string;
  tipo: string;
  descricao?: string;
  tags?: string;
  itens?: ItemCreate[]; // Obrigatório se refeicao_id for null
}

/**
 * ADAPTADORES (Conversão Backend ↔ Frontend)
 */

export function adaptAlimentoFromDB(db: AlimentoDB): Alimento {
  return {
    id: db.id,
    nome: db.nome,
    categoria: db.categoria,
    porcao: db.porcao_g,
    kcal: db.kcal,
    prot: db.prot_g,
    carb: db.carb_g,
    gord: db.gord_g,
    contexto_culinario: db.contexto_culinario,
    incompativel_com: db.incompativel_com,
    cluster_nutricional: db.cluster_nutricional,
  };
}

export function adaptAlimentoToDB(alimento: AlimentoCreate): AlimentoCreate {
  // Já está no formato correto (snake_case)
  return alimento;
}

export function calcularTotais(itens: RefeicaoItem[]): Totais {
  return itens.reduce((acc, item) => {
    const fator = item.gramas / item.porcao;
    return {
      kcal: acc.kcal + item.kcal * fator,
      prot: acc.prot + item.prot * fator,
      carb: acc.carb + item.carb * fator,
      gord: acc.gord + item.gord * fator,
    };
  }, { kcal: 0, prot: 0, carb: 0, gord: 0 });
}

export function adaptRefeicaoItem(itemDB: RefeicaoItemDB): RefeicaoItem {
  return {
    alimento_id: itemDB.alimento_id,
    alimento_nome: itemDB.alimento_nome || '',
    gramas: itemDB.gramas,
    ordem: itemDB.ordem,
    porcao: itemDB.alimento_porcao_g || 100,
    kcal: itemDB.alimento_kcal || 0,
    prot: itemDB.alimento_prot_g || 0,
    carb: itemDB.alimento_carb_g || 0,
    gord: itemDB.alimento_gord_g || 0,
  };
}

export function adaptRefeicaoFromDB(
  refeicaoDB: RefeicaoDB,
  itensDB: RefeicaoItemDB[]
): Refeicao {
  const itens = itensDB.map(adaptRefeicaoItem);
  const totais = calcularTotais(itens);

  return {
    ...refeicaoDB,
    itens,
    totais,
  };
}

export function adaptHistoricoItem(itemDB: HistoricoItemDB): RefeicaoItem {
  return {
    alimento_id: itemDB.alimento_id,
    alimento_nome: itemDB.alimento_nome || '',
    gramas: itemDB.gramas,
    ordem: itemDB.ordem,
    porcao: itemDB.alimento_porcao_g || 100,
    kcal: itemDB.alimento_kcal || 0,
    prot: itemDB.alimento_prot_g || 0,
    carb: itemDB.alimento_carb_g || 0,
    gord: itemDB.alimento_gord_g || 0,
  };
}

export function adaptHistoricoFromDB(
  historicooDB: HistoricoRefeicaoDB,
  itensDB: HistoricoItemDB[]
): HistoricoRefeicao {
  const itens = itensDB.map(adaptHistoricoItem);
  const totais = calcularTotais(itens);

  return {
    ...historicooDB,
    itens,
    totais,
  };
}
