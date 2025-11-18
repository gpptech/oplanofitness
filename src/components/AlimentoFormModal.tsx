// src/components/AlimentoFormModal.tsx

import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addAlimento } from '../services/alimentosService';
import type { AlimentoCreate, Alimento } from '../types';

interface AlimentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (alimento: Alimento) => void;
}

const CATEGORIAS_DISPONIVEIS = [
  'proteinas_magras',
  'proteinas_gordas',
  'carboidratos_complexos',
  'carboidratos_simples',
  'gorduras_saudaveis',
  'vegetais',
  'frutas',
  'laticinios',
  'bebidas',
  'suplementos',
  'outros'
];

const CONTEXTOS_CULINARIOS = [
  'cafe_manha',
  'almoco',
  'jantar',
  'lanche',
  'pre_treino',
  'pos_treino',
  'qualquer'
];

export default function AlimentoFormModal({ isOpen, onClose, onSuccess }: AlimentoFormModalProps) {
  const [formData, setFormData] = useState<AlimentoCreate>({
    nome: '',
    categoria: 'proteinas_magras',
    porcao_g: 100,
    kcal: 0,
    prot_g: 0,
    carb_g: 0,
    gord_g: 0,
    contexto_culinario: 'qualquer',
    incompativel_com: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_g') || name === 'porcao_g' || name === 'kcal'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await addAlimento(formData);
      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result.alimento);
        }
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar alimento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      categoria: 'proteinas_magras',
      porcao_g: 100,
      kcal: 0,
      prot_g: 0,
      carb_g: 0,
      gord_g: 0,
      contexto_culinario: 'qualquer',
      incompativel_com: '',
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600" />
            Adicionar Novo Alimento
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mensagens */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Erro</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Sucesso!</p>
                <p className="text-sm text-green-700 mt-1">Alimento adicionado com sucesso</p>
              </div>
            </div>
          )}

          {/* Informações básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Informações Básicas
            </h3>

            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Alimento *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Frango grelhado, Arroz integral, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIAS_DISPONIVEIS.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contexto_culinario" className="block text-sm font-medium text-gray-700 mb-1">
                  Contexto Culinário *
                </label>
                <select
                  id="contexto_culinario"
                  name="contexto_culinario"
                  value={formData.contexto_culinario}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CONTEXTOS_CULINARIOS.map(ctx => (
                    <option key={ctx} value={ctx}>
                      {ctx.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Valores nutricionais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Valores Nutricionais
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="porcao_g" className="block text-sm font-medium text-gray-700 mb-1">
                  Porção (g) *
                </label>
                <input
                  type="number"
                  id="porcao_g"
                  name="porcao_g"
                  value={formData.porcao_g}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Base de referência (ex: 100g)</p>
              </div>

              <div>
                <label htmlFor="kcal" className="block text-sm font-medium text-gray-700 mb-1">
                  Calorias (kcal) *
                </label>
                <input
                  type="number"
                  id="kcal"
                  name="kcal"
                  value={formData.kcal}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="prot_g" className="block text-sm font-medium text-gray-700 mb-1">
                  Proteína (g) *
                </label>
                <input
                  type="number"
                  id="prot_g"
                  name="prot_g"
                  value={formData.prot_g}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="carb_g" className="block text-sm font-medium text-gray-700 mb-1">
                  Carboidrato (g) *
                </label>
                <input
                  type="number"
                  id="carb_g"
                  name="carb_g"
                  value={formData.carb_g}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="gord_g" className="block text-sm font-medium text-gray-700 mb-1">
                  Gordura (g) *
                </label>
                <input
                  type="number"
                  id="gord_g"
                  name="gord_g"
                  value={formData.gord_g}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Informações Adicionais
            </h3>

            <div>
              <label htmlFor="incompativel_com" className="block text-sm font-medium text-gray-700 mb-1">
                Incompatível com (opcional)
              </label>
              <textarea
                id="incompativel_com"
                name="incompativel_com"
                value={formData.incompativel_com}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: lactose, glúten, etc."
              />
              <p className="text-xs text-gray-500 mt-1">Lista de restrições alimentares separadas por vírgula</p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar Alimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
