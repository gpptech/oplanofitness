// src/components/GerenciadorRefeicoes.tsx

import React, { useState, useEffect, memo } from 'react';
import { Plus, Search, Edit2, Eye, Trash2, ChevronDown, Filter, X } from 'lucide-react';
import { getRefeicoes, deleteRefeicao } from '../services/refeicoesService';
import type { RefeicaoComTotais } from '../types';

interface GerenciadorRefeicoesProps {
  onCriarRefeicao: () => void;
  onEditarRefeicao: (refeicao: any) => void;
  onVisualizarRefeicao: (refeicao: any) => void;
}

// Tipos sincronizados com app_config.json
const TIPOS_REFEICAO = [
  { value: 'cafe', label: 'Café', emoji: '☕' },
  { value: 'lanche', label: 'Lanche', emoji: '🥪' },
  { value: 'almoco', label: 'Almoço', emoji: '🍽️' },
  { value: 'jantar', label: 'Jantar', emoji: '🥩' },
  { value: 'whey', label: 'Whey', emoji: '💪' },
  { value: 'lixo', label: 'Lixo', emoji: '🍕' },
];

const GerenciadorRefeicoes = memo(function GerenciadorRefeicoes({
  onCriarRefeicao,
  onEditarRefeicao,
  onVisualizarRefeicao,
}: GerenciadorRefeicoesProps) {
  const [refeicoes, setRefeicoes] = useState<RefeicaoComTotais[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    carregarRefeicoes();
  }, []);

  const carregarRefeicoes = async () => {
    setLoading(true);
    try {
      const resultado = await getRefeicoes(undefined, 100);
      setRefeicoes(resultado);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
      alert('Erro ao carregar refeições. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirRefeicao = async (id: number) => {
    if (confirmarExclusao !== id) {
      setConfirmarExclusao(id);
      return;
    }

    setDeletando(true);
    try {
      await deleteRefeicao(id);
      await carregarRefeicoes();
      setConfirmarExclusao(null);
    } catch (error) {
      console.error('Erro ao excluir refeição:', error);
      alert('Erro ao excluir refeição. Tente novamente.');
    } finally {
      setDeletando(false);
    }
  };

  // Filtrar refeições
  const refeicoesFiltradas = refeicoes.filter((ref) => {
    const matchBusca = ref.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       ref.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = !filtroTipo || ref.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const getTipoInfo = (tipo: string) => {
    return TIPOS_REFEICAO.find(t => t.value === tipo) || { label: tipo, emoji: '🍴' };
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] max-w-7xl mx-auto">
      {/* Header com ações */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-tight text-gray-800">
            Gerenciar Refeições
          </h2>
          <button
            onClick={onCriarRefeicao}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus size={20} />
            Nova Refeição
          </button>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
              mostrarFiltros || filtroTipo
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filtros
            {filtroTipo && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">1</span>}
          </button>
        </div>

        {/* Painel de filtros */}
        {mostrarFiltros && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Filtros</h3>
              {filtroTipo && (
                <button
                  onClick={() => setFiltroTipo('')}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {TIPOS_REFEICAO.map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => setFiltroTipo(filtroTipo === tipo.value ? '' : tipo.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filtroTipo === tipo.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{tipo.emoji}</span>
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de refeições */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="mb-3 text-4xl">⏳</div>
          <div>Carregando refeições...</div>
        </div>
      ) : refeicoesFiltradas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="mb-3 text-4xl">🍽️</div>
          <div className="font-medium">
            {busca || filtroTipo ? 'Nenhuma refeição encontrada' : 'Nenhuma refeição cadastrada'}
          </div>
          <div className="text-sm mt-2">
            {busca || filtroTipo
              ? 'Tente ajustar os filtros de busca'
              : 'Clique em "Nova Refeição" para começar'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {refeicoesFiltradas.map((refeicao) => {
            const tipoInfo = getTipoInfo(refeicao.tipo);
            return (
              <div
                key={refeicao.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header com tipo */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tipoInfo.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{refeicao.nome}</h3>
                      <p className="text-xs text-gray-600">{tipoInfo.label}</p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-3">
                  {/* Macros */}
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Proteína</div>
                      <div className="font-semibold text-gray-800">{refeicao.totais.prot}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Carbo</div>
                      <div className="font-semibold text-gray-800">{refeicao.totais.carb}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Gordura</div>
                      <div className="font-semibold text-gray-800">{refeicao.totais.gord}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Calorias</div>
                      <div className="font-semibold text-gray-800">{refeicao.totais.kcal}</div>
                    </div>
                  </div>

                  {/* Descrição */}
                  {refeicao.descricao && (
                    <p className="text-sm text-gray-600 line-clamp-2">{refeicao.descricao}</p>
                  )}

                  {/* Alimentos */}
                  {refeicao.itens && refeicao.itens.length > 0 && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="font-medium mb-1">Ingredientes:</div>
                      <div className="space-y-0.5">
                        {refeicao.itens.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span className="truncate">{item.alimento_nome}</span>
                            <span className="font-mono ml-2">{item.gramas}g</span>
                          </div>
                        ))}
                        {refeicao.itens.length > 3 && (
                          <div className="text-gray-400 italic">
                            +{refeicao.itens.length - 3} ingredientes...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => onVisualizarRefeicao(refeicao)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    onClick={() => onEditarRefeicao(refeicao)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluirRefeicao(refeicao.id)}
                    disabled={deletando && confirmarExclusao === refeicao.id}
                    className={`px-3 py-2 rounded transition-colors flex items-center justify-center ${
                      confirmarExclusao === refeicao.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                    }`}
                    title={confirmarExclusao === refeicao.id ? 'Clique novamente para confirmar' : 'Excluir'}
                  >
                    {deletando && confirmarExclusao === refeicao.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats footer */}
      {!loading && refeicoesFiltradas.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Mostrando {refeicoesFiltradas.length} de {refeicoes.length} refeições
          {(busca || filtroTipo) && ' (filtrado)'}
        </div>
      )}
    </div>
  );
});

export default GerenciadorRefeicoes;
