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
    <div className="animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-light mb-6 tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Agenda Semanal
      </h2>
      <div className="rounded-lg overflow-hidden shadow-soft border border-gray-200">
        {/* Header de horas */}
        <div className="flex border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="w-20 flex-shrink-0 p-3 font-bold text-xs text-gray-800 border-r border-gray-200">
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
        {diasOrdenados.map((dia, diaIdx) => {
          const diaRefeicoes = refeicoes[dia] || [];
          return (
            <div
              key={dia}
              className={`flex border-b border-gray-200 last:border-b-0 transition-all hover:bg-slate-50 ${
                diaIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <div className="min-w-[85px] w-auto flex-shrink-0 p-3 text-xs text-gray-700 border-r border-gray-200 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
                <span className="font-bold mt-1 text-gray-800">{dia}</span>

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
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20 group cursor-pointer"
                      style={{ left: `${position}%` }}
                      title={`${ref.nome} - ${ref.hora}:00`}
                    >
                      <span className="text-2xl emoji-enhanced group-hover:scale-125 transition-transform duration-200 filter drop-shadow-md">
                        {simbolo.emoji}
                      </span>
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
            <div className="flex border-t-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="w-20 flex-shrink-0 p-3 text-xs font-bold text-gray-900 border-r border-gray-200 flex items-center justify-center">
                Total
              </div>
              <div className="flex-1 p-3 text-sm text-gray-800 flex items-center">
                <div className="w-full">
                  <div className="text-xs font-medium">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-white shadow-sm mr-2">
                      <strong className="text-primary-600">{totais.kcal}</strong>&nbsp;kcal
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-white shadow-sm mr-2">
                      <strong className="text-green-600">{totais.prot}g</strong>&nbsp;P
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-white shadow-sm mr-2">
                      <strong className="text-yellow-600">{totais.carb}g</strong>&nbsp;C
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-white shadow-sm mr-2">
                      <strong className="text-orange-600">{totais.gord}g</strong>&nbsp;G
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 mt-2 flex items-center gap-2">
                    <span className="font-semibold">Média diária:</span>
                    <span className="text-primary-700 font-medium">{(totais.kcal / 7).toFixed(0)} kcal</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-green-700 font-medium">{(totais.prot / 7).toFixed(0)}g P</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-yellow-700 font-medium">{(totais.carb / 7).toFixed(0)}g C</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-orange-700 font-medium">{(totais.gord / 7).toFixed(0)}g G</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1.5">
                    <span className="font-semibold">Jejum total:</span> {totais.jejumTotal}h
                    {totais.diasComJejum > 0 && (
                      <span className="ml-2 text-jejum-500 font-medium">
                        • média: {(totais.jejumTotal / totais.diasComJejum).toFixed(1)}h/dia
                      </span>
                    )}
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
