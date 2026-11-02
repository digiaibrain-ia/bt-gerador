#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validar_scl.py — Validador rápido de código SCL Siemens.

O QUÊ FAZ:
    Lê um arquivo .scl/.txt e aponta os anti-patterns mais comuns (e mais graves)
    da skill SIEMENS_S7_ENGENHARIA — aqueles que causam erro de compilação ou
    comportamento imprevisível no CLP. É uma checagem heurística (não é um
    compilador), pensada para rodar ANTES de levar o código ao TIA Portal.

POR QUÊ existe:
    Repetir essa verificação manualmente a cada bloco é lento e sujeito a falha.
    Centralizar aqui garante consistência e serve de "porta de qualidade".

USO:
    python3 scripts/validar_scl.py meu_bloco.scl
    python3 scripts/validar_scl.py *.scl

SAÍDA:
    Lista de avisos com linha, regra e sugestão. Código de saída != 0 se houver
    achados de severidade ALTA (para uso em pipelines de CI, se desejado).

Autor: REGINALDO LOBO
"""

import re
import sys

# Cada regra: (id, severidade, regex, mensagem, sugestao)
# As regex são propositalmente conservadoras para evitar falsos positivos.
REGRAS = [
    ("AP10", "ALTA",
     re.compile(r"\bELSEIF\b", re.IGNORECASE),
     "Uso de ELSEIF (sintaxe inválida em SCL).",
     "Troque por ELSIF."),

    ("AP8", "ALTA",
     # LIMIT/MIN/MAX/SEL com argumento posicional logo após '(' (sem ':=')
     re.compile(r"\b(LIMIT|MIN|MAX|SEL|MUX|NORM_X|SCALE_X)\s*\(\s*[^):=]+,",
                re.IGNORECASE),
     "Possível parâmetro POSICIONAL em função nativa (faltou ':=').",
     "Use parâmetros nomeados: LIMIT(MN := 0, IN := x, MX := 100)."),

    ("AP6", "MEDIA",
     # concatenação de string com '+': literal entre aspas perto de '+'
     re.compile(r"('[^']*'\s*\+)|(\+\s*')"),
     "Possível concatenação de string com '+' (não existe em SCL).",
     "Use CONCAT(IN1 := ..., IN2 := ...)."),

    ("R6/AP7", "MEDIA",
     # comparação de igualdade com literal Real (ponto decimal). O lookbehind
     # negativo evita confundir com ':=' (atribuição), '>=', '<=', '<>' e '=='.
     re.compile(r"(?<![:<>=])=\s*-?\d+\.\d+"),
     "Comparação direta com literal Real usando '=' (IEEE 754).",
     "Compare com tolerância: IF ABS(IN := a - b) < TOL THEN ..."),
]

# Verificações que exigem contexto de seção (VAR_TEMP) — feitas à parte.
TIPOS_PERSISTENTES = ("TON", "TOF", "TP", "CTU", "CTD", "CTUD",
                      "R_TRIG", "F_TRIG", "IEC_TIMER", "IEC_COUNTER")


def checar_timer_em_vartemp(linhas):
    """AP5 — timer/contador/trigger declarado dentro de uma seção VAR_TEMP.

    Percorre o arquivo controlando se estamos dentro de um bloco VAR_TEMP; se
    encontrarmos a declaração de um tipo persistente ali, é o erro mais grave e
    comum: o objeto é apagado a cada ciclo e nunca funciona.
    """
    achados = []
    dentro_temp = False
    for n, linha in enumerate(linhas, start=1):
        nu = linha.upper()
        # Entra/sai da seção VAR_TEMP
        if re.search(r"\bVAR_TEMP\b", nu):
            dentro_temp = True
            continue
        if re.search(r"\bEND_VAR\b", nu):
            dentro_temp = False
            continue
        if dentro_temp:
            for t in TIPOS_PERSISTENTES:
                # padrão "nome : TON" (declaração de variável do tipo)
                if re.search(r":\s*" + t + r"\b", nu):
                    achados.append((n, "AP5", "ALTA", linha.strip(),
                                    f"{t} em VAR_TEMP é apagado a cada ciclo (~10ms).",
                                    "Mova a declaração para a seção VAR (ou VAR_STAT)."))
    return achados


def checar_case_sem_else(texto, linhas):
    """AP12/AP13 — CASE ... OF sem ramo ELSE (estado de erro implícito)."""
    achados = []
    # Localiza cada par CASE...END_CASE e verifica se há ELSE entre eles.
    for m in re.finditer(r"\bCASE\b(.*?)\bEND_CASE\b", texto,
                         re.IGNORECASE | re.DOTALL):
        trecho = m.group(0)
        if not re.search(r"\bELSE\b", trecho, re.IGNORECASE):
            # estima a linha onde o CASE começa
            linha_ini = texto[:m.start()].count("\n") + 1
            achados.append((linha_ini, "AP12", "MEDIA",
                            "CASE ... OF (sem ELSE)",
                            "CASE sem ramo ELSE — estado desconhecido fica sem tratamento.",
                            "Adicione 'ELSE: estado := 99;' como estado de erro."))
    return achados


def comentado(linha):
    """Ignora ocorrências dentro de comentário de linha (// ...)."""
    return "//" in linha and linha.index("//") == 0


def validar(caminho):
    try:
        with open(caminho, "r", encoding="utf-8", errors="replace") as f:
            texto = f.read()
    except OSError as e:
        print(f"[ERRO] não foi possível abrir {caminho}: {e}")
        return []

    linhas = texto.splitlines()
    achados = []

    # Regras linha a linha (pulando linhas inteiramente comentadas)
    for n, linha in enumerate(linhas, start=1):
        sem_coment = linha.split("//", 1)[0]  # ignora o que vem depois de //
        for rid, sev, rx, msg, sug in REGRAS:
            if rx.search(sem_coment):
                achados.append((n, rid, sev, linha.strip(), msg, sug))

    # Regras com contexto
    achados += checar_timer_em_vartemp(linhas)
    achados += checar_case_sem_else(texto, linhas)

    achados.sort(key=lambda a: a[0])
    return achados


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 0

    severidade_alta = False
    for caminho in argv[1:]:
        achados = validar(caminho)
        print(f"\n=== {caminho} ===")
        if not achados:
            print("  ✓ Nenhum anti-pattern conhecido encontrado.")
            continue
        for linha, rid, sev, codigo, msg, sug in achados:
            if sev == "ALTA":
                severidade_alta = True
            print(f"  [linha {linha}] ({sev}) {rid}: {msg}")
            print(f"      → {codigo}")
            print(f"      ↳ sugestão: {sug}")

    print("\nObs.: verificação heurística — confirme sempre no compilador do TIA Portal/STEP 7.")
    return 1 if severidade_alta else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
