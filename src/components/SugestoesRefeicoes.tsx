import React, { memo } from "react";

interface SugestoesRefeicoesProps {
  tiposRefeicoes: string[];
  config: any;
  pratosPorTipo: Record<string, any[]>;
  loading: boolean;
  metasPadrao: Record<string, any>;
}

const SugestoesRefeicoes = memo(function SugestoesRefeicoes({
  tiposRefeicoes,
  config,
  pratosPorTipo,
  loading,
  metasPadrao,
}: SugestoesRefeicoesProps) {
  return (
    <div className="min-h-[calc(100vh-12rem)] animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-light mb-6 tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Sugestões de Pratos por Tipo de Refeição
      </h2>

      {/* Grid horizontal com colunas por tipo */}
      <div className="flex gap-4 sm:gap-5">
        {tiposRefeicoes
          .filter((tipo) => !["lixo", "whey"].includes(tipo))
          .map((tipo: string) => (
            <div
              className="flex-1 flex flex-col h-full"
              key={tipo}
            >
              <CardRefeicao
                tipo={tipo}
                simbolo={config.simbolos[tipo]}
                pratos={pratosPorTipo[tipo] || []}
                loading={loading}
                meta={metasPadrao[tipo]}
              />
            </div>
          ))}
      </div>
    </div>
  );
});

export default SugestoesRefeicoes;

// Componente para exibir refeições pré-carregadas
interface CardRefeicaoProps {
  tipo: string;
  simbolo: { emoji: string; label: string };
  pratos: any[];
  loading: boolean;
  meta: { prot: number; carb: number; gord: number; kcal: number };
}

const truncate = (text: string = "", maxLength = 80) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

function CardRefeicao({ tipo, simbolo, pratos, loading, meta }: CardRefeicaoProps) {

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 bg-white">
      {/* Header do tipo de refeição */}
      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 border-b border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl emoji-enhanced">{simbolo.emoji}</span>
          <h3 className="text-sm font-bold text-gray-900 text-center tracking-wide">
            {simbolo.label}
          </h3>
          <div className="flex gap-1.5 mt-1">
            <span className="badge badge-success text-[10px] px-2 py-0.5">
              {meta.prot}g P
            </span>
            <span className="badge badge-warning text-[10px] px-2 py-0.5">
              {meta.carb}g C
            </span>
            <span className="badge badge-error text-[10px] px-2 py-0.5">
              {meta.gord}g G
            </span>
          </div>
        </div>
      </div>

      {/* Lista vertical de pratos */}
      <div className="p-3 grid grid-cols-2 gap-2.5">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
            <div className="animate-pulse-soft mb-3">
              <div className="text-3xl">⏳</div>
            </div>
            <div className="font-medium">Carregando refeições...</div>
          </div>
        ) : pratos.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
            <div className="mb-3 text-3xl opacity-50">⚠️</div>
            <div className="font-medium">Nenhuma combinação encontrada</div>
            <div className="text-xs mt-1 text-gray-400">Verifique a API de refeições</div>
          </div>
        ) : (
          pratos.map((prato, idx) => {
            const totalGramas =
              prato.alimentosComPorcao?.reduce(
                (sum: number, item: any) => sum + (Number(item.gramas) || 0),
                0
              );
            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-2.5 rounded-lg border border-indigo-200 shadow-sm card-hover cursor-pointer"
              >
              <div className="font-semibold text-[11px] mb-1.5 text-gray-900 leading-tight">
                {truncate(prato.nome)}
              </div>
              <div className="text-[10px] text-gray-700 space-y-1">
                <div className="flex gap-1 flex-wrap">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                    {prato.total.prot}g P
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-bold">
                    {prato.total.carb}g C
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">
                    {prato.total.gord}g G
                  </span>
                </div>
                <div className="text-gray-600 font-medium">
                  {totalGramas !== undefined
                    ? `${prato.total.kcal} kcal · ${totalGramas}g total`
                    : `${prato.total.kcal} kcal`}
                </div>
              </div>
              {/* Mostrar ingredientes com porções detalhadas */}
              <div className="mt-2 pt-2 border-t border-indigo-200/60">
                <div className="text-[10px] text-gray-700 space-y-1">
                  {prato.alimentosComPorcao?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between gap-1.5 items-center">
                      <span className="break-words flex-1">
                        {truncate(item.alimento.nome, 40)}
                      </span>
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded text-[9px]">
                        {item.gramas}g
                      </span>
                    </div>
                  )) || (
                    <div className="text-gray-500 italic">
                      {prato.ingredientes
                        ?.map((ing: any) => ing.nome.split(" ")[0])
                        .join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
