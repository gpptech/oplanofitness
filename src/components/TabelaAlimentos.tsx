import React, { memo } from "react";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { Alimento } from "../services/alimentosService";

interface TabelaAlimentosProps {
  alimentos: Alimento[];
  alimentosFiltrados: Alimento[];
  filtroNome: string;
  filtroCategoria: string;
  setFiltroNome: (value: string) => void;
  setFiltroCategoria: (value: string) => void;
  ordenarPor: string;
  ordenarDirecao: "asc" | "desc";
  handleSort: (campo: string) => void;
  limparFiltros: () => void;
}

const TabelaAlimentos = memo(function TabelaAlimentos({
  alimentos,
  alimentosFiltrados,
  filtroNome,
  filtroCategoria,
  setFiltroNome,
  setFiltroCategoria,
  ordenarPor,
  ordenarDirecao,
  handleSort,
  limparFiltros,
}: TabelaAlimentosProps) {
  return (
    <div className="min-h-[calc(100vh-12rem)] animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-light mb-4 tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Base de Alimentos
      </h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Search size={14} className="inline mr-1 text-primary-500" />
            Buscar por nome:
          </label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite para filtrar..."
            className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filtrar por categoria:
          </label>
          <input
            type="text"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            placeholder="Ex: Carne, Arroz..."
            className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          />
        </div>
        <div className="sm:flex-shrink-0">
          <button
            onClick={limparFiltros}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all text-sm font-medium shadow-sm"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-semibold">
          {alimentosFiltrados.length}
        </span>
        <span>de {alimentos.length} alimentos</span>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-card bg-white">
        <div className="overflow-x-auto max-h-[calc(100vh-28rem)] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  className="px-4 py-3 text-left font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center gap-1">
                    ID
                    {ordenarPor === "id" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("nome")}
                  className="px-4 py-3 text-left font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center gap-1">
                    Nome
                    {ordenarPor === "nome" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("categoria")}
                  className="px-4 py-3 text-left font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center gap-1">
                    Categoria
                    {ordenarPor === "categoria" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("porcao")}
                  className="px-4 py-3 text-right font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center justify-end gap-1">
                    Porção (g)
                    {ordenarPor === "porcao" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("kcal")}
                  className="px-4 py-3 text-right font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center justify-end gap-1">
                    Kcal
                    {ordenarPor === "kcal" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("prot")}
                  className="px-4 py-3 text-right font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center justify-end gap-1">
                    Prot (g)
                    {ordenarPor === "prot" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("carb")}
                  className="px-4 py-3 text-right font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center justify-end gap-1">
                    Carb (g)
                    {ordenarPor === "carb" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("gord")}
                  className="px-4 py-3 text-right font-semibold text-gray-800 cursor-pointer hover:bg-slate-200 transition-all"
                >
                  <div className="flex items-center justify-end gap-1">
                    Gord (g)
                    {ordenarPor === "gord" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} className="text-primary-600" />
                      ) : (
                        <ArrowDown size={14} className="text-primary-600" />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {alimentosFiltrados.map((alimento, idx) => (
                <tr
                  key={alimento.id}
                  className={`table-row-hover border-b border-gray-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-600 font-medium">{alimento.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    {alimento.nome}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      {alimento.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">
                    {alimento.porcao}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-primary-100 text-primary-800 font-bold text-xs">
                      {alimento.kcal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 font-bold text-xs">
                      {alimento.prot}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-bold text-xs">
                      {alimento.carb}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-orange-100 text-orange-800 font-bold text-xs">
                      {alimento.gord}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default TabelaAlimentos;
