import React, { memo } from "react";

interface TimelineSemanalProps {
  refeicoes: any;
  config: any;
  diasOrdenados: string[];
  calcularResumoDia: (dia: string) => any;
  calcularTotaisSemana: () => any;
}

const TimelineSemanal = memo(function TimelineSemanal({
  refeicoes,
  config,
  diasOrdenados,
  calcularResumoDia,
  calcularTotaisSemana,
}: TimelineSemanalProps) {
  const horasVisiveis = Array.from(
    { length: config.horaFim - config.horaInicio + 1 },
    (_, i) => i + config.horaInicio,
  );

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light mb-6 tracking-tight">
        Agenda Semanal
      </h2>
      <div>
        {/* Header de horas */}
        <div className="flex border-b border-gray-100 bg-white">
          <div className="w-20 flex-shrink-0 p-3 font-bold text-xs text-gray-700 border-r border-gray-100">
            Dia
          </div>
          <div className="flex-1 relative">
            {horasVisiveis.map((hora, idx) => {
              const position = (idx / (horasVisiveis.length - 1)) * 100;
              return (
                <div
                  key={hora}
                  className="absolute top-0 bottom-0 transform -translate-x-1/2 flex items-center z-10"
                  style={{ left: `${position}%` }}
                >
                  <span className="text-xs p-2 font-semibold text-gray-700">
                    {hora}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dias */}
        {diasOrdenados.map((dia) => {
          const diaRefeicoes = refeicoes[dia] || [];
          return (
            <div
              key={dia}
              className="flex border-b border-gray-100 last:border-b-0 bg-white"
            >
              <div className="min-w-[85px] w-auto flex-shrink-0 p-3 text-xs text-gray-700 border-r border-gray-100 flex flex-col items-center justify-center">
                <span className="font-bold mt-1">{dia}</span>

                {/* Calcular resumo do dia */}
                {(() => {
                  const resumo = calcularResumoDia(dia);
                  if (!resumo.hasMeals) {
                    return (
                      <span className="text-xs font-light text-gray-400">
                        Jejum 24h
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] font-light text-black text-center leading-tight mt-0.5">
                      {resumo.kcal} kcal
                      <br />
                      {resumo.prot}P · {resumo.carb}C · {resumo.gord}G <br />{" "}
                      Maior jejum: {resumo.jejum}h
                    </span>
                  );
                })()}
              </div>

              <div
                className="flex-1 relative bg-white"
                style={{ height: "42px" }}
              >
                {/* Grid de fundo */}
                <div className="absolute inset-0 z-0">
                  {horasVisiveis.map((hora, idx) => {
                    const position = (idx / (horasVisiveis.length - 1)) * 100;
                    return (
                      <div
                        key={hora}
                        className="absolute top-0 bottom-0 w-px bg-white"
                        style={{ left: `${position}%` }}
                      />
                    );
                  })}
                </div>

                {/* Intervalos de jejum */}
                {(() => {
                  const intervalos = [];
                  const refeicoesSorted = [...diaRefeicoes].sort(
                    (a, b) => a.hora - b.hora,
                  );

                  if (
                    refeicoesSorted.length > 0 &&
                    refeicoesSorted[0].hora > config.horaInicio
                  ) {
                    const horasJejum = refeicoesSorted[0].hora - 0;
                    const inicio = config.horaInicio;
                    const fim = refeicoesSorted[0].hora;
                    const inicioIdx = inicio - config.horaInicio;
                    const fimIdx = fim - config.horaInicio;
                    const left = (inicioIdx / (horasVisiveis.length - 1)) * 100;
                    const right = (fimIdx / (horasVisiveis.length - 1)) * 100;

                    intervalos.push(
                      <div
                        key="jejum-inicio"
                        className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                        style={{
                          left: `${left}%`,
                          width: `${right - left}%`,
                        }}
                      >
                        <span className="text-xs font-light text-black">
                          {horasJejum}h
                        </span>
                      </div>,
                    );
                  }

                  for (let i = 0; i < refeicoesSorted.length - 1; i++) {
                    const refAtual = refeicoesSorted[i];
                    const proximaRef = refeicoesSorted[i + 1];
                    const horasJejum = proximaRef.hora - refAtual.hora;

                    const inicioIdx = refAtual.hora - config.horaInicio;
                    const fimIdx = proximaRef.hora - config.horaInicio;
                    const left = (inicioIdx / (horasVisiveis.length - 1)) * 100;
                    const right = (fimIdx / (horasVisiveis.length - 1)) * 100;

                    intervalos.push(
                      <div
                        key={`jejum-${i}`}
                        className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                        style={{
                          left: `${left}%`,
                          width: `${right - left}%`,
                        }}
                      >
                        <span className="text-xs font-light text-black">
                          {horasJejum}h
                        </span>
                      </div>,
                    );
                  }

                  if (
                    refeicoesSorted.length > 0 &&
                    refeicoesSorted[refeicoesSorted.length - 1].hora <
                      config.horaFim
                  ) {
                    const horasJejum =
                      config.horaFim -
                      refeicoesSorted[refeicoesSorted.length - 1].hora;
                    const inicio =
                      refeicoesSorted[refeicoesSorted.length - 1].hora;
                    const fim = config.horaFim;
                    const inicioIdx = inicio - config.horaInicio;
                    const fimIdx = fim - config.horaInicio;
                    const left = (inicioIdx / (horasVisiveis.length - 1)) * 100;
                    const right = (fimIdx / (horasVisiveis.length - 1)) * 100;

                    intervalos.push(
                      <div
                        key="jejum-fim"
                        className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                        style={{
                          left: `${left}%`,
                          width: `${right - left}%`,
                        }}
                      >
                        <span className="text-xs font-light text-black">
                          {horasJejum}h
                        </span>
                      </div>,
                    );
                  }

                  return intervalos;
                })()}

                {/* Marcadores de refeição */}
                {diaRefeicoes.map((ref: any) => {
                  const horaIndex = ref.hora - config.horaInicio;
                  const position = (horaIndex / (horasVisiveis.length - 1)) * 100;
                  const simbolo = config.simbolos[ref.tipo];

                  return (
                    <div
                      key={ref.id}
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20"
                      style={{ left: `${position}%` }}
                      title={`${ref.nome} - ${ref.hora}:00`}
                    >
                      <span className="text-lg">{simbolo.emoji}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Linha de totais semanais */}
        {(() => {
          const totais = calcularTotaisSemana();
          return (
            <div className="flex border-t border-gray-200 bg-gray-50">
              <div className="w-20 flex-shrink-0 p-3 text-xs font-semibold text-gray-800 border-r border-gray-100 flex items-center justify-center">
                Total
              </div>
              <div className="flex-1 p-3 text-sm text-gray-800 flex items-center">
                <div>
                  <div className="text-xs">
                    <strong>{totais.kcal}</strong> kcal ·{" "}
                    <strong>{totais.prot}g</strong> P ·{" "}
                    <strong>{totais.carb}g</strong> C ·{" "}
                    <strong>{totais.gord}g</strong> G - Média semanal:{" "}
                    <strong>{(totais.kcal / 7).toFixed(0)}</strong> kcal ·{" "}
                    <strong>{(totais.prot / 7).toFixed(0)}g</strong> P ·{" "}
                    <strong>{(totais.carb / 7).toFixed(0)}g</strong> C ·{" "}
                    <strong>{(totais.gord / 7).toFixed(0)}g</strong> G
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Jejum total (soma dias): {totais.jejumTotal}h{" "}
                    {totais.diasComJejum > 0
                      ? `• média: ${(totais.jejumTotal / totais.diasComJejum).toFixed(1)}h`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
});

export default TimelineSemanal;
