# ENS Readiness Assistant — GRC v2

Herramienta web ligera para realizar un **assessment de readiness ENS con enfoque GRC**.

## Objetivo

El proyecto no intenta sustituir una auditoría ENS ni convertirse todavía en una plataforma GRC compleja. Su función es ayudar a una organización a responder:

- ¿Cuál es nuestro contexto?
- ¿Qué aplicabilidad preliminar identificamos?
- ¿Qué controles tenemos?
- ¿Qué no sabemos?
- ¿Qué evidencias podemos aportar?
- ¿Qué gaps tenemos?
- ¿Quién debe actuar y cuándo?

## Estructura

```text
index.html
styles.css
app.js
data/
  controls.js
  recommendations.js
  schema.js
docs/
  methodology.md
  scoring.md
  evidence-model.md
  ens-mapping.md
  roadmap.md
  user-guide.md
```

## Ejecución

No necesita backend.

Puedes abrir `index.html` directamente en el navegador o servir el directorio con cualquier servidor estático.

## Exportación

El assessment puede exportarse como:

```text
ens-project.json
```

Este formato está pensado como contrato de intercambio futuro con otras herramientas GRC/ENS.

## Metodología

El assessment separa:

```text
Estado del control
        +
Disponibilidad de evidencia
        +
Responsable
        +
Fecha objetivo
        =
Readiness GRC
```

"Sí" no significa automáticamente "cumplimiento ENS". La aplicabilidad, categorización y correspondencia normativa deben revisarse para el alcance real.

## Novedades v2.1

- Corregido: el contenedor principal no aplicaba estilos (`<main>` sin clase `app-main`).
- Corregido: en móvil, los botones de Guardar/Cargar/Exportar desaparecían sin alternativa.
- Nuevo: botón **Importar JSON** — cierra el ciclo de `ens-project.json` (exportar → importar), con validación básica de esquema.
- Nuevo: validación de campos obligatorios en el paso 1 (organización y tipo) antes de continuar.
- Nuevo: indicador de "cambios sin guardar" en la cabecera y aviso al cerrar la pestaña con cambios pendientes.
- Nuevo: `data/recommendations.js` y `data/schema.js` ahora se cargan y se usan realmente (recomendación por prioridad en el plan de acción; `schema`/`version` del export tomados de `schema.js`).
- Nuevo: 4 controles adicionales (cifrado, desarrollo seguro, gestión de cambios, gestión de configuración), incluyendo los primeros de prioridad **baja**.
- Mejora: grupos de radio con `<fieldset>`/`<legend>` y foco visible para accesibilidad.

## Próximo paso recomendado

Antes de introducir backend, IA, autenticación o bases de datos, estabiliza:

1. modelo GRC;
2. cuestionario;
3. scoring;
4. modelo de evidencias;
5. modelo de gaps;
6. plan de acción;
7. exportación/importación.

Después se puede convertir en una plataforma.
