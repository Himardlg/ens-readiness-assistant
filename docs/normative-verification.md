# Estado de verificación normativa del catálogo

**Estado de esta entrega: pendiente de verificación integral.**

La biblioteca muestra todos los controles que ya estaban incluidos en el proyecto (38 controles en la versión recibida). No debe confundirse ese conjunto de controles GRC agrupados con el catálogo íntegro de medidas y submedidas del Anexo II del Real Decreto 311/2022. Tampoco se ha convertido automáticamente cada referencia aproximada en una referencia normativa validada.

## Criterio de integridad

Para declarar completo y verificado el catálogo se debe construir una matriz fila a fila con, al menos:

- código oficial exacto de medida y submedida del Anexo II;
- denominación oficial y marco (organizativo, operacional o medidas de protección);
- dimensiones de seguridad afectadas;
- categoría o categorías en las que resulta aplicable, incluidas las condiciones y refuerzos;
- correspondencia con el control de evaluación interno;
- fuente y versión normativa, fecha de contraste y revisor.

La categoría no se debe inferir solo del nombre de la medida. La aplicabilidad concreta depende del sistema, sus dimensiones y las condiciones del Anexo II.

## Fuente primaria

- Real Decreto 311/2022, de 3 de mayo, texto consolidado: <https://www.boe.es/eli/es/rd/2022/05/03/311/con>
- Anexo I: categorización de los sistemas.
- Anexo II: medidas de seguridad.

## Estado de los controles heredados

Los 38 controles heredados conservan sus referencias orientativas. El campo `verified` permanece en `false` deliberadamente. La interfaz muestra «Pendiente de verificar» y la exportación JSON conserva `refsVerified: false`. No se presenta esta entrega como certificación, auditoría ni validación completa del ENS.

## Siguiente trabajo necesario para cerrar la verificación

1. Transcribir el inventario oficial de medidas y submedidas del Anexo II.
2. Contrastar individualmente códigos, títulos, dimensiones, categorías y refuerzos.
3. Desglosar controles internos que agrupen varias medidas oficiales.
4. Añadir trazabilidad a la fuente oficial y pruebas automatizadas de integridad (sin códigos duplicados ni referencias huérfanas).
