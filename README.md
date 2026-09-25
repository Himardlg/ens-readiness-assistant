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

📄 Licencia

Este proyecto está publicado bajo licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente, citando la fuente.

Ver archivo [LICENSE](./LICENSE) para más detalles.

---

## 👤 Autor

**Himar de León González**  
Consultor GRC · Ciberseguridad · Gobernanza de IA

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Himar%20de%20León%20González-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/himar-de-leon-gonzalez)



