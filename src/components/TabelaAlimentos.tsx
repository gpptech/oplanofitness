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
    <div className="min-h-[calc(100vh-12rem)]">
      <h2 className="text-xl sm:text-2xl font-light mb-4 tracking-tight">
        Base de Alimentos
      </h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search size={14} className="inline mr-1" />
            Buscar por nome:
          </label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite para filtrar..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por categoria:
          </label>
          <input
            type="text"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            placeholder="Ex: Carne, Arroz..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:flex-shrink-0">
          <button
            onClick={limparFiltros}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        Mostrando {alimentosFiltrados.length} de {alimentos.length} alimentos
      </div>

      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-28rem)] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    ID
                    {ordenarPor === "id" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("nome")}
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Nome
                    {ordenarPor === "nome" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("categoria")}
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Categoria
                    {ordenarPor === "categoria" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("porcao")}
                  className="px-4 py-3 text-right font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Porção (g)
                    {ordenarPor === "porcao" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("kcal")}
                  className="px-4 py-3 text-right font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Kcal
                    {ordenarPor === "kcal" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("prot")}
                  className="px-4 py-3 text-right font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Prot (g)
                    {ordenarPor === "prot" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("carb")}
                  className="px-4 py-3 text-right font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Carb (g)
                    {ordenarPor === "carb" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("gord")}
                  className="px-4 py-3 text-right font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Gord (g)
                    {ordenarPor === "gord" &&
                      (ordenarDirecao === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {alimentosFiltrados.map((alimento, idx) => (
                <tr
                  key={alimento.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 text-gray-600">{alimento.id}</td>
                  <td className="px-4 py-2 text-gray-800 font-medium">
                    {alimento.nome}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {alimento.categoria}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {alimento.porcao}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800 font-medium">
                    {alimento.kcal}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {alimento.prot}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {alimento.carb}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {alimento.gord}
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
