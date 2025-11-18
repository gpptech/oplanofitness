// src/components/RefeicaoBuilder.tsx

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAllAlimentos, getCategorias } from '../services/alimentosService';
import { createRefeicao, updateRefeicao, deleteRefeicao, getRefeicaoById } from '../services/refeicoesService';
import type { Alimento, ItemCreate, RefeicaoCreate } from '../types';
import FoodSearchBar from './FoodSearchBar';

interface RefeicaoBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (refeicao?: { id: number; nome: string; totais: any }) => void;

  // Novos parâmetros para suportar edição/visualização
  refeicaoId?: number | null;  // ID da refeição para editar (null = criar)
  readonly?: boolean;          // true = modo visualização (não edita)
}

interface ItemSelecionado extends ItemCreate {
  alimento?: Alimento;
}

// Tipos sincronizados com app_config.json (valores sem acentos para DB)
const TIPOS_REFEICAO = [
  { value: 'cafe', label: 'Café' },
  { value: 'lanche', label: 'Lanche' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'whey', label: 'Whey' },
  { value: 'lixo', label: 'Lixo' },
];

export default function RefeicaoBuilder({ isOpen, onClose, onSuccess, refeicaoId, readonly }: RefeicaoBuilderProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('almoco');
  const [descricao, setDescricao] = useState('');
  const [tags, setTags] = useState('');

  const [categorias, setCategorias] = useState<string[]>([]);
  const [alimentosPorCategoria, setAlimentosPorCategoria] = useState<Alimento[]>([]);
  const [todosAlimentos, setTodosAlimentos] = useState<Alimento[]>([]); // Para busca inteligente
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingAlimentos, setLoadingAlimentos] = useState(false);
  const [loadingTodosAlimentos, setLoadingTodosAlimentos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Novos estados para edição/visualização
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [loadingRefeicao, setLoadingRefeicao] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  // Detectar modo e carregar refeição se necessário
  useEffect(() => {
    if (isOpen) {
      if (refeicaoId) {
        setMode(readonly ? 'view' : 'edit');
        loadRefeicao(refeicaoId);
      } else {
        setMode('create');
        loadCategorias();
        loadTodosAlimentos();
      }
    }
  }, [isOpen, refeicaoId, readonly]);

  const loadCategorias = async () => {
    try {
      const cats = await getCategorias();
      setCategorias(cats);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  // Carregar refeição existente (para edição/visualização)
  const loadRefeicao = async (id: number) => {
    setLoadingRefeicao(true);
    try {
      const ref = await getRefeicaoById(id);

      setNome(ref.nome);
      setTipo(ref.tipo);
      setDescricao(ref.descricao || '');
      setTags(ref.tags || '');

      // Carregar itens como itensSelecionados
      const itensCarregados = ref.itens.map((item: any) => ({
        alimento_id: item.alimento_id,
        gramas: item.gramas,
        alimento: {
          id: item.alimento_id,
          nome: item.alimento_nome,
          categoria: item.categoria,
          porcao: item.alimento_porcao_g,
          kcal: item.alimento_kcal,
          prot: item.alimento_prot_g,
          carb: item.alimento_carb_g,
          gord: item.alimento_gord_g,
        }
      }));

      setItensSelecionados(itensCarregados);

      // Carregar categorias e alimentos apenas se não for readonly
      if (!readonly) {
        loadCategorias();
        loadTodosAlimentos();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeição');
    } finally {
      setLoadingRefeicao(false);
    }
  };

  // Carregar todos os alimentos (para busca inteligente)
  const loadTodosAlimentos = async () => {
    setLoadingTodosAlimentos(true);
    try {
      const foods = await getAllAlimentos(); // Sem filtro de categoria
      setTodosAlimentos(foods);
    } catch (err) {
      console.error('Erro ao carregar todos os alimentos:', err);
    } finally {
      setLoadingTodosAlimentos(false);
    }
  };

  const loadAlimentosPorCategoria = async (categoria: string) => {
    setLoadingAlimentos(true);
    try {
      const foods = await getAllAlimentos(categoria);
      setAlimentosPorCategoria(foods);
      setCategoriaExpandida(categoria);
    } catch (err) {
      console.error('Erro ao carregar alimentos:', err);
    } finally {
      setLoadingAlimentos(false);
    }
  };

  const toggleCategoria = (categoria: string) => {
    if (categoriaExpandida === categoria) {
      setCategoriaExpandida(null);
      setAlimentosPorCategoria([]);
    } else {
      loadAlimentosPorCategoria(categoria);
    }
  };

  const adicionarAlimento = (alimento: Alimento) => {
    setItensSelecionados(prev => [
      ...prev,
      {
        alimento_id: alimento.id,
        gramas: alimento.porcao,
        alimento,
      }
    ]);
  };

  const removerItem = (index: number) => {
    setItensSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarGramas = (index: number, gramas: number) => {
    setItensSelecionados(prev => prev.map((item, i) =>
      i === index ? { ...item, gramas } : item
    ));
  };

  const calcularTotais = () => {
    return itensSelecionados.reduce((acc, item) => {
      if (!item.alimento) return acc;
      const fator = item.gramas / item.alimento.porcao;
      return {
        kcal: acc.kcal + (item.alimento.kcal * fator),
        prot: acc.prot + (item.alimento.prot * fator),
        carb: acc.carb + (item.alimento.carb * fator),
        gord: acc.gord + (item.alimento.gord * fator),
      };
    }, { kcal: 0, prot: 0, carb: 0, gord: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (itensSelecionados.length === 0) {
      setError('Adicione pelo menos um alimento à refeição');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (mode === 'create') {
        // CRIAR nova refeição
        const refeicao: RefeicaoCreate = {
          nome,
          tipo,
          descricao: descricao || undefined,
          tags: tags || undefined,
          itens: itensSelecionados.map(item => ({
            alimento_id: item.alimento_id,
            gramas: item.gramas,
          })),
        };

        const result = await createRefeicao(refeicao);
        setSuccess(true);

        setTimeout(() => {
          if (onSuccess) onSuccess(result);
          handleClose();
        }, 1500);

      } else if (mode === 'edit') {
        // ATUALIZAR refeição existente (apenas metadados, itens ficam readonly)
        const updates = {
          nome,
          tipo,
          descricao: descricao || undefined,
          tags: tags || undefined,
        };

        await updateRefeicao(refeicaoId!, updates);
        setSuccess(true);

        setTimeout(() => {
          if (onSuccess) onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} refeição`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmarExclusao) {
      setConfirmarExclusao(true);
      return;
    }

    setDeletando(true);
    setError(null);

    try {
      await deleteRefeicao(refeicaoId!);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir refeição');
    } finally {
      setDeletando(false);
      setConfirmarExclusao(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setTipo('almoco');
    setDescricao('');
    setTags('');
    setItensSelecionados([]);
    setCategoriaExpandida(null);
    setAlimentosPorCategoria([]);
    setTodosAlimentos([]);
    setError(null);
    setSuccess(false);
    setConfirmarExclusao(false);
    setDeletando(false);
    onClose();
  };

  if (!isOpen) return null;

  const totais = calcularTotais();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Save className="w-6 h-6 text-green-600" />
                Criar Nova Refeição
              </>
            ) : mode === 'edit' ? (
              <>
                <Save className="w-6 h-6 text-blue-600" />
                Editar Refeição
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-gray-600" />
                Detalhes da Refeição
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loadingRefeicao ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Carregando refeição...</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mensagens */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Erro</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Sucesso!</p>
                  <p className="text-sm text-green-700 mt-1">Refeição criada com sucesso</p>
                </div>
              </div>
            )}

            <div className={`grid gap-6 ${mode === 'create' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {/* Coluna 1: Informações da Refeição */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Informações
                </h3>

                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Refeição *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={readonly}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      readonly ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="Ex: Almoço Proteico"
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    disabled={readonly}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      readonly ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                  >
                    {TIPOS_REFEICAO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    disabled={readonly}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      readonly ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="Ex: Refeição rica em proteínas..."
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={readonly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      readonly ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="Ex: low-carb, high-protein"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separadas por vírgula</p>
                </div>

                {/* Totais */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Totais Nutricionais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calorias:</span>
                      <span className="font-semibold">{Math.round(totais.kcal)} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proteínas:</span>
                      <span className="font-semibold text-red-600">{Math.round(totais.prot)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carboidratos:</span>
                      <span className="font-semibold text-blue-600">{Math.round(totais.carb)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gorduras:</span>
                      <span className="font-semibold text-yellow-600">{Math.round(totais.gord)}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Seleção de Alimentos (apenas em modo criar) */}
              {mode === 'create' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Adicionar Alimentos
                </h3>

                {/* Busca Inteligente */}
                {loadingTodosAlimentos ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 mt-2">Carregando alimentos...</p>
                  </div>
                ) : (
                  <FoodSearchBar
                    alimentos={todosAlimentos}
                    nome={nome}
                    descricao={descricao}
                    alimentosSelecionadosIds={itensSelecionados.map(item => item.alimento_id)}
                    onAddAlimento={adicionarAlimento}
                    disabled={categoriaExpandida !== null}
                  />
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ou navegue por categoria</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {categorias.map(categoria => (
                    <div key={categoria} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCategoria(categoria)}
                        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {categoria.replace(/_/g, ' ')}
                        </span>
                        {categoriaExpandida === categoria ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {categoriaExpandida === categoria && (
                        <div className="p-2 bg-white space-y-1">
                          {loadingAlimentos ? (
                            <div className="text-center py-4">
                              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                            </div>
                          ) : alimentosPorCategoria.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">Nenhum alimento</p>
                          ) : (
                            alimentosPorCategoria.map(alimento => (
                              <button
                                key={alimento.id}
                                type="button"
                                onClick={() => adicionarAlimento(alimento)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded transition-colors flex items-center justify-between group"
                              >
                                <span className="text-gray-700">{alimento.nome}</span>
                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Coluna 3: Itens Selecionados */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Composição ({itensSelecionados.length} {itensSelecionados.length === 1 ? 'item' : 'itens'})
                </h3>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {itensSelecionados.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500">Nenhum alimento adicionado</p>
                      <p className="text-xs text-gray-400 mt-1">Selecione alimentos da lista ao lado</p>
                    </div>
                  ) : (
                    itensSelecionados.map((item, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {item.alimento?.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.alimento?.categoria.replace(/_/g, ' ')}
                            </p>
                          </div>
                          {!readonly && (
                          <button
                            type="button"
                            onClick={() => removerItem(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantidade (g)
                          </label>
                          <input
                            type="number"
                            value={item.gramas}
                            onChange={(e) => atualizarGramas(index, parseFloat(e.target.value) || 0)}
                            disabled={readonly}
                            min="1"
                            step="1"
                            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${
                              readonly ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-1 focus:ring-green-500 focus:border-green-500'
                            }`}
                          />
                        </div>

                        {item.alimento && (
                          <div className="text-xs text-gray-600 pt-1 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              <span>Kcal: {Math.round((item.alimento.kcal / item.alimento.porcao) * item.gramas)}</span>
                              <span>P: {Math.round((item.alimento.prot / item.alimento.porcao) * item.gramas)}g</span>
                              <span>C: {Math.round((item.alimento.carb / item.alimento.porcao) * item.gramas)}g</span>
                              <span>G: {Math.round((item.alimento.gord / item.alimento.porcao) * item.gramas)}g</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* Botão Excluir (apenas em modo view/edit) */}
          {mode !== 'create' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletando}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                confirmarExclusao
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {deletando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Excluindo...
                </>
              ) : confirmarExclusao ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Confirmar Exclusão?
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Excluir Refeição
                </>
              )}
            </button>
          )}

          <div className="flex-1" /> {/* Spacer */}

          {/* Botões Cancelar/Salvar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || deletando}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {readonly ? 'Fechar' : 'Cancelar'}
            </button>

            {!readonly && (
              <button
                onClick={handleSubmit}
                disabled={loading || success || itensSelecionados.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
                  mode === 'create' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'create' ? 'Criando...' : 'Atualizando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === 'create' ? 'Criar Refeição' : 'Atualizar Refeição'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
