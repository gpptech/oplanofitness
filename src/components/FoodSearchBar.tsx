// src/components/FoodSearchBar.tsx

import React, { useState } from 'react';
import { Search, Plus, Sparkles, X } from 'lucide-react';
import { useSmartFoodSearch } from '../hooks/useSmartFoodSearch';
import type { Alimento } from '../types';

interface FoodSearchBarProps {
  alimentos: Alimento[];
  nome: string;
  descricao: string;
  alimentosSelecionadosIds: number[];
  onAddAlimento: (alimento: Alimento) => void;
  disabled?: boolean;
}

export default function FoodSearchBar({
  alimentos,
  nome,
  descricao,
  alimentosSelecionadosIds,
  onAddAlimento,
  disabled = false,
}: FoodSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Hook de busca inteligente
  const sugestoes = useSmartFoodSearch({
    alimentos,
    nome,
    descricao,
    searchQuery,
    alimentosSelecionadosIds,
    maxResults: 5,
  });

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleAddAlimento = (alimento: Alimento) => {
    onAddAlimento(alimento);
    setSearchQuery(''); // Limpa busca após adicionar
  };

  // Calcula densidade proteica para visual feedback
  const getProteinDensity = (alimento: Alimento): 'high' | 'medium' | 'low' => {
    const protPorKcal = alimento.prot / (alimento.kcal || 1);
    if (protPorKcal > 0.15) return 'high'; // >15% calorias de proteína
    if (protPorKcal > 0.08) return 'medium';
    return 'low';
  };

  const densityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-3">
      {/* Barra de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          placeholder="Buscar alimentos... (Ex: frango, arroz, ovo)"
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sugestões inteligentes */}
      {sugestoes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-medium">
              {searchQuery ? 'Resultados da busca' : 'Sugestões baseadas na descrição'}
            </span>
          </div>

          <div className="space-y-1.5">
            {sugestoes.map((alimento) => {
              const density = getProteinDensity(alimento);

              return (
                <button
                  key={alimento.id}
                  type="button"
                  onClick={() => handleAddAlimento(alimento)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 hover:border-green-400 hover:bg-green-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Nome do alimento */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {alimento.nome}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${densityColors[density]}`}>
                          {density === 'high' ? 'P+' : density === 'medium' ? 'P' : ''}
                        </span>
                      </div>

                      {/* Macros */}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="font-medium">{alimento.kcal} kcal</span>
                        <span className="text-red-600">P: {alimento.prot}g</span>
                        <span className="text-blue-600">C: {alimento.carb}g</span>
                        <span className="text-yellow-600">G: {alimento.gord}g</span>
                      </div>

                      {/* Categoria */}
                      <div className="mt-1">
                        <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {alimento.categoria.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Botão adicionar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-green-600 flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensagem quando não há sugestões */}
      {sugestoes.length === 0 && (nome || descricao || searchQuery) && (
        <div className="text-center py-3 text-sm text-gray-400">
          {searchQuery
            ? 'Nenhum alimento encontrado'
            : 'Preencha o nome ou descrição para ver sugestões'}
        </div>
      )}
    </div>
  );
}
