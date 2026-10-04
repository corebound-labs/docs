# Filtros del dashboard

Arriba del dashboard hay dos filtros: el **rango de fechas** y las **billeteras**.

## Rango de fechas

Botones: **Todo**, **Este mes**, **Este año**, **6 meses**, **3 meses** y **Rango personalizado** (calendario con dos meses;
elige inicio y fin).

- **Este mes**: del día 1 del mes en curso a hoy.
- **Este año**: del 1 de enero a hoy.
- **6 / 3 meses**: hacia atrás desde hoy.
- Las fechas se calculan en la **hora local** del dispositivo (antes se pasaban por UTC y podían correr un día).

## Billeteras

El botón **Billeteras** abre una lista con casillas.

- **Marcar o desmarcar no recarga el dashboard.** Los cambios quedan pendientes hasta pulsar **Aplicar** o cerrar la lista
  (tocando fuera o el propio botón). Así puedes cambiar varias billeteras con una sola carga.
- Si cierras la lista sin ninguna marcada, se descarta el cambio y se queda la selección que ya estaba aplicada.
- El botón de arriba a la derecha de la lista alterna: **Todas** marca todas y, cuando ya están todas marcadas, pasa a
  **Quitar todas** (las desmarca para que elijas solo las que quieras). **Aplicar** se deshabilita sin ninguna marcada.

## Filtros predeterminados

El botón **☆ Predeterminar** guarda el rango y las billeteras que estás viendo; al abrir el dashboard se aplican solos.
Cuando coinciden con lo guardado se ve **★ Predeterminado**, y pulsarlo otra vez los quita.

- Se guardan **en ese navegador** (`localStorage`): son por dispositivo, no por usuario. Sin almacenamiento disponible (por
  ejemplo, navegación privada) avisa y no guarda.
- Si guardaste "todas las billeteras", una billetera nueva entra sola. Las billeteras guardadas que ya no existen se
  ignoran; si no queda ninguna, se muestran todas.
- Guardarlos en el perfil para que valgan en todos tus dispositivos está pendiente
  ([EcoTrack#148](https://github.com/corebound-labs/EcoTrack/issues/148)).
