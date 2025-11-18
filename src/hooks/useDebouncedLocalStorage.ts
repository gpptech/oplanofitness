import { useEffect, useRef } from 'react';

/**
 * Hook para salvar dados no localStorage com debounce
 * Evita bloqueios síncronos constantes agrupando múltiplos writes em batch único
 *
 * @param key - Chave do localStorage
 * @param value - Valor a ser salvo (será serializado com JSON.stringify)
 * @param delay - Delay em ms para debounce (padrão: 500ms)
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  value: T,
  delay: number = 500
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpa timeout anterior se valor mudar antes do delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Agenda novo write após delay
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`[useDebouncedLocalStorage] Erro ao salvar ${key}:`, error);
      }
    }, delay);

    // Cleanup ao desmontar componente
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay]);
}
