import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Settings,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Search,
  MessageSquare,
  Send,
  X,
  Menu,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getAllAlimentos,
  addFood,
  type Alimento,
  type AddFoodResponse,
} from "./src/services/alimentosService";
import {
  getRefeicoes,
  formatarParaUI,
  type RefeicaoComTotais,
} from "./src/services/refeicoesService";
import appConfigData from "./app_config.json";

// Componentes modulares
import Legenda from "./src/components/Legenda";
import TimelineSemanal from "./src/components/TimelineSemanal";
import SugestoesRefeicoes from "./src/components/SugestoesRefeicoes";
import PainelConfig from "./src/components/PainelConfig";
import TabelaAlimentos from "./src/components/TabelaAlimentos";
import AlimentoFormModal from "./src/components/AlimentoFormModal";
import RefeicaoBuilder from "./src/components/RefeicaoBuilder";
import GerenciadorRefeicoes from "./src/components/GerenciadorRefeicoes";
import { useDebouncedLocalStorage } from "./src/hooks/useDebouncedLocalStorage";
import { useRefeicoesPreload } from "./src/hooks/useRefeicoesPreload";

// Carregar configurações do arquivo JSON
const DEFAULT_VISUAL_CONFIG = appConfigData.visual;
const TODOS_DIAS = appConfigData.diasSemana;
const REFEICOES_INICIAIS = appConfigData.refeicoesPadrao;
const METAS_PADRAO = appConfigData.metasPadrao;
const TIPO_ORDER = appConfigData.tipoOrder;
// Normaliza metas ausentes com as metas padrão
for (const dia in REFEICOES_INICIAIS) {
  REFEICOES_INICIAIS[dia] = REFEICOES_INICIAIS[dia].map((r) => ({
    ...r,
    meta: r.meta || METAS_PADRAO[r.tipo],
  }));
}

// Configurações padrão
const DEFAULT_CONFIG = {
  primeiroDia: appConfigData.timeline.primeiroDia,
  horaInicio: appConfigData.timeline.horaInicio,
  horaFim: appConfigData.timeline.horaFim,
  simbolos: DEFAULT_VISUAL_CONFIG,
};

type ModoVisualizacao =
  | "pagina-unica"
  | "agenda"
  | "sugestoes"
  | "config"
  | "dados"
  | "gerenciador";

export default function MealPlanner() {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [carregandoAlimentos, setCarregandoAlimentos] = useState(true);
  const [refeicoes, setRefeicoes] = useState(() => {
    const saved = localStorage.getItem("mealPlannerRefeicoes");
    return saved ? JSON.parse(saved) : REFEICOES_INICIAIS;
  });
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("visual");
  // REPLACE (substituir inicialização config existente)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("mealPlannerConfig");
    const base = saved ? JSON.parse(saved) : DEFAULT_CONFIG;

    // defaults para as novas opções
    const defaults = {
      lowListOrderBy: "kcalPerProt", // opções: kcalPerProt | totals.kcal | totals.prot | nome
      lowListOrderDir: "asc", // asc | desc
      // quantidade por tipo (mapa tipo -> número)
      lowListPerTipoCount: TIPO_ORDER?.reduce((acc: any, t: string) => { acc[t] = 20; return acc; }, {}) || { cafe: 20, almoco: 20, lanche: 20, jantar: 20 },
    };

    return { ...base, ...defaults, ...base }; // base sobrescreve defaults se já existir
  });


  // Estados de navegação
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>(
    () => {
      const saved = localStorage.getItem("modoVisualizacao");
      if (!saved) return "pagina-unica";

      // Parse JSON se necessário (compatibilidade com useDebouncedLocalStorage)
      try {
        const parsed = JSON.parse(saved);
        return parsed || "pagina-unica";
      } catch {
        // Se não for JSON válido, retorna como string
        return saved as ModoVisualizacao;
      }
    },
  );
  const [menuAberto, setMenuAberto] = useState(false);

  // Estados para adicionar alimento
  const [novoAlimentoPrompt, setNovoAlimentoPrompt] = useState("");
  const [adicionandoAlimento, setAdicionandoAlimento] = useState(false);
  const [feedbackAlimento, setFeedbackAlimento] = useState<{
    tipo: "success" | "error" | "duplicate";
    mensagem: string;
  } | null>(null);

  // Estados para filtros e ordenação da tabela
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<keyof Alimento | "">("");
  const [ordenarDirecao, setOrdenarDirecao] = useState<"asc" | "desc">("asc");
    // <-- INSERIR AQUI: estados + loader de top eficiência
  const [lowKcalPerProt, setLowKcalPerProt] = useState<any[]>([]);
  const [carregandoLowList, setCarregandoLowList] = useState(false);

  // Estados para novos modais SMB
  const [mostrarAlimentoModal, setMostrarAlimentoModal] = useState(false);
  const [mostrarRefeicaoBuilder, setMostrarRefeicaoBuilder] = useState(false);

  // Estados para edição/visualização de refeições
  const [refeicaoParaEditar, setRefeicaoParaEditar] = useState<number | null>(null);
  const [modoRefeicaoReadonly, setModoRefeicaoReadonly] = useState(false);


  // Hook para pré-carregar refeições de todos os tipos
  const { pratosPorTipo, loading: loadingPreload } = useRefeicoesPreload(TIPO_ORDER, 10);

  const computeTotalsFromItens = (itens: any[]) => {
    const totals = itens.reduce(
      (acc: any, it: any) => {
        const kcal100 = Number(it.kcal_100g ?? it.kcal ?? 0);
        const prot100 = Number(it.prot_100g ?? it.prot ?? 0);
        const gramas = Number(it.gramas ?? it.porcao_base ?? 100);
        acc.kcal += (kcal100 * gramas) / 100;
        acc.prot += (prot100 * gramas) / 100;
        acc.carb += Number(it.carb_100g ?? it.carb ?? 0) * (gramas / 100);
        acc.gord += Number(it.gord_100g ?? it.gord ?? 0) * (gramas / 100);
        return acc;
      },
      { kcal: 0, prot: 0, carb: 0, gord: 0 },
    );
    return totals;
  };

  const carregarLowKcalPerProt = async () => {
    setCarregandoLowList(true);
    try {
      // Limite máximo do backend: 100
      const refeicoesAPI = await getRefeicoes(undefined, 100);

      // mapa com totals + kcalPerProt
      const mapped = refeicoesAPI.map((r: any) => {
        const totals = computeTotalsFromItens(r.itens || []);
        const kcalPerProt = totals.prot > 0 ? totals.kcal / totals.prot : Number.POSITIVE_INFINITY;
        return { ...r, totals, kcalPerProt };
      });

      // agrupar por tipo e pegar N por tipo conforme config.lowListPerTipoCount
      const perTipoCounts = config.lowListPerTipoCount || TIPO_ORDER.reduce((acc: any, t: string) => { acc[t] = 20; return acc; }, {});
      const grouped: Record<string, any[]> = {};
      mapped.forEach((r: any) => {
        const tipo = r.tipo || "outro";
        if (!grouped[tipo]) grouped[tipo] = [];
        grouped[tipo].push(r);
      });

      // aplicar ordenação por grupo
      const orderBy = config.lowListOrderBy || "kcalPerProt";
      const dir = (config.lowListOrderDir || "asc").toLowerCase() === "asc" ? 1 : -1;
      const sortFn = (a: any, b: any) => {
        const getVal = (obj: any) => {
          if (orderBy === "kcalPerProt") return obj.kcalPerProt;
          if (orderBy === "totals.kcal") return obj.totals?.kcal ?? 0;
          if (orderBy === "totals.prot") return obj.totals?.prot ?? 0;
          if (orderBy === "nome") return (obj.nome || "").toLowerCase();
          return obj.kcalPerProt;
        };
        const va = getVal(a), vb = getVal(b);
        if (typeof va === "string") return dir * va.localeCompare(vb);
        return dir * (va - vb);
      };

      let collected: any[] = [];
      Object.keys(perTipoCounts).forEach((tipo) => {
        const grupo = (grouped[tipo] || []).slice().sort(sortFn);
        const n = Number(perTipoCounts[tipo]) || 0;
        collected = collected.concat(grupo.slice(0, n));
      });

      // caso queira também garantir um conjunto global ordenado, reordenar globalmente
      collected = collected.sort(sortFn);

      setLowKcalPerProt(collected);
    } catch (err) {
      console.error("Erro em carregarLowKcalPerProt:", err);
      setLowKcalPerProt([]);
    } finally {
      setCarregandoLowList(false);
    }
  };

  // recarrega automaticamente quando config ou refeicoes mudam
  useEffect(() => {
    // stringify porque lowListPerTipoCount é objeto e precisamos detectar mudanças profundas
    carregarLowKcalPerProt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.lowListOrderBy, config.lowListOrderDir, JSON.stringify(config.lowListPerTipoCount), refeicoes]);


  // Carregar alimentos da API
  useEffect(() => {
    carregarAlimentos();
  }, []);

  const carregarAlimentos = () => {
    setCarregandoAlimentos(true);
    getAllAlimentos()
      .then((data) => {
        setAlimentos(data);
        setCarregandoAlimentos(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar alimentos:", error);
        setCarregandoAlimentos(false);
      });
  };

  // Salvar dados no localStorage com debounce para evitar bloqueios
  useDebouncedLocalStorage("mealPlannerConfig", config, 500);
  useDebouncedLocalStorage("mealPlannerRefeicoes", refeicoes, 500);
  useDebouncedLocalStorage("modoVisualizacao", modoVisualizacao, 500);

  // Limpeza única do localStorage corrompido (executa apenas na montagem)
  useEffect(() => {
    const keys = ["modoVisualizacao"];
    keys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value && value.startsWith('"') && value.endsWith('"')) {
        // Valor está com aspas extras - limpar
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === "string") {
            localStorage.setItem(key, JSON.stringify(parsed));
            console.log(`🧹 LocalStorage corrigido: ${key} = ${parsed}`);
          }
        } catch (e) {
          console.warn(`⚠️ Não foi possível limpar ${key}:`, e);
        }
      }
    });
  }, []); // Array vazio = executa apenas uma vez

  // Função para adicionar alimento
  const handleAdicionarAlimento = async () => {
    if (!novoAlimentoPrompt.trim()) return;

    setAdicionandoAlimento(true);
    setFeedbackAlimento(null);

    try {
      const response: AddFoodResponse = await addFood(novoAlimentoPrompt);

      if (response.status === "inserted") {
        setFeedbackAlimento({
          tipo: "success",
          mensagem: `Alimento adicionado com sucesso! ID: ${response.id}`,
        });
        setNovoAlimentoPrompt("");
        // Recarregar alimentos
        carregarAlimentos();
      } else if (response.status === "duplicate") {
        setFeedbackAlimento({
          tipo: "duplicate",
          mensagem:
            "Alimento duplicado detectado. Já existe um alimento similar no banco.",
        });
      }
    } catch (error) {
      setFeedbackAlimento({
        tipo: "error",
        mensagem: `Erro ao adicionar alimento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    } finally {
      setAdicionandoAlimento(false);
      // Limpar feedback após 5 segundos
      setTimeout(() => setFeedbackAlimento(null), 5000);
    }
  };

  // Função para enviar mensagem no chat
  const handleEnviarChat = async () => {
    if (!chatInput.trim() || enviandoChat) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    // Adicionar mensagem do usuário
    const newUserMessage = {
      role: "user" as const,
      content: userMessage,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, newUserMessage]);

    setEnviandoChat(true);

    try {
      const response = await fetch("http://localhost:8001/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Adicionar resposta do agente
      const agentMessage = {
        role: "agent" as const,
        content: data.response,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, agentMessage]);

      // Recarregar alimentos se o comando foi de adição/atualização/remoção
      if (
        userMessage
          .toLowerCase()
          .match(/adicion|adicione|remov|delete|atualize|update/)
      ) {
        carregarAlimentos();
      }
    } catch (error) {
      const errorMessage = {
        role: "agent" as const,
        content: `❌ Erro ao processar comando: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setEnviandoChat(false);
    }
  };

  // Função para salvar como padrão
  const salvarComoPadrao = () => {
    if (
      confirm(
        "Salvar configurações atuais como padrão? Isso irá sobrescrever as configurações salvas anteriormente.",
      )
    ) {
      localStorage.setItem("mealPlannerConfig", JSON.stringify(config));
      localStorage.setItem("mealPlannerRefeicoes", JSON.stringify(refeicoes));
      alert("Configurações salvas com sucesso!");
    }
  };

  // Função para restaurar padrões originais
  const restaurarPadroesOriginais = () => {
    if (
      confirm(
        "Restaurar todas as configurações para os valores originais do sistema?",
      )
    ) {
      setConfig(DEFAULT_CONFIG);
      setRefeicoes(REFEICOES_INICIAIS);
      localStorage.removeItem("mealPlannerConfig");
      localStorage.removeItem("mealPlannerRefeicoes");
      alert("Configurações restauradas!");
    }
  };

  // Funções para editar refeições
  const adicionarRefeicao = (dia: string) => {
    const tipoDefault = "almoco";
    const novaRefeicao = {
      id: `${dia.toLowerCase()}-nova-${Date.now()}`,
      hora: 12,
      tipo: tipoDefault,
      nome: "Nova Refeição",
      meta: METAS_PADRAO[tipoDefault],
    };
    setRefeicoes({
      ...refeicoes,
      [dia]: [...(refeicoes[dia] || []), novaRefeicao],
    });
  };

  const removerRefeicao = useCallback((dia: string, refeicaoId: string) => {
    setRefeicoes((prev) => ({
      ...prev,
      [dia]: prev[dia].filter((r: any) => r.id !== refeicaoId),
    }));
  }, []);

  const atualizarRefeicao = useCallback((
    dia: string,
    refeicaoId: string,
    campo: string,
    valor: any,
  ) => {
    setRefeicoes((prev) => ({
      ...prev,
      [dia]: prev[dia].map((r: any) =>
        r.id === refeicaoId ? { ...r, [campo]: valor } : r,
      ),
    }));
  }, []);

  const atualizarMeta = useCallback((
    dia: string,
    refeicaoId: string,
    campo: string,
    valor: string,
  ) => {
    setRefeicoes((prev) => ({
      ...prev,
      [dia]: prev[dia].map((r: any) =>
        r.id === refeicaoId
          ? { ...r, meta: { ...r.meta, [campo]: parseInt(valor) || 0 } }
          : r,
      ),
    }));
  }, []);

  // Calcular dias ordenados baseado no primeiro dia (memoizado)
  const diasOrdenados = useMemo(() => {
    const startIdx = TODOS_DIAS.indexOf(config.primeiroDia);
    return [...TODOS_DIAS.slice(startIdx), ...TODOS_DIAS.slice(0, startIdx)];
  }, [config.primeiroDia]);

  // Calcular horas visíveis baseado na configuração (memoizado)
  const horasVisiveis = useMemo(() => {
    return Array.from(
      { length: config.horaFim - config.horaInicio + 1 },
      (_, i) => i + config.horaInicio,
    );
  }, [config.horaInicio, config.horaFim]);

  // --------------------
  // RESUMOS POR DIA / TOTAIS
  // --------------------
  const getPrevDay = (dia: string) => {
    const idx = TODOS_DIAS.indexOf(dia);
    if (idx === -1) return TODOS_DIAS[TODOS_DIAS.length - 1];
    return TODOS_DIAS[(idx - 1 + TODOS_DIAS.length) % TODOS_DIAS.length];
  };

  // procura a última refeição *antes* do início do dia (voltando até 7 dias)
  const findLastMealBeforeDay = (dia: string) => {
    // começa no dia anterior e vai até 7 dias
    let searchDay = getPrevDay(dia);
    for (let i = 0; i < 7; i++) {
      const meals = refeicoes[searchDay] || [];
      if (meals.length > 0) {
        // retornar a maior hora desse dia
        const last = meals.reduce(
          (acc, r) => (r.hora > acc ? r.hora : acc),
          -1,
        );
        if (last >= 0) return { dia: searchDay, hora: last };
      }
      searchDay = getPrevDay(searchDay);
    }
    // nenhum encontrado: retornar null
    return null;
  };

  // calcula resumo do dia: soma P/C/G/kcal e horas de jejum (memoizado)
  const calcularResumoDia = useCallback((dia: string) => {
    const diaRefeicoes = (refeicoes[dia] || []).slice();
    // macros
    const totals = diaRefeicoes.reduce(
      (acc, r) => {
        acc.prot += r.meta?.prot || 0;
        acc.carb += r.meta?.carb || 0;
        acc.gord += r.meta?.gord || 0;
        acc.kcal += r.meta?.kcal || 0;
        return acc;
      },
      { prot: 0, carb: 0, gord: 0, kcal: 0 },
    );

    // jejum: precisa da primeira refeição do dia
    if (diaRefeicoes.length === 0) {
      // sem refeições: jejum full-day (representamos como null ou 24)
      return { ...totals, jejum: null, hasMeals: false };
    }

    const refeicoesSorted = diaRefeicoes.sort(
      (a: any, b: any) => a.hora - b.hora,
    );
    const firstHora = refeicoesSorted[0].hora;

    // achar última refeição "anterior" (pode ser no dia anterior imediato ou antes)
    const lastPrev = findLastMealBeforeDay(dia);

    let jejumHoras = null;
    if (lastPrev) {
      const prevHora = lastPrev.hora;
      // se prevHora <= firstHora e prevDia == dia anterior imediato => simples subtração
      // mas como é cíclico, calcular corretamente cruzando meia-noite:
      if (prevHora <= firstHora && getPrevDay(dia) === lastPrev.dia) {
        jejumHoras = firstHora - prevHora;
      } else {
        // cruzou meia-noite (prevHora é de dia anterior ou anterior ao anterior)
        jejumHoras = 24 - prevHora + firstHora;
      }
    } else {
      // se não encontrou nenhuma refeição anterior na semana, consideramos jejum desde config.horaFim?
      // aqui adotamos: jejum = (firstHora - config.horaInicio) como fallback
      jejumHoras = Math.max(0, firstHora - config.horaInicio);
    }

    return { ...totals, jejum: jejumHoras, hasMeals: true };
  }, [refeicoes, config.horaInicio]);

  // totais da semana (soma de P/C/G/kcal e soma de jejum) - memoizado
  const calcularTotaisSemana = useCallback(() => {
    const resumoPorDia = diasOrdenados.map((d) => calcularResumoDia(d));
    const week = resumoPorDia.reduce(
      (acc, r) => {
        acc.prot += r.prot;
        acc.carb += r.carb;
        acc.gord += r.gord;
        acc.kcal += r.kcal;
        if (r.jejum !== null && r.jejum !== undefined) {
          acc.jejum += r.jejum;
          acc.diasComJejum += 1;
        }
        return acc;
      },
      { prot: 0, carb: 0, gord: 0, kcal: 0, jejum: 0, diasComJejum: 0 },
    );

    return {
      prot: week.prot,
      carb: week.carb,
      gord: week.gord,
      kcal: week.kcal,
      jejumTotal: week.jejum,
      diasComJejum: week.diasComJejum,
    };
  }, [diasOrdenados, calcularResumoDia]);

  // Gerar pratos compostos INTELIGENTEMENTE usando smartMealBuilder
  const gerarPratosCompostos = async (tipo: string, meta: any) => {
    console.log(`[UI] Buscando refeições da API para tipo=${tipo}`);

    try {
      const refeicoesAPI = await getRefeicoes(tipo, 5);
      console.log(`[UI] Refeições carregadas da API: ${refeicoesAPI.length}`);
      return refeicoesAPI.map((ref) => formatarParaUI(ref));
    } catch (erro) {
      console.error(`[UI] Erro ao carregar refeições:`, erro);
      return [];
    }
  };

  // Filtrar e ordenar alimentos
  const alimentosFiltrados = useMemo(() => {
    let resultado = [...alimentos];

    // Aplicar filtros
    if (filtroNome) {
      resultado = resultado.filter((a) =>
        a.nome.toLowerCase().includes(filtroNome.toLowerCase()),
      );
    }

    if (filtroCategoria) {
      resultado = resultado.filter((a) =>
        a.categoria.toLowerCase().includes(filtroCategoria.toLowerCase()),
      );
    }

    // Aplicar ordenação
    if (ordenarPor) {
      resultado.sort((a, b) => {
        const aVal = a[ordenarPor];
        const bVal = b[ordenarPor];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return ordenarDirecao === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        const aNum = Number(aVal) || 0;
        const bNum = Number(bVal) || 0;
        return ordenarDirecao === "asc" ? aNum - bNum : bNum - aNum;
      });
    }

    return resultado;
  }, [alimentos, filtroNome, filtroCategoria, ordenarPor, ordenarDirecao]);

  // Função helper para ordenar
  const handleSort = (coluna: keyof Alimento) => {
    if (ordenarPor === coluna) {
      setOrdenarDirecao(ordenarDirecao === "asc" ? "desc" : "asc");
    } else {
      setOrdenarPor(coluna);
      setOrdenarDirecao("asc");
    }
  };

  // Handlers para edição/visualização de refeições
  const handleEditRefeicao = (prato: any) => {
    setRefeicaoParaEditar(prato.id);
    setModoRefeicaoReadonly(false);
    setMostrarRefeicaoBuilder(true);
  };

  const handleViewRefeicao = (prato: any) => {
    setRefeicaoParaEditar(prato.id);
    setModoRefeicaoReadonly(true);
    setMostrarRefeicaoBuilder(true);
  };

  const handleSuccessRefeicao = () => {
    // Recarregar lista de refeições
    preloadRef.current?.fetchAllTypes();
    setMostrarRefeicaoBuilder(false);
    setRefeicaoParaEditar(null);
    setModoRefeicaoReadonly(false);
  };

  if (carregandoAlimentos) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando alimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Menu lateral escondível */}
      {menuAberto && (
        <>
          {/* Overlay escuro */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
            onClick={() => setMenuAberto(false)}
          />
          {/* Menu */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setMenuAberto(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={20} className="text-gray-700" />
                </button>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "pagina-unica", label: "Página Única", icon: "📄" },
                  { id: "agenda", label: "Agenda", icon: "📅" },
                  { id: "sugestoes", label: "Sugestões", icon: "🍽️" },
                  { id: "gerenciador", label: "Gerenciar Refeições", icon: "🔧" },
                  { id: "config", label: "Configurações", icon: "⚙️" },
                  { id: "dados", label: "Base de Dados", icon: "📊" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setModoVisualizacao(item.id as ModoVisualizacao);
                      setMenuAberto(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      modoVisualizacao === item.id
                        ? "bg-gray-700 text-white font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      <div
        style={{
          marginLeft: "2.5%",
          marginRight: "2.5%",
          marginTop: "2.5%",
          marginBottom: "2.5%",
        }}

      >
        {/* Cabeçalho */}
        <div className="mb-8 sm:mb-12 pb-6 border-b border-gray-300 relative">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-center mb-2">
            Plano Alimentar Semanal
          </h1>
          <p className="text-center text-sm font-light text-gray-500 tracking-wide">
            Gabriel Pitta
          </p>

          {/* Botões de navegação e configurações */}
          <div className="absolute top-0 left-0 right-0 flex justify-between print:hidden">
            {/* Menu hambúrguer */}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Menu de navegação"
            >
              <Menu size={20} className="text-gray-700" />
            </button>

            {/* Botões à direita */}
            <div className="flex gap-2">
              {/* Botões globais (sempre visíveis) */}
              <button
                onClick={() => setMostrarAlimentoModal(true)}
                className="p-2 hover:bg-green-50 rounded transition-colors"
                title="Adicionar Alimento"
              >
                <Plus size={20} className="text-green-600" />
              </button>

              {/* Botões específicos do modo página única */}
              {modoVisualizacao === "pagina-unica" && (
                <button
                  onClick={() => setMostrarConfig(!mostrarConfig)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Configurações"
                >
                  <Settings size={20} className="text-gray-700" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modo Página Única - Layout original completo */}
        {modoVisualizacao === "pagina-unica" && (
          <>
            {/* Painel de Configurações - OTIMIZADO */}
            {mostrarConfig && (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded overflow-hidden max-w-4xl mx-auto">
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

                  <div className="p-6 max-h-[600px] overflow-y-auto">
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
                                <div
                                  key={tipo}
                                  className="flex items-center gap-3"
                                >
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
                        {/* INSERIR logo após "Símbolos das refeições:" (dentro de abaSelecionada === 'visual') */}
                        <div className="mt-6 border-t pt-4">
                          <h3 className="text-lg font-medium mb-2">Lista — Top eficiência</h3>

                          <div className="grid grid-cols-2 gap-3 items-end">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                              <select
                                value={config.lowListOrderBy}
                                onChange={(e) => setConfig({ ...config, lowListOrderBy: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              >
                                <option value="kcalPerProt">kcal / g proteína</option>
                                <option value="totals.kcal">kcal total</option>
                                <option value="totals.prot">proteína total</option>
                                <option value="nome">nome (alfabético)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Direção</label>
                              <select
                                value={config.lowListOrderDir}
                                onChange={(e) => setConfig({ ...config, lowListOrderDir: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              >
                                <option value="asc">Ascendente</option>
                                <option value="desc">Descendente</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Quantidade por tipo (ex.: 20)</div>
                            <div className="grid grid-cols-2 gap-2">
                              {TIPO_ORDER.map((t: string) => (
                                <div key={t} className="flex items-center gap-2">
                                  <div className="w-28 text-xs text-gray-700">{config.simbolos?.[t]?.label || t}</div>
                                  <input
                                    type="number"
                                    min={1}
                                    value={config.lowListPerTipoCount?.[t] ?? 20}
                                    onChange={(e) => {
                                      const val = Math.max(1, Number(e.target.value || 0));
                                      setConfig({ ...config, lowListPerTipoCount: { ...(config.lowListPerTipoCount || {}), [t]: val } });
                                    }}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              A lista será recarregada automaticamente quando você alterar essas opções.
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {abaSelecionada === "refeicoes" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Editar Refeições
                        </h3>

                        {/* Grid com cartões por dia */}
                        <div className="grid grid-cols-2 gap-4">
                          {TODOS_DIAS.map((dia) => (
                            <div
                              key={dia}
                              className="border border-gray-200 rounded p-3"
                            >
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
                                        onClick={() =>
                                          removerRefeicao(dia, ref.id)
                                        }
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
                              Descrição do alimento (ex: "Omelete com aveia
                              300g"):
                            </label>
                            <textarea
                              value={novoAlimentoPrompt}
                              onChange={(e) =>
                                setNovoAlimentoPrompt(e.target.value)
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[100px]"
                              placeholder="Descreva o alimento com detalhes: nome, porção, ingredientes principais..."
                              disabled={adicionandoAlimento}
                            />
                          </div>

                          <button
                            onClick={handleAdicionarAlimento}
                            disabled={
                              adicionandoAlimento || !novoAlimentoPrompt.trim()
                            }
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
                                <CheckCircle
                                  size={16}
                                  className="mt-0.5 flex-shrink-0"
                                />
                              ) : (
                                <AlertCircle
                                  size={16}
                                  className="mt-0.5 flex-shrink-0"
                                />
                              )}
                              <span>{feedbackAlimento.mensagem}</span>
                            </div>
                          )}

                          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                            <strong>💡 Dica:</strong> Seja o mais específico
                            possível. Inclua:
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
              )}

              {/* <-- INSERIR AQUI: lista Top eficiência (exibida por padrão) 
              <div className="mt-6 bg-white border border-gray-300 rounded-lg shadow-sm w-full mx-auto overflow-hidden p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Top refeições — eficiência (kcal / g proteína)</h3>
                  <div className="text-xs text-gray-500">Ordenado por: {config.lowListOrderBy} ({config.lowListOrderDir})</div>
                </div>

                {carregandoLowList ? (
                  <div className="text-sm text-gray-500">Carregando lista...</div>
                ) : lowKcalPerProt.length === 0 ? (
                  <div className="text-sm text-gray-400 italic">Nenhuma refeição encontrada.</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {lowKcalPerProt.map((r: any) => (
                      <div key={`${r.id}-${r.nome}`} className="p-2 border rounded flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium truncate max-w-[40ch]">{r.nome}</div>
                          <div className="text-xs text-gray-500">{r.tipo} • {r.contexto_culinario || "-"}</div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono">{isFinite(r.kcalPerProt) ? r.kcalPerProt.toFixed(2) : "—"} kcal / gP</div>
                          <div className="text-xs text-gray-500">
                            P: {r.totals?.prot?.toFixed(1) ?? "0"}g • K: {r.totals?.kcal?.toFixed(0) ?? "0"} kcal
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>*/}

              {/* Legenda */}
              <div className="mb-10 flex justify-center">
                <Legenda simbolos={config.simbolos} />
              </div>

              {/* Timeline Semanal */}
              <div className="mb-16">
                <h2 className="text-xl sm:text-2xl font-light mb-6 tracking-tight">
                  Agenda Semanal
                </h2>
                <div>
                  {/* Header de horas */}
                  <div className="flex border-b border-gray-100 bg-white">
                    <div className="w-20 flex-shrink-0 p-3 font-bold text-xs text-gray-700 border-r border-gray-100">
                      Dia
                    </div>
                    <div className="flex-1 relative">
                      {horasVisiveis.map((hora, idx) => {
                        const position =
                          (idx / (horasVisiveis.length - 1)) * 100;
                        return (
                          <div
                            key={hora}
                            className="absolute top-0 bottom-0 transform -translate-x-1/2 flex items-center z-10"
                            style={{ left: `${position}%` }}
                          >
                            <span className="text-xs p-2 font-semibold text-gray-700">
                              {hora}h
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dias */}
                  {diasOrdenados.map((dia) => {
                    const diaRefeicoes = refeicoes[dia] || [];
                    return (
                      <div
                        key={dia}
                        className="flex border-b border-gray-100 last:border-b-0 bg-white"
                      >
                        <div className="min-w-[85px] w-auto flex-shrink-0 p-3 text-xs text-gray-700 border-r border-gray-100 flex flex-col items-center justify-center">
                          <span className="font-bold">{dia}</span>

                          {/* Calcular resumo do dia */}
                          {(() => {
                            const resumo = calcularResumoDia(dia);
                            if (!resumo.hasMeals) {
                              return (
                                <span className="text-xs font-light text-gray-400">
                                  Jejum 24h
                                </span>
                              );
                            }
                            return (
                              <span className="text-[10px] font-light text-black text-center leading-tight mt-0.5">
                                {resumo.kcal} kcal
                                <br />
                                {resumo.prot}P · {resumo.carb}C · {resumo.gord}G{" "}
                                <br /> Maior jejum: {resumo.jejum}h
                              </span>
                            );
                          })()}
                        </div>

                        <div
                          className="flex-1 relative bg-white"
                          style={{ height: "42px" }}
                        >
                          {/* Grid de fundo */}
                          <div className="absolute inset-0 z-0">
                            {horasVisiveis.map((hora, idx) => {
                              const position =
                                (idx / (horasVisiveis.length - 1)) * 100;
                              return (
                                <div
                                  key={hora}
                                  className="absolute top-0 bottom-0 w-px bg-white"
                                  style={{ left: `${position}%` }}
                                />
                              );
                            })}
                          </div>

                          {/* Intervalos de jejum */}
                          {(() => {
                            const intervalos = [];
                            const refeicoesSorted = [...diaRefeicoes].sort(
                              (a, b) => a.hora - b.hora,
                            );

                            if (
                              refeicoesSorted.length > 0 &&
                              refeicoesSorted[0].hora > config.horaInicio
                            ) {
                              const horasJejum = refeicoesSorted[0].hora - 0; //config.horaInicio;
                              const inicio = config.horaInicio;
                              const fim = refeicoesSorted[0].hora;
                              const inicioIdx = inicio - config.horaInicio;
                              const fimIdx = fim - config.horaInicio;
                              const left =
                                (inicioIdx / (horasVisiveis.length - 1)) * 100;
                              const right =
                                (fimIdx / (horasVisiveis.length - 1)) * 100;

                              intervalos.push(
                                <div
                                  key="jejum-inicio"
                                  className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                                  style={{
                                    left: `${left}%`,
                                    width: `${right - left}%`,
                                  }}
                                >
                                  <span className="text-xs font-light text-black">
                                    {horasJejum}h
                                  </span>
                                </div>,
                              );
                            }

                            for (
                              let i = 0;
                              i < refeicoesSorted.length - 1;
                              i++
                            ) {
                              const refAtual = refeicoesSorted[i];
                              const proximaRef = refeicoesSorted[i + 1];
                              const horasJejum =
                                proximaRef.hora - refAtual.hora;

                              const inicioIdx =
                                refAtual.hora - config.horaInicio;
                              const fimIdx =
                                proximaRef.hora - config.horaInicio;
                              const left =
                                (inicioIdx / (horasVisiveis.length - 1)) * 100;
                              const right =
                                (fimIdx / (horasVisiveis.length - 1)) * 100;

                              intervalos.push(
                                <div
                                  key={`jejum-${i}`}
                                  className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                                  style={{
                                    left: `${left}%`,
                                    width: `${right - left}%`,
                                  }}
                                >
                                  <span className="text-xs font-light text-black">
                                    {horasJejum}h
                                  </span>
                                </div>,
                              );
                            }

                            if (
                              refeicoesSorted.length > 0 &&
                              refeicoesSorted[refeicoesSorted.length - 1].hora <
                                config.horaFim
                            ) {
                              const horasJejum =
                                config.horaFim -
                                refeicoesSorted[refeicoesSorted.length - 1]
                                  .hora;
                              const inicio =
                                refeicoesSorted[refeicoesSorted.length - 1]
                                  .hora;
                              const fim = config.horaFim;
                              const inicioIdx = inicio - config.horaInicio;
                              const fimIdx = fim - config.horaInicio;
                              const left =
                                (inicioIdx / (horasVisiveis.length - 1)) * 100;
                              const right =
                                (fimIdx / (horasVisiveis.length - 1)) * 100;

                              intervalos.push(
                                <div
                                  key="jejum-fim"
                                  className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                                  style={{
                                    left: `${left}%`,
                                    width: `${right - left}%`,
                                  }}
                                >
                                  <span className="text-xs font-light text-black">
                                    {horasJejum}h
                                  </span>
                                </div>,
                              );
                            }

                            return intervalos;
                          })()}

                          {/* Marcadores de refeição */}
                          {diaRefeicoes.map((ref: any) => {
                            const horaIndex = ref.hora - config.horaInicio;
                            const position =
                              (horaIndex / (horasVisiveis.length - 1)) * 100;
                            const simbolo = config.simbolos[ref.tipo];

                            return (
                              <div
                                key={ref.id}
                                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20"
                                style={{ left: `${position}%` }}
                                title={`${ref.nome} - ${ref.hora}:00`}
                              >
                                <span className="text-lg">{simbolo.emoji}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Linha de totais semanais */}
                  {(() => {
                    const totais = calcularTotaisSemana();
                    return (
                      <div className="flex border-t border-gray-200 bg-gray-50">
                        <div className="w-20 flex-shrink-0 p-3 text-xs font-semibold text-gray-800 border-r border-gray-100 flex items-center justify-center">
                          Total
                        </div>
                        <div className="flex-1 p-3 text-sm text-gray-800 flex items-center">
                          <div>
                            <div className="text-xs">
                              <strong>{totais.kcal}</strong> kcal ·{" "}
                              <strong>{totais.prot}g</strong> P ·{" "}
                              <strong>{totais.carb}g</strong> C ·{" "}
                              <strong>{totais.gord}g</strong> G - Média semanal:{" "}
                              <strong>{(totais.kcal / 7).toFixed(0)}</strong> kcal ·{" "}
                              <strong>{(totais.prot / 7).toFixed(0)}g</strong> P · {" "}
                              <strong>{(totais.carb / 7).toFixed(0)}g</strong>{" "} C ·{" "}
                              <strong>{(totais.gord / 7).toFixed(0)}g</strong> G
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Jejum total (soma dias): {totais.jejumTotal}h{" "}
                              {totais.diasComJejum > 0
                                ? `• média: ${(totais.jejumTotal / totais.diasComJejum).toFixed(1)}h`
                                : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Detalhes das Refeições - GRID HORIZONTAL POR TIPO */}
              <div className="mb-16">
                <SugestoesRefeicoes
                  tiposRefeicoes={TIPO_ORDER}
                  config={config}
                  pratosPorTipo={pratosPorTipo}
                  loading={loadingPreload}
                  metasPadrao={METAS_PADRAO}
                />
              </div>

              {/* Tabela de Alimentos com Filtros */}
              <div>
                <h2 className="text-xl sm:text-2xl font-light mb-4 tracking-tight">
                  Base de Alimentos
                </h2>

                {/* Filtros - responsivos */}
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
                      onClick={() => {
                        setFiltroNome("");
                        setFiltroCategoria("");
                        setOrdenarPor("");
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  Mostrando {alimentosFiltrados.length} de {alimentos.length}{" "}
                  alimentos
                </div>

                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-2 text-gray-600">
                              {alimento.id}
                            </td>
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
            </>
          )}

          {/* Modo Agenda - Timeline isolado */}
          {modoVisualizacao === "agenda" && (
            <div className="min-h-[calc(100vh-12rem)]">
              {/* Legenda */}
              <div className="mb-6">
                <div className="flex flex-wrap justify-center gap-6 text-sm font-light">
                  {Object.entries(config.simbolos).map(
                    ([tipo, simbolo]: [string, any]) => (
                      <div key={tipo} className="flex items-center gap-2">
                        <span className="text-lg">{simbolo.emoji}</span>
                        <span className="text-gray-700">{simbolo.label}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Timeline Semanal */}
              <h2 className="text-xl sm:text-2xl font-light mb-6 tracking-tight">
                Agenda Semanal
              </h2>
              <div>
                {/* Header de horas */}
                <div className="flex border-b border-gray-100 bg-white">
                  <div className="w-20 flex-shrink-0 p-3 font-bold text-xs text-gray-700 border-r border-gray-100">
                    Dia
                  </div>
                  <div className="flex-1 relative">
                    {horasVisiveis.map((hora, idx) => {
                      const position = (idx / (horasVisiveis.length - 1)) * 100;
                      return (
                        <div
                          key={hora}
                          className="absolute top-0 bottom-0 transform -translate-x-1/2 flex items-center z-10"
                          style={{ left: `${position}%` }}
                        >
                          <span className="text-xs p-2 font-semibold text-gray-700">
                            {hora}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dias */}
                {diasOrdenados.map((dia) => {
                  const diaRefeicoes = refeicoes[dia] || [];
                  return (
                    <div
                      key={dia}
                      className="flex border-b border-gray-100 last:border-b-0 bg-white"
                    >
                      <div className="min-w-[85px] w-auto flex-shrink-0 p-3 text-xs text-gray-700 border-r border-gray-100 flex flex-col items-center justify-center">
                        <span className="font-bold mt-1">{dia}</span>

                        {/* Calcular resumo do dia */}
                        {(() => {
                          const resumo = calcularResumoDia(dia);
                          if (!resumo.hasMeals) {
                            return (
                              <span className="text-xs font-light text-gray-400">
                                Jejum 24h
                              </span>
                            );
                          }
                          return (
                            <span className="text-[10px] font-light text-black text-center leading-tight mt-0.5">
                              {resumo.kcal} kcal
                              <br />
                              {resumo.prot}P · {resumo.carb}C · {resumo.gord}G{" "}
                              <br /> Maior jejum: {resumo.jejum}h
                            </span>
                          );
                        })()}
                      </div>

                      <div
                        className="flex-1 relative bg-white"
                        style={{ height: "42px" }}
                      >
                        {/* Grid de fundo */}
                        <div className="absolute inset-0 z-0">
                          {horasVisiveis.map((hora, idx) => {
                            const position =
                              (idx / (horasVisiveis.length - 1)) * 100;
                            return (
                              <div
                                key={hora}
                                className="absolute top-0 bottom-0 w-px bg-white"
                                style={{ left: `${position}%` }}
                              />
                            );
                          })}
                        </div>

                        {/* Intervalos de jejum */}
                        {(() => {
                          const intervalos = [];
                          const refeicoesSorted = [...diaRefeicoes].sort(
                            (a, b) => a.hora - b.hora,
                          );

                          if (
                            refeicoesSorted.length > 0 &&
                            refeicoesSorted[0].hora > config.horaInicio
                          ) {
                            const horasJejum = refeicoesSorted[0].hora - 0;
                            const inicio = config.horaInicio;
                            const fim = refeicoesSorted[0].hora;
                            const inicioIdx = inicio - config.horaInicio;
                            const fimIdx = fim - config.horaInicio;
                            const left =
                              (inicioIdx / (horasVisiveis.length - 1)) * 100;
                            const right =
                              (fimIdx / (horasVisiveis.length - 1)) * 100;

                            intervalos.push(
                              <div
                                key="jejum-inicio"
                                className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                                style={{
                                  left: `${left}%`,
                                  width: `${right - left}%`,
                                }}
                              >
                                <span className="text-xs font-light text-black">
                                  {horasJejum}h
                                </span>
                              </div>,
                            );
                          }

                          for (let i = 0; i < refeicoesSorted.length - 1; i++) {
                            const refAtual = refeicoesSorted[i];
                            const proximaRef = refeicoesSorted[i + 1];
                            const horasJejum = proximaRef.hora - refAtual.hora;

                            const inicioIdx = refAtual.hora - config.horaInicio;
                            const fimIdx = proximaRef.hora - config.horaInicio;
                            const left =
                              (inicioIdx / (horasVisiveis.length - 1)) * 100;
                            const right =
                              (fimIdx / (horasVisiveis.length - 1)) * 100;

                            intervalos.push(
                              <div
                                key={`jejum-${i}`}
                                className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                                style={{
                                  left: `${left}%`,
                                  width: `${right - left}%`,
                                }}
                              >
                                <span className="text-xs font-light text-black">
                                  {horasJejum}h
                                </span>
                              </div>,
                            );
                          }

                          if (
                            refeicoesSorted.length > 0 &&
                            refeicoesSorted[refeicoesSorted.length - 1].hora <
                              config.horaFim
                          ) {
                            const horasJejum =
                              config.horaFim -
                              refeicoesSorted[refeicoesSorted.length - 1].hora;
                            const inicio =
                              refeicoesSorted[refeicoesSorted.length - 1].hora;
                            const fim = config.horaFim;
                            const inicioIdx = inicio - config.horaInicio;
                            const fimIdx = fim - config.horaInicio;
                            const left =
                              (inicioIdx / (horasVisiveis.length - 1)) * 100;
                            const right =
                              (fimIdx / (horasVisiveis.length - 1)) * 100;

                            intervalos.push(
                              <div
                                key="jejum-fim"
                                className="absolute top-0 h-full flex items-center justify-center pointer-events-none z-10"
                                style={{
                                  left: `${left}%`,
                                  width: `${right - left}%`,
                                }}
                              >
                                <span className="text-xs font-light text-black">
                                  {horasJejum}h
                                </span>
                              </div>,
                            );
                          }

                          return intervalos;
                        })()}

                        {/* Marcadores de refeição */}
                        {diaRefeicoes.map((ref: any) => {
                          const horaIndex = ref.hora - config.horaInicio;
                          const position =
                            (horaIndex / (horasVisiveis.length - 1)) * 100;
                          const simbolo = config.simbolos[ref.tipo];

                          return (
                            <div
                              key={ref.id}
                              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20"
                              style={{ left: `${position}%` }}
                              title={`${ref.nome} - ${ref.hora}:00`}
                            >
                              <span className="text-lg">{simbolo.emoji}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Linha de totais semanais */}
                {(() => {
                  const totais = calcularTotaisSemana();
                  return (
                    <div className="flex border-t border-gray-200 bg-gray-50">
                      <div className="w-20 flex-shrink-0 p-3 text-xs font-semibold text-gray-800 border-r border-gray-100 flex items-center justify-center">
                        Total
                      </div>
                      <div className="flex-1 p-3 text-sm text-gray-800 flex items-center">
                        <div>
                          <div className="text-xs">
                            <strong>{totais.kcal}</strong> kcal ·{" "}
                            <strong>{totais.prot}g</strong> P ·{" "}
                            <strong>{totais.carb}g</strong> C ·{" "}
                            <strong>{totais.gord}g</strong> G - Média semanal:{" "}
                            <strong>{(totais.kcal / 7).toFixed(0)}</strong> kcal ·{" "}
                            <strong>{(totais.prot / 7).toFixed(0)}g</strong> P · {" "}
                            <strong>{(totais.carb / 7).toFixed(0)}g</strong>{" "} C ·{" "}
                            <strong>{(totais.gord / 7).toFixed(0)}g</strong> G
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Jejum total (soma dias): {totais.jejumTotal}h{" "}
                            {totais.diasComJejum > 0
                              ? `• média: ${(totais.jejumTotal / totais.diasComJejum).toFixed(1)}h`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Modo Sugestões - Cards de refeições */}
          {modoVisualizacao === "sugestoes" && (
            <SugestoesRefeicoes
              tiposRefeicoes={TIPO_ORDER}
              config={config}
              pratosPorTipo={pratosPorTipo}
              loading={loadingPreload}
              metasPadrao={METAS_PADRAO}
            />
          )}

          {/* Modo Configurações - Settings tela cheia */}
          {modoVisualizacao === "config" && (
            <div className="min-h-[calc(100vh-12rem)]">
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

                <div className="p-6 max-h-[calc(100vh-24rem)] overflow-y-auto">
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
                              <div
                                key={tipo}
                                className="flex items-center gap-3"
                              >
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
                      <h3 className="text-lg font-medium mb-4">
                        Editar Refeições
                      </h3>

                      {/* Grid com cartões por dia */}
                      <div className="grid grid-cols-2 gap-4">
                        {TODOS_DIAS.map((dia) => (
                          <div
                            key={dia}
                            className="border border-gray-200 rounded p-3"
                          >
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
                                      onClick={() =>
                                        removerRefeicao(dia, ref.id)
                                      }
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
                            Descrição do alimento (ex: "Omelete com aveia
                            300g"):
                          </label>
                          <textarea
                            value={novoAlimentoPrompt}
                            onChange={(e) =>
                              setNovoAlimentoPrompt(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[100px]"
                            placeholder="Descreva o alimento com detalhes: nome, porção, ingredientes principais..."
                            disabled={adicionandoAlimento}
                          />
                        </div>

                        <button
                          onClick={handleAdicionarAlimento}
                          disabled={
                            adicionandoAlimento || !novoAlimentoPrompt.trim()
                          }
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
                              <CheckCircle
                                size={16}
                                className="mt-0.5 flex-shrink-0"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="mt-0.5 flex-shrink-0"
                              />
                            )}
                            <span>{feedbackAlimento.mensagem}</span>
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                          <strong>💡 Dica:</strong> Seja o mais específico
                          possível. Inclua:
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
          )}

          {/* Modo Base de Dados - Tabela tela cheia */}
          {modoVisualizacao === "dados" && (
            <TabelaAlimentos
              alimentos={alimentos}
              alimentosFiltrados={alimentosFiltrados}
              filtroNome={filtroNome}
              filtroCategoria={filtroCategoria}
              setFiltroNome={setFiltroNome}
              setFiltroCategoria={setFiltroCategoria}
              ordenarPor={ordenarPor}
              ordenarDirecao={ordenarDirecao}
              handleSort={handleSort}
              limparFiltros={() => {
                setFiltroNome("");
                setFiltroCategoria("");
                setOrdenarPor("");
              }}
            />
          )}

        {/* Modo Gerenciador de Refeições */}
        {modoVisualizacao === "gerenciador" && (
          <GerenciadorRefeicoes
            onCriarRefeicao={() => setMostrarRefeicaoBuilder(true)}
            onEditarRefeicao={handleEditRefeicao}
            onVisualizarRefeicao={handleViewRefeicao}
          />
        )}
      </div>

      {/* Modais Globais */}
      <AlimentoFormModal
        isOpen={mostrarAlimentoModal}
        onClose={() => setMostrarAlimentoModal(false)}
        onSuccess={(alimento) => {
          setAlimentos(prev => [...prev, alimento]);
          setMostrarAlimentoModal(false);
        }}
      />

      <RefeicaoBuilder
        isOpen={mostrarRefeicaoBuilder}
        onClose={() => {
          setMostrarRefeicaoBuilder(false);
          setRefeicaoParaEditar(null);
          setModoRefeicaoReadonly(false);
        }}
        onSuccess={handleSuccessRefeicao}
        refeicaoId={refeicaoParaEditar}
        readonly={modoRefeicaoReadonly}
      />
    </div>
  );
}
