# Scoring (v2)

## Entradas por control
- **Estado**: Sí = 1 · Parcialmente = 0,5 · No = 0 · No sé = 0 (incertidumbre, no cumplimiento) · No aplica = excluido.
- **Evidencia**: Ninguna = 0 · Parcial = 0,5 · Suficiente = 1.
- **Peso por prioridad**: alta = 3 · media = 2 · baja = 1.

## Indicadores
| Indicador | Fórmula |
|---|---|
| **Readiness declarado** | Σ(peso × puntos de estado) / Σ(peso) × 100 |
| **Evidence readiness** | Σ(peso × puntos de evidencia) / Σ(peso) × 100 |
| **Readiness verificable** | Σ(peso × min(estado, evidencia)) / Σ(peso) × 100 |

El *readiness verificable* penaliza el «Sí» sin evidencia: un control solo cuenta hasta donde puede demostrarse.

## Controles fuera del cálculo
- Los marcados «No aplica».
- Opcionalmente (activado por defecto), los controles cuyo `minCategory` es superior a la categoría preliminar. Se listan aparte en el informe como «exigibles solo en categorías superiores».

## Clasificación para el plan de acción
- **Gap**: estado No o Parcialmente.
- **Validar**: estado No sé (incertidumbre, no es un gap confirmado).
- **Declarado sin evidencia**: estado Sí con evidencia Ninguna.

El plan se ordena por prioridad, después por fecha objetivo (sin fecha al final).

## Categoría preliminar
Nivel más alto entre disponibilidad, confidencialidad e integridad. Se emiten avisos si los tipos de información declarados (crítica, sensible, personal) no son coherentes con impactos bajos.

Los indicadores sirven para priorizar trabajo GRC y **no** deben presentarse como certificación ni como porcentaje oficial de adecuación ENS.
