# data/api/gestor_alimentos_api.py

import logging
import sqlite3
from datetime import date, datetime
from typing import Optional, List
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, validator, Field

# ============================
# CONFIGURAÇÃO
# ============================

DB_PATH = Path(__file__).parent.parent / "db" / "alimentos.db"
DIST_PATH = Path(__file__).parent.parent.parent / "dist"

app = FastAPI(title="Gestor Alimentos API", version="2.0.0")

# CORS - permite localhost (dev) e PythonAnywhere (produção)
# NOTA: Wildcards não funcionam em allow_origins. Usar allow_origin_regex
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.pythonanywhere\.com",  # Qualquer subdomínio PythonAnywhere
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost:3000",  # Alternativo
        "http://localhost:8001",  # API standalone
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("gestor_alimentos_api")

# ============================
# MODELOS PYDANTIC
# ============================

class AlimentoCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=200)
    categoria: str = Field(..., max_length=100)
    porcao_g: float = Field(default=100, gt=0, le=10000)
    kcal: float = Field(..., ge=0, le=10000)
    prot_g: float = Field(..., ge=0, le=1000)
    carb_g: float = Field(..., ge=0, le=1000)
    gord_g: float = Field(..., ge=0, le=1000)
    contexto_culinario: str = Field(..., min_length=1)
    incompativel_com: Optional[str] = ""

    @validator('nome')
    def nome_nao_vazio(cls, v):
        if not v.strip():
            raise ValueError('Nome não pode ser vazio')
        return v.strip()

    @validator('contexto_culinario')
    def contexto_nao_vazio(cls, v):
        if not v.strip():
            raise ValueError('Contexto culinário é obrigatório')
        return v.strip()


class ItemRefeicaoCreate(BaseModel):
    alimento_id: int = Field(..., gt=0)
    gramas: float = Field(..., gt=0, le=10000)


class RefeicaoCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=200)
    tipo: str = Field(..., min_length=1, max_length=50)
    contexto_culinario: Optional[str] = ""
    descricao: Optional[str] = ""
    tags: Optional[str] = ""
    itens: List[ItemRefeicaoCreate] = Field(..., min_items=1)

    @validator('nome')
    def nome_nao_vazio(cls, v):
        if not v.strip():
            raise ValueError('Nome não pode ser vazio')
        return v.strip()


class HistoricoCreate(BaseModel):
    data: date
    refeicao_id: Optional[int] = None
    nome: str = Field(..., min_length=1, max_length=200)
    tipo: str = Field(..., min_length=1, max_length=50)
    descricao: Optional[str] = ""
    tags: Optional[str] = ""
    itens: Optional[List[ItemRefeicaoCreate]] = []

    @validator('itens')
    def validar_itens_ou_refeicao(cls, v, values):
        if not values.get('refeicao_id') and (not v or len(v) == 0):
            raise ValueError('Se refeicao_id for NULL, itens é obrigatório')
        return v


# ============================
# HELPERS
# ============================

def get_db():
    """Connection factory com row_factory"""
    if not DB_PATH.exists():
        raise HTTPException(500, f"Database not found: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def dict_from_row(row: sqlite3.Row) -> dict:
    """Converte Row para dict"""
    return {k: row[k] for k in row.keys()}


def alimento_exists(conn: sqlite3.Connection, alimento_id: int) -> bool:
    """Verifica se alimento existe"""
    cur = conn.execute("SELECT 1 FROM alimentos WHERE id = ?", (alimento_id,))
    return cur.fetchone() is not None


# ============================
# ENDPOINTS: ALIMENTOS
# ============================

@app.post("/api/alimentos", status_code=201)
async def criar_alimento(alimento: AlimentoCreate):
    """
    Cria novo alimento na base de dados.

    Validações:
    - Nome obrigatório e único
    - Valores numéricos >= 0
    - Contexto culinário obrigatório

    Retorna:
    - id: ID do alimento criado
    - alimento: Objeto completo do alimento
    """
    conn = get_db()
    cur = conn.cursor()

    # Verificar duplicata
    cur.execute(
        "SELECT id FROM alimentos WHERE LOWER(nome) = LOWER(?)",
        (alimento.nome,)
    )
    if cur.fetchone():
        conn.close()
        raise HTTPException(409, f"Alimento '{alimento.nome}' já existe")

    # Inserir
    cur.execute("""
        INSERT INTO alimentos (
            nome, categoria, porcao_g, kcal, prot_g, carb_g, gord_g,
            contexto_culinario, incompativel_com
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alimento.nome,
        alimento.categoria,
        alimento.porcao_g,
        alimento.kcal,
        alimento.prot_g,
        alimento.carb_g,
        alimento.gord_g,
        alimento.contexto_culinario,
        alimento.incompativel_com or "",
    ))

    alimento_id = cur.lastrowid
    conn.commit()

    # Buscar alimento criado
    cur.execute("SELECT * FROM alimentos WHERE id = ?", (alimento_id,))
    row = cur.fetchone()
    conn.close()

    return {
        "id": alimento_id,
        "mensagem": f"Alimento '{alimento.nome}' criado com sucesso",
        "alimento": dict_from_row(row),
    }


@app.get("/api/alimentos")
async def listar_alimentos(
    categoria: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=1000)
):
    """Lista alimentos com filtros opcionais"""
    conn = get_db()

    query = """
        SELECT id, nome, categoria, porcao_g, kcal, prot_g, carb_g, gord_g,
               contexto_culinario, incompativel_com, cluster_nutricional
        FROM alimentos
    """
    conditions = []
    params = []

    if categoria:
        conditions.append("categoria LIKE ?")
        params.append(f"%{categoria}%")

    if search:
        conditions.append("(nome LIKE ? OR categoria LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY nome"

    if limit:
        query += f" LIMIT {limit}"

    cur = conn.execute(query, params)
    rows = [dict_from_row(row) for row in cur.fetchall()]
    conn.close()

    return {"alimentos": rows}


@app.get("/api/alimentos/{id}")
async def obter_alimento(id: int):
    """Busca alimento por ID"""
    conn = get_db()
    cur = conn.execute(
        "SELECT * FROM alimentos WHERE id = ?",
        (id,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(404, f"Alimento {id} não encontrado")

    return dict_from_row(row)


@app.get('/api/categorias')
async def get_categorias():
    """Get all unique categories from database"""
    conn = get_db()
    cur = conn.execute('SELECT DISTINCT categoria FROM alimentos ORDER BY categoria')
    categorias = [row[0] for row in cur.fetchall()]
    conn.close()

    return {'categorias': categorias}


# ============================
# ENDPOINTS: REFEIÇÕES
# ============================

@app.post("/api/refeicoes", status_code=201)
async def criar_refeicao(refeicao: RefeicaoCreate):
    """
    Cria nova refeição com itens.

    Validações:
    - Nome obrigatório
    - Pelo menos 1 item
    - Todos os alimento_id devem existir
    - gramas > 0

    Retorna:
    - id: ID da refeição criada
    - totais: Totais nutricionais calculados
    """
    conn = get_db()
    cur = conn.cursor()

    try:
        # Validar que todos os alimentos existem
        for item in refeicao.itens:
            if not alimento_exists(conn, item.alimento_id):
                conn.close()
                raise HTTPException(404, f"Alimento {item.alimento_id} não encontrado")

        # Inserir refeição
        cur.execute("""
            INSERT INTO refeicoes (
                nome, tipo, contexto_culinario, descricao, tags
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            refeicao.nome,
            refeicao.tipo,
            refeicao.contexto_culinario or refeicao.tipo,
            refeicao.descricao or "",
            refeicao.tags or "",
        ))

        refeicao_id = cur.lastrowid

        # Inserir itens
        for ordem, item in enumerate(refeicao.itens):
            cur.execute("""
                INSERT INTO refeicoes_itens (
                    refeicao_id, alimento_id, gramas, ordem
                ) VALUES (?, ?, ?, ?)
            """, (refeicao_id, item.alimento_id, item.gramas, ordem))

        conn.commit()

        # Calcular totais
        cur.execute("""
            SELECT
                SUM(ri.gramas / a.porcao_g * a.kcal) as kcal_total,
                SUM(ri.gramas / a.porcao_g * a.prot_g) as prot_total,
                SUM(ri.gramas / a.porcao_g * a.carb_g) as carb_total,
                SUM(ri.gramas / a.porcao_g * a.gord_g) as gord_total
            FROM refeicoes_itens ri
            JOIN alimentos a ON a.id = ri.alimento_id
            WHERE ri.refeicao_id = ?
        """, (refeicao_id,))

        totais_row = cur.fetchone()
        conn.close()

        return {
            "id": refeicao_id,
            "nome": refeicao.nome,
            "mensagem": f"Refeição '{refeicao.nome}' criada com sucesso",
            "totais": {
                "kcal": round(totais_row["kcal_total"] or 0, 1),
                "prot": round(totais_row["prot_total"] or 0, 1),
                "carb": round(totais_row["carb_total"] or 0, 1),
                "gord": round(totais_row["gord_total"] or 0, 1),
            }
        }

    except sqlite3.IntegrityError as e:
        conn.rollback()
        conn.close()
        raise HTTPException(400, f"Erro de integridade: {str(e)}")


@app.get("/api/refeicoes")
async def listar_refeicoes(
    tipo: Optional[str] = Query(None),
    limit: Optional[int] = Query(50, ge=1, le=100),
    ativa: bool = Query(True)
):
    """
    Lista refeições com itens e totais calculados.

    Retorna cada refeição com:
    - Dados da refeição
    - Lista de itens (com dados do alimento)
    - Totais nutricionais pré-calculados
    """
    conn = get_db()

    # Buscar refeições
    query = "SELECT * FROM refeicoes WHERE ativa = ?"
    params = [1 if ativa else 0]

    if tipo:
        query += " AND tipo = ?"
        params.append(tipo)

    query += " ORDER BY criada_em DESC LIMIT ?"
    params.append(limit)

    cur = conn.execute(query, params)
    refeicoes = [dict_from_row(row) for row in cur.fetchall()]

    # Para cada refeição, buscar itens e calcular totais
    resultado = []
    for ref in refeicoes:
        # Buscar itens com JOIN
        cur.execute("""
            SELECT
                ri.id, ri.refeicao_id, ri.alimento_id, ri.gramas, ri.ordem,
                a.nome as alimento_nome,
                a.categoria,
                a.porcao_g as alimento_porcao_g,
                a.kcal as alimento_kcal,
                a.prot_g as alimento_prot_g,
                a.carb_g as alimento_carb_g,
                a.gord_g as alimento_gord_g,
                a.cluster_nutricional,
                a.contexto_culinario
            FROM refeicoes_itens ri
            JOIN alimentos a ON a.id = ri.alimento_id
            WHERE ri.refeicao_id = ?
            ORDER BY ri.ordem
        """, (ref["id"],))

        itens = [dict_from_row(row) for row in cur.fetchall()]

        # Calcular totais
        kcal_total = sum(
            (it["gramas"] / it["alimento_porcao_g"]) * it["alimento_kcal"]
            for it in itens
        )
        prot_total = sum(
            (it["gramas"] / it["alimento_porcao_g"]) * it["alimento_prot_g"]
            for it in itens
        )
        carb_total = sum(
            (it["gramas"] / it["alimento_porcao_g"]) * it["alimento_carb_g"]
            for it in itens
        )
        gord_total = sum(
            (it["gramas"] / it["alimento_porcao_g"]) * it["alimento_gord_g"]
            for it in itens
        )

        resultado.append({
            **ref,
            "itens": itens,
            "totais": {
                "kcal": round(kcal_total, 1),
                "prot": round(prot_total, 1),
                "carb": round(carb_total, 1),
                "gord": round(gord_total, 1),
            }
        })

    conn.close()

    # Manter compatibilidade com frontend antigo
    return {"refeicoes": resultado, "count": len(resultado)}


@app.get("/api/refeicoes/{id}")
async def obter_refeicao(id: int):
    """Busca refeição por ID com itens e totais"""
    conn = get_db()

    # Buscar refeição
    cur = conn.execute("SELECT * FROM refeicoes WHERE id = ?", (id,))
    ref_row = cur.fetchone()

    if not ref_row:
        conn.close()
        raise HTTPException(404, f"Refeição {id} não encontrada")

    refeicao = dict_from_row(ref_row)

    # Buscar itens
    cur.execute("""
        SELECT
            ri.id, ri.refeicao_id, ri.alimento_id, ri.gramas, ri.ordem,
            a.nome as alimento_nome,
            a.categoria,
            a.porcao_g as alimento_porcao_g,
            a.kcal as alimento_kcal,
            a.prot_g as alimento_prot_g,
            a.carb_g as alimento_carb_g,
            a.gord_g as alimento_gord_g
        FROM refeicoes_itens ri
        JOIN alimentos a ON a.id = ri.alimento_id
        WHERE ri.refeicao_id = ?
        ORDER BY ri.ordem
    """, (id,))

    itens = [dict_from_row(row) for row in cur.fetchall()]
    conn.close()

    # Calcular totais
    kcal_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_kcal"] for it in itens)
    prot_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_prot_g"] for it in itens)
    carb_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_carb_g"] for it in itens)
    gord_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_gord_g"] for it in itens)

    return {
        **refeicao,
        "itens": itens,
        "totais": {
            "kcal": round(kcal_total, 1),
            "prot": round(prot_total, 1),
            "carb": round(carb_total, 1),
            "gord": round(gord_total, 1),
        }
    }


@app.get('/api/refeicoes/tipos/disponiveis')
async def get_tipos_disponiveis():
    """Get list of available meal types"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT DISTINCT tipo FROM refeicoes WHERE ativa = 1 ORDER BY tipo")
    tipos = [row[0] for row in cursor.fetchall()]

    conn.close()

    return {"tipos": tipos}


@app.put("/api/refeicoes/{id}")
async def atualizar_refeicao(id: int, updates: dict):
    """
    Atualiza campos básicos da refeição (nome, tipo, descricao, tags).

    NOTA: Para alterar itens (alimentos), use POST /api/refeicoes/{id}/itens

    Campos permitidos: nome, tipo, descricao, tags, contexto_culinario, ativa
    """
    import agent_tools

    # Validar campos permitidos
    valid_fields = {'nome', 'tipo', 'descricao', 'tags', 'contexto_culinario', 'ativa'}
    invalid = set(updates.keys()) - valid_fields
    if invalid:
        raise HTTPException(400, f'Campos inválidos: {invalid}')

    result = agent_tools.update_refeicao(id, updates)

    if result['status'] == 'not_found':
        raise HTTPException(404, result['message'])
    if result['status'] == 'error':
        raise HTTPException(400, result['message'])

    return result


@app.delete("/api/refeicoes/{id}")
async def excluir_refeicao(id: int):
    """
    Exclui refeição permanentemente.
    DELETE cascata remove automaticamente os itens (refeicoes_itens).
    """
    import agent_tools
    result = agent_tools.delete_refeicao(id, confirm=True)

    if result['status'] == 'not_found':
        raise HTTPException(404, result['message'])
    if result['status'] == 'error':
        raise HTTPException(500, result['message'])

    return result


# ============================
# ENDPOINTS: HISTÓRICO
# ============================

@app.post("/api/historico", status_code=201)
async def registrar_historico(registro: HistoricoCreate):
    """
    Registra refeição no histórico de consumo.

    Pode receber:
    1. refeicao_id (usa itens da refeição salva)
    2. itens[] (cria registro avulso com itens customizados)

    Retorna:
    - id: ID do registro criado
    - totais: Totais nutricionais
    """
    conn = get_db()
    cur = conn.cursor()

    try:
        # Validar refeicao_id se fornecido
        if registro.refeicao_id:
            cur.execute("SELECT 1 FROM refeicoes WHERE id = ?", (registro.refeicao_id,))
            if not cur.fetchone():
                conn.close()
                raise HTTPException(404, f"Refeição {registro.refeicao_id} não encontrada")

        # Validar alimentos se itens fornecidos
        if registro.itens:
            for item in registro.itens:
                if not alimento_exists(conn, item.alimento_id):
                    conn.close()
                    raise HTTPException(404, f"Alimento {item.alimento_id} não encontrado")

        # Inserir histórico
        cur.execute("""
            INSERT INTO historico_refeicoes (
                data, refeicao_id, nome, tipo, descricao, tags
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            registro.data.isoformat(),
            registro.refeicao_id,
            registro.nome,
            registro.tipo,
            registro.descricao or "",
            registro.tags or "",
        ))

        historico_id = cur.lastrowid

        # Inserir itens
        if registro.refeicao_id:
            # Copiar itens da refeição salva
            cur.execute("""
                INSERT INTO historico_itens (historico_id, alimento_id, gramas, ordem)
                SELECT ?, alimento_id, gramas, ordem
                FROM refeicoes_itens
                WHERE refeicao_id = ?
            """, (historico_id, registro.refeicao_id))
        else:
            # Inserir itens fornecidos
            for ordem, item in enumerate(registro.itens):
                cur.execute("""
                    INSERT INTO historico_itens (
                        historico_id, alimento_id, gramas, ordem
                    ) VALUES (?, ?, ?, ?)
                """, (historico_id, item.alimento_id, item.gramas, ordem))

        conn.commit()

        # Calcular totais
        cur.execute("""
            SELECT
                SUM(hi.gramas / a.porcao_g * a.kcal) as kcal_total,
                SUM(hi.gramas / a.porcao_g * a.prot_g) as prot_total,
                SUM(hi.gramas / a.porcao_g * a.carb_g) as carb_total,
                SUM(hi.gramas / a.porcao_g * a.gord_g) as gord_total
            FROM historico_itens hi
            JOIN alimentos a ON a.id = hi.alimento_id
            WHERE hi.historico_id = ?
        """, (historico_id,))

        totais_row = cur.fetchone()
        conn.close()

        return {
            "id": historico_id,
            "mensagem": "Registro criado com sucesso",
            "totais": {
                "kcal": round(totais_row["kcal_total"] or 0, 1),
                "prot": round(totais_row["prot_total"] or 0, 1),
                "carb": round(totais_row["carb_total"] or 0, 1),
                "gord": round(totais_row["gord_total"] or 0, 1),
            }
        }

    except sqlite3.IntegrityError as e:
        conn.rollback()
        conn.close()
        raise HTTPException(400, f"Erro de integridade: {str(e)}")


@app.get("/api/historico")
async def listar_historico(
    data: Optional[str] = Query(None, regex=r'^\d{4}-\d{2}-\d{2}$'),
    tipo: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    texto: Optional[str] = Query(None)
):
    """
    Lista histórico com filtros.

    Filtros:
    - data: YYYY-MM-DD (exato)
    - tipo: cafe,almoco,jantar (separados por vírgula)
    - tags: treino,lowcarb (busca parcial)
    - texto: busca em nome ou descrição

    Retorna lista com itens e totais pré-calculados
    """
    conn = get_db()

    query = "SELECT * FROM historico_refeicoes WHERE 1=1"
    params = []

    if data:
        query += " AND data = ?"
        params.append(data)

    if tipo:
        tipos = [t.strip() for t in tipo.split(",")]
        placeholders = ",".join(["?"] * len(tipos))
        query += f" AND tipo IN ({placeholders})"
        params.extend(tipos)

    if tags:
        tags_list = [t.strip() for t in tags.split(",")]
        for tag in tags_list:
            query += " AND tags LIKE ?"
            params.append(f"%{tag}%")

    if texto:
        query += " AND (nome LIKE ? OR descricao LIKE ?)"
        params.extend([f"%{texto}%", f"%{texto}%"])

    query += " ORDER BY criada_em DESC"

    cur = conn.execute(query, params)
    registros = [dict_from_row(row) for row in cur.fetchall()]

    # Para cada registro, buscar itens e calcular totais
    resultado = []
    for reg in registros:
        cur.execute("""
            SELECT
                hi.id, hi.historico_id, hi.alimento_id, hi.gramas, hi.ordem,
                a.nome as alimento_nome,
                a.porcao_g as alimento_porcao_g,
                a.kcal as alimento_kcal,
                a.prot_g as alimento_prot_g,
                a.carb_g as alimento_carb_g,
                a.gord_g as alimento_gord_g
            FROM historico_itens hi
            JOIN alimentos a ON a.id = hi.alimento_id
            WHERE hi.historico_id = ?
            ORDER BY hi.ordem
        """, (reg["id"],))

        itens = [dict_from_row(row) for row in cur.fetchall()]

        # Calcular totais
        kcal_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_kcal"] for it in itens)
        prot_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_prot_g"] for it in itens)
        carb_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_carb_g"] for it in itens)
        gord_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_gord_g"] for it in itens)

        resultado.append({
            **reg,
            "itens": itens,
            "totais": {
                "kcal": round(kcal_total, 1),
                "prot": round(prot_total, 1),
                "carb": round(carb_total, 1),
                "gord": round(gord_total, 1),
            }
        })

    conn.close()

    return {"historico": resultado}


@app.get("/api/historico/{id}")
async def obter_historico(id: int):
    """Busca registro histórico por ID com itens e totais"""
    conn = get_db()

    cur = conn.execute("SELECT * FROM historico_refeicoes WHERE id = ?", (id,))
    reg_row = cur.fetchone()

    if not reg_row:
        conn.close()
        raise HTTPException(404, f"Registro {id} não encontrado")

    registro = dict_from_row(reg_row)

    # Buscar itens
    cur.execute("""
        SELECT
            hi.id, hi.historico_id, hi.alimento_id, hi.gramas, hi.ordem,
            a.nome as alimento_nome,
            a.porcao_g as alimento_porcao_g,
            a.kcal as alimento_kcal,
            a.prot_g as alimento_prot_g,
            a.carb_g as alimento_carb_g,
            a.gord_g as alimento_gord_g
        FROM historico_itens hi
        JOIN alimentos a ON a.id = hi.alimento_id
        WHERE hi.historico_id = ?
        ORDER BY hi.ordem
    """, (id,))

    itens = [dict_from_row(row) for row in cur.fetchall()]
    conn.close()

    # Calcular totais
    kcal_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_kcal"] for it in itens)
    prot_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_prot_g"] for it in itens)
    carb_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_carb_g"] for it in itens)
    gord_total = sum((it["gramas"] / it["alimento_porcao_g"]) * it["alimento_gord_g"] for it in itens)

    return {
        **registro,
        "itens": itens,
        "totais": {
            "kcal": round(kcal_total, 1),
            "prot": round(prot_total, 1),
            "carb": round(carb_total, 1),
            "gord": round(gord_total, 1),
        }
    }


@app.delete("/api/historico/{id}", status_code=204)
async def excluir_historico(id: int):
    """
    Deleta registro histórico.

    Delete em cascata (historico_itens são removidos automaticamente)
    """
    conn = get_db()
    cur = conn.cursor()

    # Verificar se existe
    cur.execute("SELECT 1 FROM historico_refeicoes WHERE id = ?", (id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(404, f"Registro {id} não encontrado")

    # Deletar (cascata remove itens automaticamente)
    cur.execute("DELETE FROM historico_refeicoes WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return None  # 204 No Content


# ============================
# HEALTH CHECK
# ============================

@app.get("/health")
async def health_check():
    """Verifica se API e banco estão funcionando"""
    try:
        conn = get_db()
        cur = conn.execute("SELECT COUNT(*) FROM alimentos")
        count = cur.fetchone()[0]
        conn.close()

        return {
            "status": "healthy",
            "database": "connected",
            "alimentos_count": count,
        }
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")


# ============================
# SERVIR FRONTEND ESTÁTICO (PRODUÇÃO)
# ============================
# IMPORTANTE: Estas rotas devem vir DEPOIS de todos os endpoints /api/*
# para evitar que o catch-all capture rotas da API

if DIST_PATH.exists():
    # Montar pasta assets/ ANTES das rotas para melhor performance
    app.mount("/assets", StaticFiles(directory=DIST_PATH / "assets"), name="assets")

    @app.get("/favicon.ico")
    async def favicon():
        """Serve favicon.ico se existir"""
        favicon_path = DIST_PATH / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(favicon_path)
        raise HTTPException(404)

    @app.get("/")
    async def serve_root():
        """Serve index.html na raiz"""
        index_file = DIST_PATH / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(404, "Frontend não encontrado. Execute: npm run build")

    @app.get("/{full_path:path}")
    async def catch_all_spa(full_path: str):
        """
        Catch-all para SPA routing (deve ser a ÚLTIMA rota).

        Segurança:
        - Valida path traversal (..)
        - Ignora rotas /api/* (já tratadas acima)
        - Só serve arquivos dentro de DIST_PATH
        """
        # Bloquear tentativas de path traversal
        if ".." in full_path or full_path.startswith("/"):
            raise HTTPException(400, "Invalid path")

        # Ignorar rotas da API (não deveria chegar aqui, mas por segurança)
        if full_path.startswith("api/"):
            raise HTTPException(404, f"API endpoint not found: /{full_path}")

        # Resolver path de forma segura
        try:
            file_path = (DIST_PATH / full_path).resolve()

            # Verificar que está dentro de DIST_PATH (previne directory traversal)
            if not str(file_path).startswith(str(DIST_PATH.resolve())):
                raise HTTPException(403, "Access denied")

            # Se arquivo existe, serve
            if file_path.is_file():
                return FileResponse(file_path)
        except (ValueError, OSError):
            pass  # Path inválido, vai cair no fallback

        # Fallback: retornar index.html para SPA routing (React Router)
        index_file = DIST_PATH / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

        raise HTTPException(404, "Not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
