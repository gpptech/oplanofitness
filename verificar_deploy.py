#!/usr/bin/env python3
"""
Script de verificação pré-deploy para PythonAnywhere
Execute: python verificar_deploy.py
"""

import os
import sys
from pathlib import Path

# Cores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'
BOLD = '\033[1m'

def check(condition, message):
    """Verifica condição e imprime resultado"""
    if condition:
        print(f"{GREEN}[OK] {message}{RESET}")
        return True
    else:
        print(f"{RED}[FAIL] {message}{RESET}")
        return False

def main():
    print(f"{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}VERIFICAÇÃO PRÉ-DEPLOY - PythonAnywhere{RESET}")
    print(f"{BOLD}{'='*60}{RESET}\n")

    all_ok = True

    # 1. Arquivos essenciais
    print(f"{BOLD}1. Arquivos Essenciais:{RESET}")
    all_ok &= check(Path('requirements.txt').exists(), "requirements.txt existe")
    all_ok &= check(Path('.env.example').exists(), ".env.example existe")
    all_ok &= check(Path('DEPLOY_GUIDE.md').exists(), "DEPLOY_GUIDE.md existe (guia unificado)")
    print()

    # 2. Build de produção
    print(f"{BOLD}2. Build de Produção (dist/):{RESET}")
    all_ok &= check(Path('dist').exists(), "dist/ existe")
    all_ok &= check(Path('dist/index.html').exists(), "dist/index.html existe")
    all_ok &= check(Path('dist/assets').exists(), "dist/assets/ existe")

    # Contar arquivos JS/CSS
    if Path('dist/assets').exists():
        assets = list(Path('dist/assets').glob('*'))
        all_ok &= check(len(assets) > 0, f"dist/assets/ tem {len(assets)} arquivos")
    print()

    # 3. Database
    print(f"{BOLD}3. Database SQLite:{RESET}")
    db_path = Path('data/db/alimentos.db')
    all_ok &= check(db_path.exists(), "data/db/alimentos.db existe")

    if db_path.exists():
        size_kb = db_path.stat().st_size / 1024
        all_ok &= check(size_kb > 100, f"Database tem {size_kb:.1f} KB (esperado > 100 KB)")
    print()

    # 4. Configurações
    print(f"{BOLD}4. Configurações:{RESET}")

    # Verificar .gitignore
    gitignore_content = Path('.gitignore').read_text() if Path('.gitignore').exists() else ""
    all_ok &= check('!data/db/alimentos.db' in gitignore_content, ".gitignore permite alimentos.db")
    all_ok &= check('# dist/' in gitignore_content or 'dist/' not in gitignore_content,
                    ".gitignore permite dist/ (comentado ou ausente)")

    # Verificar API
    api_path = Path('data/api/gestor_alimentos_api.py')
    if api_path.exists():
        api_content = api_path.read_text(encoding='utf-8')
        all_ok &= check('StaticFiles' in api_content, "API importa StaticFiles")
        all_ok &= check('FileResponse' in api_content, "API importa FileResponse")
        all_ok &= check('pythonanywhere' in api_content.lower(), "API tem CORS para PythonAnywhere")
    print()

    # 5. Segurança
    print(f"{BOLD}5. Segurança:{RESET}")
    env_exists = Path('.env').exists()

    if env_exists:
        print(f"{YELLOW}[WARN] .env existe (nao deve ser commitado){RESET}")
        all_ok &= check('.env' in gitignore_content, ".env esta no .gitignore")
    else:
        print(f"{GREEN}[OK] .env nao existe (sera criado no servidor){RESET}")

    all_ok &= check(Path('.env.example').exists(), ".env.example existe (template)")

    # Verificar se .env.example não tem secrets
    if Path('.env.example').exists():
        env_example = Path('.env.example').read_text(encoding='utf-8')
        all_ok &= check('sk-proj-your' in env_example.lower() or 'your-api-key' in env_example.lower(),
                       ".env.example tem placeholder (nao secret real)")
    print()

    # 6. Git
    print(f"{BOLD}6. Git Status:{RESET}")
    if Path('.git').exists():
        import subprocess
        try:
            # Verificar se tem mudanças não commitadas
            result = subprocess.run(['git', 'status', '--porcelain'],
                                  capture_output=True, text=True, timeout=5)

            if result.returncode == 0:
                changes = result.stdout.strip()
                if changes:
                    print(f"{YELLOW}[WARN] Existem mudancas nao commitadas:{RESET}")
                    lines = changes.split('\n')[:10]  # Mostrar primeiras 10
                    for line in lines:
                        print(f"   {line}")
                    if len(changes.split('\n')) > 10:
                        print(f"   ... e mais {len(changes.split('\n')) - 10} arquivos")
                else:
                    print(f"{GREEN}[OK] Nenhuma mudanca pendente{RESET}")

            # Verificar remote
            result = subprocess.run(['git', 'remote', '-v'],
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0 and result.stdout.strip():
                print(f"{GREEN}[OK] Git remote configurado{RESET}")
                # Mostrar URL do remote
                for line in result.stdout.split('\n'):
                    if 'origin' in line and 'fetch' in line:
                        url = line.split()[1]
                        print(f"   Remote: {url}")
            else:
                print(f"{YELLOW}[WARN] Git remote nao configurado (configure antes do push){RESET}")

        except subprocess.TimeoutExpired:
            print(f"{YELLOW}[WARN] Git timeout (ignorando){RESET}")
        except FileNotFoundError:
            print(f"{YELLOW}[WARN] Git nao encontrado no PATH{RESET}")
    else:
        print(f"{RED}[FAIL] .git/ nao existe (inicialize git){RESET}")
        all_ok = False
    print()

    # Resultado final
    print(f"{BOLD}{'='*60}{RESET}")
    if all_ok:
        print(f"{GREEN}{BOLD}[SUCCESS] TUDO PRONTO PARA DEPLOY!{RESET}")
        print(f"\n{BOLD}Proximos passos:{RESET}")
        print("1. git add -f dist/  # Forcar adicao do build")
        print("2. git add .")
        print('3. git commit -m "feat: prepara para PythonAnywhere"')
        print("4. git push")
        print("5. Seguir DEPLOY_GUIDE.md")
    else:
        print(f"{RED}{BOLD}[ERROR] PROBLEMAS ENCONTRADOS{RESET}")
        print(f"\n{BOLD}Corrija os itens marcados com [FAIL] antes do deploy.{RESET}")
    print(f"{BOLD}{'='*60}{RESET}\n")

    return 0 if all_ok else 1

if __name__ == '__main__':
    sys.exit(main())
