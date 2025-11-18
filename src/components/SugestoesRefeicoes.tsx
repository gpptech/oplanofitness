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
    <div className="min-h-[calc(100vh-12rem)]">
      <h2 className="text-xl sm:text-2xl font-light mb-6 tracking-tight">
        Sugestões de Pratos por Tipo de Refeição
      </h2>

      {/* Grid horizontal com colunas por tipo */}
      <div className="flex gap-3 sm:gap-4">
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
    <div className="border border-gray-300 rounded overflow-hidden">
      {/* Header do tipo de refeição */}
      <div className="bg-gray-100 p-3 border-b border-gray-300">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">{simbolo.emoji}</span>
          <h3 className="text-sm font-semibold text-gray-800 text-center">
            {simbolo.label}
          </h3>
          <div className="text-xs text-gray-600 font-semibold">
            {meta.prot}g P · {meta.carb}g C · {meta.gord}g G
          </div>
        </div>
      </div>

      {/* Lista vertical de pratos */}
      <div className="p-2 grid grid-cols-2 gap-2">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
            <div className="mb-2">⏳</div>
            <div>Carregando refeições...</div>
          </div>
        ) : pratos.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
            <div className="mb-2">⚠️</div>
            <div>Nenhuma combinação encontrada</div>
            <div className="text-xs mt-1">Verifique a API de refeições</div>
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
                className="bg-gradient-to-br from-purple-50 to-blue-50 p-2 rounded border border-purple-200 shadow-sm"
              >
              <div className="font-medium text-[11px] mb-1 text-gray-800 leading-tight">
                {truncate(prato.nome)}
              </div>
              <div className="text-[10px] text-gray-600 space-y-0.5">
                <div className="font-semibold">
                  {prato.total.prot}g P · {prato.total.carb}g C ·{" "}
                  {prato.total.gord}g G
                </div>
                <div className="text-gray-500">
                  {totalGramas !== undefined
                    ? `${prato.total.kcal} kcal · ${totalGramas}g total`
                    : `${prato.total.kcal} kcal`}
                </div>
              </div>
              {/* Mostrar ingredientes com porções detalhadas */}
              <div className="mt-1.5 pt-1.5 border-t border-purple-200">
                <div className="text-[10px] text-gray-600 space-y-0.5">
                  {prato.alimentosComPorcao?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between gap-1">
                      <span className="break-words">
                        {truncate(item.alimento.nome)}
                      </span>
                      <span className="font-mono font-semibold text-black">
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
