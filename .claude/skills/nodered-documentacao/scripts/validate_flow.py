#!/usr/bin/env python3
"""Valida um fluxo Node-RED (JSON de import/export) contra as definições dos nós core 5.0.7.

Uso:
    python3 validate_flow.py flow.json            # arquivo
    cat flow.json | python3 validate_flow.py -     # stdin

Verifica:
  - JSON válido e array plano de nós (formato de import/export e de GET /flows v1)
  - ids únicos; "z" aponta para uma aba (tab) ou subflow existente
  - wires: um array por saída, destinos existentes; nº de saídas coerente com "outputs"
  - para nós core: propriedades desconhecidas (provável nome errado),
    valores de <select> inválidos (ex.: range.action, rbe.func, trigger.units),
    referências a config nodes (ex.: mqtt in -> broker) existentes
  - config nodes sem x/y/wires
  - lista tipos não core (precisam de pacote instalado)
Saída: relatório legível; código de saída 1 se houver ERRO.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULTS = os.path.join(HERE, "..", "assets", "core-node-defaults.json")

# propriedades estruturais aceitas em qualquer nó
STRUCTURAL = {"id", "type", "z", "x", "y", "w", "h", "wires", "g", "d", "l",
              "name", "info", "inputLabels", "outputLabels", "icon", "_users",
              "env", "credentials"}
TAB_TYPES = {"tab", "subflow", "group", "junction"}


def load_defaults():
    with open(DEFAULTS, encoding="utf-8") as f:
        return json.load(f)["nodes"]


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    src = sys.argv[1]
    raw = sys.stdin.read() if src == "-" else open(src, encoding="utf-8").read()
    errors, warns, infos = [], [], []
    try:
        flow = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"ERRO: JSON inválido: {e}")
        return 1
    if isinstance(flow, dict) and "flows" in flow:
        infos.append("Formato v2 ({rev, flows}) detectado; validando 'flows'. Para importar no editor use só o array.")
        flow = flow["flows"]
    if not isinstance(flow, list):
        print("ERRO: o fluxo deve ser um array de nós.")
        return 1

    defs = load_defaults()
    ids = {}
    for n in flow:
        if not isinstance(n, dict) or "id" not in n or "type" not in n:
            errors.append(f"Item sem id/type: {str(n)[:80]}")
            continue
        if n["id"] in ids:
            errors.append(f"id duplicado: {n['id']}")
        ids[n["id"]] = n
    containers = {i for i, n in ids.items() if n["type"] in ("tab", "subflow")}
    subflow_types = {f"subflow:{i}" for i, n in ids.items() if n["type"] == "subflow"}
    third_party = set()

    for nid, n in ids.items():
        t = n["type"]
        label = f"{t} '{n.get('name') or nid}'"
        if t in TAB_TYPES:
            continue
        d = defs.get(t)
        is_config = (d or {}).get("category") == "config" or ("x" not in n and "wires" not in n)
        z = n.get("z")
        if z and z not in containers:
            errors.append(f"{label}: z='{z}' não é uma aba/subflow deste JSON")
        if not is_config and not z:
            infos.append(f"{label}: sem 'z' — no Import do editor vai para a aba aberta (ok); via Admin API /flow defina 'z'")
        if d is None and t not in subflow_types:
            third_party.add(t)
        # wires
        if "wires" in n:
            w = n["wires"]
            if not isinstance(w, list) or any(not isinstance(p, list) for p in w):
                errors.append(f"{label}: 'wires' deve ser array de arrays (um por saída)")
            else:
                for p in w:
                    for dst in p:
                        if dst not in ids:
                            errors.append(f"{label}: fio para id inexistente '{dst}'")
                outs = n.get("outputs")
                if isinstance(outs, (int, str)) and str(outs).isdigit() and int(outs) != len(w) and len(w) > 0:
                    warns.append(f"{label}: outputs={outs} mas wires tem {len(w)} saídas")
                if d and d.get("outputs") == 0 and any(w):
                    errors.append(f"{label}: este nó não tem saída, mas há fios saindo")
        if d is None:
            continue
        if d.get("category") == "config":
            for k in ("x", "y", "wires"):
                if k in n:
                    warns.append(f"{label}: config node não deve ter '{k}'")
        known = set(d["defaults"]) | STRUCTURAL | set(d.get("credentials", []))
        # propriedades auxiliares usadas pelos nós core e aceitas no import
        known |= {"payloadType", "topicType", "op1type", "op2type", "propertyType",
                  "vt", "targetType", "statusType", "fieldType", "keyType", "filenameType",
                  "spltType", "arraySpltType", "joinerType", "reduceInitType", "msgKeyType",
                  "seqKeyType", "tot", "pt", "reg"}
        unknown = [k for k in n if k not in known]
        if unknown:
            warns.append(f"{label}: propriedades não reconhecidas para '{t}' (5.0.7): {unknown}")
        for k, opts in (d.get("selectOptions") or {}).items():
            if k in n and k in d["defaults"] and str(n[k]) not in opts:
                errors.append(f"{label}: {k}='{n[k]}' inválido; opções: {opts}")
        for k, spec in d["defaults"].items():
            ctype = spec.get("type")
            val = n.get(k)
            if not ctype or not val or k in ("scope", "links"):
                continue
            refs = val if isinstance(val, list) else [val]
            for r in refs:
                if isinstance(r, str) and r not in ids:
                    warns.append(f"{label}: '{k}' referencia config node '{r}' ({ctype}) que não está no JSON "
                                 f"(ok se já existir na instalação; senão inclua o config node)")
        # listas de ids de nós (catch/status/complete.scope, link in/out/call.links)
        for k in ("scope", "links"):
            val = n.get(k)
            if isinstance(val, list):
                for r in val:
                    if isinstance(r, str) and r not in ids:
                        warns.append(f"{label}: '{k}' aponta para id '{r}' que não está no JSON")

    print(f"Nós: {len(ids)} | abas/subflows: {len(containers)}")
    for i in infos:
        print("INFO:", i)
    if third_party:
        print("INFO: tipos não core (instalar pacote e conferir propriedades):", sorted(third_party))
    for w in warns:
        print("AVISO:", w)
    for e in errors:
        print("ERRO:", e)
    if not errors and not warns:
        print("OK: nenhum problema encontrado.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
