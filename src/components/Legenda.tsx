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
    <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
      {Object.entries(simbolos).map(([tipo, { emoji, label }]) => (
        <div key={tipo} className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-xs sm:text-sm text-gray-700">{label}</span>
        </div>
      ))}
    </div>
  );
}
