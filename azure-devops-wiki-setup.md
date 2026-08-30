# Publicar esta documentación también en Azure DevOps Wiki

Este documento **no** forma parte del sitio Docsify (vive fuera de
`packages/`, a propósito) — son instrucciones para el usuario, no una página
de la wiki en sí.

## Contexto

El contenido de `packages/*.md` (Parte 2 de la spec) ya es Markdown estándar
(CommonMark/GFM), sin sintaxis específica de Docsify dentro de las páginas
— los únicos archivos que usan convenciones propias de Docsify
(`_sidebar.md`, `_coverpage.md`, `index.html`) viven en la raíz del repo,
**no** dentro de `packages/`. Eso significa que la misma carpeta `packages/`
se puede publicar tal cual en Azure DevOps Wiki, sin ningún archivo
adicional ni reescritura de contenido.

Azure DevOps Wiki tiene una función llamada **"Publish code as Wiki"**: en
vez de crear páginas de wiki una por una a mano, apunta la Wiki directamente
a una carpeta de un repo Git dentro de Azure Repos que contenga archivos
`.md`, y Azure DevOps los renderiza como páginas navegables — la estructura
de carpetas se traduce directo en la jerarquía de páginas de la wiki.

**Limitación real**: esa función solo apunta a repos dentro de Azure Repos,
no puede apuntar a un repo de GitHub externo. Como GitHub está bloqueado en
tu empresa, hace falta llevar la carpeta a un repo de Azure Repos primero —
ese paso es manual, fuera de lo que Claude Code puede hacer desde este
entorno (sin credenciales de tu Azure DevOps).

## Pasos

### 1. Llevar `packages/` a un repo de Azure Repos

Elegí una de estas opciones (decisión tuya, según lo que tu empresa permita):

- **Subida manual**: descargá/exportá la carpeta `packages/` de este repo de
  GitHub y subila a un repo de Azure Repos existente (o uno nuevo) de tu
  proyecto de trabajo — como una carpeta más del repo, con su propio commit.
- **Mirror/clonado**: cloná este repo de GitHub localmente (donde sí tengas
  acceso a ambos) y hacé push de una copia a un remote de Azure Repos.
  Esto es una operación puntual — no configura ninguna sincronización
  automática entre ambos repos (eso sería una spec aparte, ver más abajo).

En cualquier caso, el resultado esperado es: un repo de Azure Repos con una
carpeta `packages/` (o el nombre que prefieras) conteniendo exactamente los
mismos `.md` que ves en `packages/` de este repo de GitHub.

### 2. Activar "Publish code as Wiki"

En Azure DevOps:

1. `Repos` → seleccioná el repo donde subiste `packages/`.
2. `Wikis` (menú lateral) → `Publish code as Wiki`.
3. Elegí ese repo, la rama (`main`), y la carpeta `packages/` como raíz de
   la wiki.
4. Confirmá — Azure DevOps genera la wiki automáticamente, una página por
   archivo `.md`, con la jerarquía de carpetas como menú lateral.

### 3. Mantenerla actualizada

Cada vez que actualices un `packages/*.md` en el repo de GitHub (fuente de
verdad, junto con el `README.md` del paquete correspondiente), repetí el
paso 1 para ese archivo en el repo de Azure Repos — Azure DevOps Wiki
"Publish code as Wiki" lee directo del repo, así que un nuevo commit ahí
actualiza la página automáticamente, sin repetir el paso 2.

## Qué NO cubre este documento

- Crear o configurar nada dentro del Azure DevOps real de tu empresa — eso
  lo hacés vos, siguiendo los pasos de arriba.
- Automatizar el mirror/sincronización entre el repo de GitHub y el de
  Azure Repos (un pipeline que sincronice cambios de un lado al otro) — no
  se pidió en esta spec; si hace falta a futuro, es una spec aparte.
