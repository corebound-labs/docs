# Exportación de transacciones

Descargar los movimientos de **una wallet** en un rango de fechas, en **CSV, Excel (.xlsx) o PDF**, desde
**Exportar** en el menú lateral (también hay un enlace "Exportar transacciones" en la pantalla Transacciones).

## Flujo del usuario
1. Elige la wallet (solo las que puede ver), la fecha de inicio, la de fin y el formato.
2. **Exportar** descarga el archivo. Si algo falla (rango inválido, límite del plan) se muestra el mensaje en la misma pantalla.

Las tres salidas llevan las mismas 5 columnas: **Fecha, Importe, Wallet, Categoría, Notas** (categoría = tipo de la
operación; notas = descripción de la transacción). Orden: fecha descendente, como la vista Transacciones. El nombre del
archivo incluye wallet y rango: `transacciones_Principal_20260901_20260930.xlsx`.

## Límite por plan
`Plan.MaxExportRangeDays` (`null` = sin límite): Basic **30 días** (inclusive, inicio y fin cuentan), Complimentary sin límite.
Se valida **en el servidor** (`ExportTransactionsHandler` → `IPlanLimitService.EnsureCanExportRangeAsync`, lanza
`PlanLimitReachedException` con `PlanLimitType.ExportRange`); la pantalla solo informa del límite. Migración:
`AddPlanMaxExportRangeDays`.

## Cómo funciona
- `ExportController` (`Index` GET, `Download` POST con antiforgery → `File(...)`): sin JavaScript, es un formulario normal.
- `Features/Transactions/ExportTransactions`: `ExportTransactionsHandler` valida (fin ≥ inicio, plan, y que la wallet sea visible con
  `IVisibilityService`), lee con una consulta ligera (solo `Operation`) y delega en `CsvExporter`, `XlsxExporter` (EPPlus, ya usado
  en la importación) o `PdfExporter` (QuestPDF, licencia Community).
- **CSV:** UTF-8 con BOM, separador `;` y decimales con coma (Excel en castellano lo abre bien). Los textos que empiezan por
  `= + - @` se neutralizan con `'` para que Excel no los ejecute como fórmula; en XLSX las celdas de texto van con formato texto.
- **PDF:** tabla simple A4 apaisado, con cabecera repetida y numeración de páginas.

## Límites conocidos
- La pantalla Transacciones **no tiene filtros de wallet ni de fechas** (solo búsqueda), así que su enlace "Exportar" no hereda nada:
  lleva a la pantalla de exportación. Un botón dentro de la grilla que herede filtros requeriría filtros nuevos en `UiMetadata.Grid`.
- Solo una wallet por exportación; sin historial de exportaciones (`ExportLog` no implementado: pendiente de decidir).
- No hay página de "ampliar plan" a la que enlazar desde el mensaje de límite.
- El importe se exporta como número con signo, sin símbolo de divisa (la wallet ya identifica el activo).
