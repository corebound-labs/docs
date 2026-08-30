# UiMetadata.Charts

## Qué es

Motor de charts (ApexCharts) + tarjeta de KPI: chrome visual, theming vía
CSS custom properties (`--chart-*`) y el traductor genérico de un
`ChartViewModel` (`Id`/`Type`/`Title`/`Labels`/`Series`/`Options`) a
opciones de ApexCharts según `Type` (`line`/`area`/`bar`/`donut`/`pie`).

## Cuándo usarlo

Para pintar cualquier cantidad de charts/KPIs en cualquier vista — **no
hay** un componente "Dashboard" monolítico, cada tarjeta es independiente y
el layout (columnas, proporciones) lo decide el consumidor con su propio CSS.

## Instalación

```xml
<ProjectReference Include="..\Commons\UIMetadata\UiMetadata.Charts\UiMetadata.Charts.csproj" />
```

```csharp
builder.Services.AddControllersWithViews()
    .AddUiMetadataCharts(); // registra también UiMetadata.Modal en cascada
```

```csharp
@await Html.PartialAsync("~/Views/Shared/_ChartsScripts.cshtml")
```

Ese partial trae ApexCharts (versión + `integrity` fijas) + `charts.css`/
`charts.js`. **No** forma parte de `_UiMetadataStyles.cshtml`/
`_UiMetadataScripts.cshtml` (los agregadores de toda la familia) — no todas
las páginas tienen charts, así que no debe cargar global. Cada vista con
`_ChartCard.cshtml` incluye `_ChartsScripts.cshtml` por su cuenta.

## Ejemplo mínimo de uso

```csharp
@await Html.PartialAsync("~/Views/Shared/_ChartCard.cshtml", new UiMetadata.Charts.Models.ChartCardModel
{
    Id = "balanceChart", Title = "Balance acumulado"
})
```

```js
const charts = await (await fetch(loadChartUrl)).json(); // shape { id, type, title, labels, series, options }
charts.forEach(c => renderChart(c, `#${c.id}`));
```

KPI card:

```csharp
@await Html.PartialAsync("~/Views/Shared/_KpiCard.cshtml", new UiMetadata.Charts.Models.KpiCardModel
{
    Id = "kpi-savings", Label = "Ahorro acumulado"
})
```

```js
document.getElementById("kpi-savings").textContent = "1.234 €";
setKpiBadge("kpi-savings-badge", 12.5, "% vs año anterior");
```

## Archivos a tocar/crear al integrarlo en un proyecto nuevo

1. `ProjectReference` + `.AddUiMetadataCharts()`.
2. `_ChartsScripts.cshtml` en cada vista con charts (no en el layout global).
3. `_ChartCard.cshtml`/`_KpiCard.cshtml` por cada chart/KPI.
4. `_ChartModal.cshtml` una sola vez por página (el modal de "expandir chart" — resuelve qué chart mostrar contra el registro interno de `charts.js`).
5. Un endpoint backend que devuelva `ChartViewModel[]` con el shape esperado.
6. El propio layout de columnas (CSS) — el paquete no ofrece utilidades `.charts-grid-N`, cada consumidor arma el suyo.

## Design tokens (`--chart-*`, sin capa `:root` propia)

A propósito no hay bloque `:root` en `charts.css` — a diferencia de
`grid.css`, acá los tokens **son** los valores finales que el consumidor
define en su tema; el fallback vive en el punto de uso para no arriesgar
pisar el valor real por orden de carga de `<link>`.

| Token | Usado por |
|---|---|
| `--chart-card-bg-start`/`-end`, `-border`, `-shadow`, `-hover-shadow`, `-hover-border` | `.chart-card` |
| `--chart-kpi-hover-shadow` | `.kpi-card:hover` |
| `--chart-positive`/`-positive-end`/`-negative`/`-negative-end` | Colores de series (leídos por JS) |
| `--chart-area-start`/`-end` | Gradiente de charts `line`/`area` |
| `--chart-grid-soft`/`-strong`, `--chart-donut-track`, `--chart-glow`, `--chart-donut-label`/`-value` | Resto del theming de ApexCharts |

## Dependencias

`UiMetadata.Modal` (reusa `.ui-modal`/`.ui-modal-content-lg` para el modal
de "expandir chart" en vez de un sistema propio).
