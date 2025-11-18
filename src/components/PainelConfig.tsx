import React from "react";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";

interface PainelConfigProps {
  config: any;
  refeicoes: any;
  TODOS_DIAS: string[];
  abaSelecionada: string;
  setAbaSelecionada: (aba: string) => void;
  setConfig: (config: any) => void;
  adicionarRefeicao: (dia: string) => void;
  removerRefeicao: (dia: string, id: string) => void;
  atualizarRefeicao: (dia: string, id: string, campo: string, valor: any) => void;
  atualizarMeta: (dia: string, id: string, macro: string, valor: any) => void;
  novoAlimentoPrompt: string;
  setNovoAlimentoPrompt: (value: string) => void;
  adicionandoAlimento: boolean;
  feedbackAlimento: any;
  handleAdicionarAlimento: () => void;
  salvarComoPadrao: () => void;
  restaurarPadroesOriginais: () => void;
  fullscreen?: boolean;
}

export default function PainelConfig({
  config,
  refeicoes,
  TODOS_DIAS,
  abaSelecionada,
  setAbaSelecionada,
  setConfig,
  adicionarRefeicao,
  removerRefeicao,
  atualizarRefeicao,
  atualizarMeta,
  novoAlimentoPrompt,
  setNovoAlimentoPrompt,
  adicionandoAlimento,
  feedbackAlimento,
  handleAdicionarAlimento,
  salvarComoPadrao,
  restaurarPadroesOriginais,
  fullscreen = false,
}: PainelConfigProps) {
  const containerClass = fullscreen
    ? "min-h-[calc(100vh-12rem)]"
    : "";
  const contentHeight = fullscreen
    ? "max-h-[calc(100vh-24rem)]"
    : "max-h-[600px]";

  return (
    <div className={containerClass}>
      <div className="bg-gray-50 border border-gray-200 rounded overflow-hidden max-w-4xl mx-auto">
        {/* Abas */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setAbaSelecionada("visual")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              abaSelecionada === "visual"
                ? "bg-white text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Visual
          </button>
          <button
            onClick={() => setAbaSelecionada("refeicoes")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              abaSelecionada === "refeicoes"
                ? "bg-white text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Refeições
          </button>
          <button
            onClick={() => setAbaSelecionada("alimentos")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              abaSelecionada === "alimentos"
                ? "bg-white text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Adicionar Alimento
          </button>
        </div>

        <div className={`p-6 ${contentHeight} overflow-y-auto`}>
          {abaSelecionada === "visual" && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Configurações Visuais
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primeiro dia:
                  </label>
                  <select
                    value={config.primeiroDia}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        primeiroDia: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {TODOS_DIAS.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora início/fim:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={config.horaInicio}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          horaInicio: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={config.horaFim}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          horaFim: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Símbolos das refeições:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(config.simbolos).map(
                    ([tipo, { emoji, label }]: [string, any]) => (
                      <div key={tipo} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20">
                          {label}:
                        </span>
                        <input
                          type="text"
                          value={emoji}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              simbolos: {
                                ...config.simbolos,
                                [tipo]: {
                                  ...config.simbolos[tipo],
                                  emoji: e.target.value,
                                },
                              },
                            })
                          }
                          className="border border-gray-300 rounded px-3 py-1 text-sm w-20 text-center"
                          maxLength={10}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {abaSelecionada === "refeicoes" && (
            <div>
              <h3 className="text-lg font-medium mb-4">Editar Refeições</h3>

              {/* Grid com cartões por dia */}
              <div className="grid grid-cols-2 gap-4">
                {TODOS_DIAS.map((dia) => (
                  <div key={dia} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{dia}</h4>
                      <button
                        onClick={() => adicionarRefeicao(dia)}
                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-2">
                      {refeicoes[dia]?.map((ref: any) => (
                        <div
                          key={ref.id}
                          className="bg-white border border-gray-200 rounded p-2 text-xs space-y-1"
                        >
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={ref.hora}
                              onChange={(e) =>
                                atualizarRefeicao(
                                  dia,
                                  ref.id,
                                  "hora",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-12 border border-gray-300 rounded px-1 py-1 text-xs"
                              min="0"
                              max="23"
                            />
                            <select
                              value={ref.tipo}
                              onChange={(e) =>
                                atualizarRefeicao(
                                  dia,
                                  ref.id,
                                  "tipo",
                                  e.target.value,
                                )
                              }
                              className="flex-1 border border-gray-300 rounded px-1 py-1 text-xs"
                            >
                              <option value="cafe">☕</option>
                              <option value="lanche">🥪</option>
                              <option value="almoco">🍽️</option>
                              <option value="jantar">🍝</option>
                              <option value="whey">💪</option>
                              <option value="lixo">🎉</option>
                            </select>
                            <button
                              onClick={() => removerRefeicao(dia, ref.id)}
                              className="px-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              ×
                            </button>
                          </div>
                          <input
                            type="text"
                            value={ref.nome}
                            onChange={(e) =>
                              atualizarRefeicao(
                                dia,
                                ref.id,
                                "nome",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                            placeholder="Nome"
                          />
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={ref.meta.prot}
                              onChange={(e) =>
                                atualizarMeta(
                                  dia,
                                  ref.id,
                                  "prot",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                              placeholder="P"
                            />
                            <input
                              type="number"
                              value={ref.meta.carb}
                              onChange={(e) =>
                                atualizarMeta(
                                  dia,
                                  ref.id,
                                  "carb",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                              placeholder="C"
                            />
                            <input
                              type="number"
                              value={ref.meta.gord}
                              onChange={(e) =>
                                atualizarMeta(
                                  dia,
                                  ref.id,
                                  "gord",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                              placeholder="G"
                            />
                          </div>
                        </div>
                      ))}
                      {refeicoes[dia]?.length === 0 && (
                        <div className="text-xs text-gray-400 italic text-center py-2">
                          Jejum 24h
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {abaSelecionada === "alimentos" && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Adicionar Novo Alimento
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do alimento (ex: "Omelete com aveia 300g"):
                  </label>
                  <textarea
                    value={novoAlimentoPrompt}
                    onChange={(e) => setNovoAlimentoPrompt(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[100px]"
                    placeholder="Descreva o alimento com detalhes: nome, porção, ingredientes principais..."
                    disabled={adicionandoAlimento}
                  />
                </div>

                <button
                  onClick={handleAdicionarAlimento}
                  disabled={adicionandoAlimento || !novoAlimentoPrompt.trim()}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {adicionandoAlimento ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Adicionar Alimento
                    </>
                  )}
                </button>

                {feedbackAlimento && (
                  <div
                    className={`p-3 rounded text-sm flex items-start gap-2 ${
                      feedbackAlimento.tipo === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : feedbackAlimento.tipo === "duplicate"
                          ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {feedbackAlimento.tipo === "success" ? (
                      <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    )}
                    <span>{feedbackAlimento.mensagem}</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                  <strong>💡 Dica:</strong> Seja o mais específico possível.
                  Inclua:
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Nome do alimento ou preparação</li>
                    <li>Peso em gramas ou porção</li>
                    <li>Ingredientes principais (se for um prato)</li>
                    <li>Macros estimados (opcional)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={salvarComoPadrao}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Salvar como Padrão
            </button>
            <button
              onClick={restaurarPadroesOriginais}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Restaurar Original
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
