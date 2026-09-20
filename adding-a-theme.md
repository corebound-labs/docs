# Añadir un tema a EcoTrack

Cada cuenta guarda su tema (`User.ThemeId`); el selector del Perfil ("Apariencia") muestra una
tarjeta con vista previa por cada tema del catálogo. Añadir uno son dos pasos:

1. **Crear el CSS.** Copia `EcoTrack/wwwroot/css/themes/theme-dark.css` a
   `theme-<id>.css` y cambia los valores. Debe definir **las mismas variables** (134) y usar el
   selector `:root, html[data-theme="<id>"] { … }`. No hay estilos específicos de tema fuera de
   estos ficheros. `--page-bg-color` (color sólido de fondo) es obligatorio: lo usan las barras de
   Safari en iOS y el `<meta name="theme-color">`.
2. **Registrarlo** en `EcoTrack/Themes/ThemeCatalog.cs` con una línea:

   ```csharp
   new("ocean", "Océano", "Azules profundos…", "Oscuro", "/css/themes/theme-ocean.css", "#03111f"),
   ```

   El último valor es el color de la barra del navegador (igual que `--page-bg-color` del tema).

No hace falta tocar el layout, el selector ni la base de datos: el id se guarda como texto
(`a-z`, `0-9` y guiones, máx. 30) y un id retirado del catálogo cae al tema por defecto (`dark`).

## Cómo funciona
- **Con sesión**, el tema de la cuenta llega en un claim (`ecotrack:theme`, leído de BD en cada
  petición vía `UserAccessCache`) y el layout lo pinta en el servidor (`<html data-theme>` y el
  `<link>` del CSS): no hay parpadeo de otro tema.
- **Sin sesión** (login), se usa el último tema recordado en `localStorage`.
- **Guardar** (`POST /Profile/UpdateTheme`) valida el id contra el catálogo, lo guarda e invalida
  la caché de acceso para que la siguiente página ya salga con el tema nuevo.
- La vista previa del selector es el componente `ThemePicker` de `UiMetadata.Elements`.
