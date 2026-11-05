# Migração S7-300/400 → S7-1200/1500

> 💡 **Para times não técnicos:** esta tabela mostra como adaptar programas antigos
> (S7-300/400 no STEP 7) para a plataforma nova (S7-1200/1500 no TIA Portal). O
> objetivo é trocar recursos legados por equivalentes modernos, mais portáveis e
> seguros.

| S7-300/400 (legado) | S7-1200/1500 (TIA Portal) | Notas |
|---|---|---|
| Timers SIMATIC T1, T2… | TON/TOF/TP multi-instância | IEC — sem número físico de hardware |
| Contadores SIMATIC C1, C2… | CTU/CTD/CTUD multi-instância | IEC |
| S_ODT, S_PULSE (SIMATIC) | TON, TOF, TP (IEC) | IEC é padrão internacional |
| S_CU, S_CUD (SIMATIC) | CTU, CTD, CTUD (IEC) | sem BCD |
| Marcas M, MB, MW globais | DB global com campos simbólicos | portável entre CPUs |
| UDT (User Defined Type) | PLC data type | atualização automática de todos os usos |
| Tabela de símbolos | PLC Tags | Reference ID evita relink do HMI |
| `DB1.DBW4` (absoluto) | `"MeuDB".campo` (simbólico) | otimizado = só simbólico |
| ANY pointer | VARIANT | tipado — erro detectado em runtime |
| Construct AT | Slice access `.%X` `.%B` `.%W` | mais direto |
| STL com AR1/AR2 | evitar (emulado, lento) | usar SCL ou LAD |
| FB: 1 instância por DB | multi-instância no VAR do pai | menos DBs, mais organização |
| Clock Memory (M254) | FB gerador de pulso | independente de hardware |
| OB1 único | OB1 + OB200, OB300… | grupos de programa independentes |
| DATE_AND_TIME / DT | DTL | acesso por campo `.Year .Month .Hour` |

## Estratégia de migração (alto nível)

1. **Inventário:** liste blocos, tipos de dados, comunicação e I/O do projeto antigo.
2. **Padronize o simbólico primeiro:** elimine acessos absolutos `DBx.DBWy` no
   código legado antes de migrar — facilita muito o resto.
3. **Converta timers/contadores SIMATIC** em multi-instâncias IEC no `VAR` dos FBs.
4. **Troque marcas M** por DBs globais simbólicos.
5. **ANY → VARIANT** e **AR1/AR2 → ARRAY[\*]** (ver `step7-classico.md`).
6. **Ative blocos otimizados** em tudo (ver `otimizacao-download-diagnostico.md`).
7. **Refaça a comunicação** conforme `comunicacao.md` (habilitar PUT/GET, etc.).
8. **Teste em PLCSIM** antes de ir a campo.

> A ferramenta de migração do TIA Portal automatiza parte disso, mas o código
> resultante frequentemente mantém padrões legados — revise contra os anti-patterns.
