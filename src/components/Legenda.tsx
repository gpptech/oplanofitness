import React from "react";

interface LegendaProps {
  simbolos: {
    [tipo: string]: {
      emoji: string;
      label: string;
    };
  };
}

export default function Legenda({ simbolos }: LegendaProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
      {Object.entries(simbolos).map(([tipo, { emoji, label }]) => (
        <div
          key={tipo}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all cursor-default hover:scale-105"
        >
          <span className="text-xl emoji-enhanced">{emoji}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">{label}</span>
        </div>
      ))}
    </div>
  );
}
