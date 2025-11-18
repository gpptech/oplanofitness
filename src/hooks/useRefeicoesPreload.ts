import { useState, useEffect } from 'react';
import { getRefeicoes, formatarParaUI } from '../services/refeicoesService';

/**
 * Hook para pré-carregar refeições de múltiplos tipos de uma vez
 * Evita 4 fetches independentes consolidando em um único carregamento
 *
 * @param tipos - Array de tipos de refeição (ex: ['cafe', 'almoco', 'jantar', 'lanche'])
 * @param limit - Número máximo de refeições por tipo (padrão: 10)
 * @returns { pratosporTipo, loading } - Mapa de tipo -> array de pratos formatados
 */
export function useRefeicoesPreload(tipos: string[], limit: number = 10) {
  const [pratosPorTipo, setPratosPorTipo] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarTodas = async () => {
      setLoading(true);
      try {
        // Carregar todas as refeições em paralelo
        const promises = tipos.map(async (tipo) => {
          try {
            const refeicoesAPI = await getRefeicoes(tipo, limit);
            const pratosFormatados = refeicoesAPI.map((ref) => formatarParaUI(ref));
            return { tipo, pratos: pratosFormatados };
          } catch (erro) {
            console.error(`[useRefeicoesPreload] Erro ao carregar ${tipo}:`, erro);
            return { tipo, pratos: [] };
          }
        });

        const resultados = await Promise.all(promises);

        // Converter array de resultados em objeto tipo -> pratos
        const mapa = resultados.reduce((acc, { tipo, pratos }) => {
          acc[tipo] = pratos;
          return acc;
        }, {} as Record<string, any[]>);

        setPratosPorTipo(mapa);
      } catch (erro) {
        console.error('[useRefeicoesPreload] Erro geral:', erro);
        setPratosPorTipo({});
      } finally {
        setLoading(false);
      }
    };

    if (tipos.length > 0) {
      carregarTodas();
    }
  }, [tipos.join(','), limit]); // Re-fetch apenas se tipos ou limit mudarem

  return { pratosPorTipo, loading };
}
