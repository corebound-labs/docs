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

## Temas incluidos

| Id | Nombre | Tipo | Acento |
|---|---|---|---|
| `dark` | Oscuro | Oscuro | Violeta (por defecto) |
| `light` | Claro | Claro | Violeta |
| `ocean` | Océano | Oscuro | Azur |
| `mint` | Menta | Claro | Turquesa |

Océano y Menta se derivaron de Oscuro y Claro girando la familia de color de acento y los neutros (fondos, bordes, textos), manteniendo saturación, luminosidad y los colores semánticos (verde de éxito, rojo de peligro, naranja de aviso). Al crear un tema conviene comprobar el contraste del texto blanco sobre `--color-primary` y `--color-primary-strong` (los botones principales) y de `--text-muted` sobre el fondo: los temas actuales quedan entre 4,2 y 6,3 en botones y por encima de 4,5 en el texto atenuado.
