@echo off
setlocal EnableExtensions

echo ========================================
echo   Iniciando Plano Alimentar
echo ========================================
echo.
echo Certifique-se de que:
echo - Conda env 'plano_alimentar311' existe
echo - Node.js instalado (npm install executado)
echo - Arquivo .env configurado com OPENAI_API_KEY
echo.

REM Limpar arquivos de log temporarios
if exist vite_ready.txt del vite_ready.txt
if exist vite_output.log del vite_output.log

echo [0/3] Encerrando processos Python antigos...
echo.

REM Encerrar todos os processos Python para evitar conflitos
taskkill /F /IM python.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Processos Python antigos encerrados.
) else (
    echo Nenhum processo Python rodando.
)
echo.

echo [1/3] Verificando e liberando portas...
echo.

REM Verificar porta 8001 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001 ^| findstr LISTENING') do (
    echo Porta 8001 ocupada pelo processo %%a - Encerrando...
    taskkill /F /PID %%a >nul 2>&1
)

REM Verificar porta 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Porta 5173 ocupada pelo processo %%a - Encerrando...
    taskkill /F /PID %%a >nul 2>&1
)

echo Portas liberadas!
echo.

echo [2/4] Iniciando API Backend (FastAPI) em background...

REM ===== Ativar ambiente Conda de forma robusta =====
set "ENV_NAME=plano_alimentar311"
set "CONDA_CALL="

REM Tenta localizar conda.bat em caminhos comuns
for %%G in ("%USERPROFILE%\miniconda3\condabin\conda.bat" ^
            "%USERPROFILE%\anaconda3\condabin\conda.bat" ^
            "C:\\ProgramData\\miniconda3\\condabin\\conda.bat" ^
            "%LOCALAPPDATA%\miniconda3\condabin\conda.bat") do (
    if exist "%%~G" (
        set "CONDA_CALL=call \"%%~G\""
        goto have_conda
    )
)

REM Se 'conda' estiver no PATH, usa diretamente
where conda >nul 2>&1
if %errorlevel% equ 0 (
    set "CONDA_CALL=call conda"
) else (
    echo AVISO: 'conda' nao encontrado. Inicie pelo "Anaconda Prompt" ou ajuste o PATH.
    goto start_frontend_only
)

:have_conda
start "" /b cmd /c "%CONDA_CALL% activate %ENV_NAME% && cd data\api && uvicorn gestor_alimentos_api:app --reload --port 8001"

:start_frontend_only
echo [3/4] Iniciando Frontend (Vite) em background...
start "" /b cmd /c "npm run dev > vite_output.log 2>&1"

echo [4/4] Aguardando Vite inicializar...
echo.

REM Aguardar ate o Vite estar pronto (max 60 segundos)
set /a counter=0
:wait_vite
call :sleep 1
set /a counter+=1

REM Verificar se Vite esta pronto (procura por "Local:" no log)
findstr /C:"Local:" vite_output.log >nul 2>&1
if %errorlevel% equ 0 goto vite_ready

REM Timeout apos 60 segundos
if %counter% geq 60 (
    echo TIMEOUT: Vite nao iniciou em 60 segundos.
    echo Abrindo navegador mesmo assim...
    goto open_browser
)

goto wait_vite

:vite_ready
echo.
echo ========================================
echo   Servidores rodando!
echo ========================================
echo   Backend (FastAPI): http://localhost:8001
echo     - Alimentos:     /api/alimentos
echo     - Refeicoes:     /api/refeicoes
echo     - Historico:     /api/historico
echo     - AI Agent:      /api/agent
echo     - API Docs:      /docs
echo.
echo   Frontend (Vite):   http://localhost:5173
echo ========================================
echo.
echo Vite pronto! Abrindo navegador em 2 segundos...
call :sleep 2

:open_browser
start http://localhost:5173

echo.
echo ========================================
echo   INSTRUCOES
echo ========================================
echo.
echo Para parar os servidores:
echo   1. Pressione Ctrl+C nesta janela
echo   2. Feche as abas do navegador
echo.
echo Logs do Vite: vite_output.log
echo ========================================
echo.

REM Manter janela aberta e mostrar logs em tempo real
echo Monitorando logs do Vite (Ctrl+C para parar)...
echo.
call :sleep 2
type vite_output.log
echo.
echo Pressione Ctrl+C para parar os servidores...
pause >nul

endlocal

goto :eof

:sleep
setlocal
set "seconds=%~1"
if not defined seconds set "seconds=1"
timeout /t %seconds% /nobreak >nul 2>&1
if errorlevel 1 (
    set /a pingCount=seconds+1
    ping 127.0.0.1 -n %pingCount% >nul 2>&1
)
endlocal & exit /b
