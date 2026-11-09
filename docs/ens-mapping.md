# Mapeo ENS

El catálogo (`data/controls.js`, versión `CATALOG_VERSION`) contiene 38 controles agrupados por área. Cada uno lleva:
- `ref`: referencia orientativa a la medida del Anexo II del RD 311/2022;
- `minCategory`: categoría desde la que la medida suele ser exigible (orientativo);
- `verified: false`: **ninguna referencia está contrastada todavía** con el texto vigente.

## Pendiente antes de uso profesional
1. Contrastar cada `ref` con el Anexo II del RD 311/2022 y las guías CCN-STIC.
2. Contrastar `minCategory` con la tabla de selección de medidas por categoría.
3. Marcar `verified: true` y registrar fuente y fecha de revisión.
4. Ampliar hacia el conjunto completo de medidas del Anexo II (hoy se agrupan varias medidas en un mismo control).

Referencias especialmente a revisar: `mp.info.9` (copias de seguridad), `op.exp.2/3` (configuración), `op.mon.2` y art. 31 (auditoría/revisión), `op.nub.1` (nube).

No se debe interpretar este repositorio como una matriz normativa exhaustiva.
