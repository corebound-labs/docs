# Validación del largo de los textos

Cada campo de texto que el usuario escribe a mano tiene un largo máximo (nombre de cuenta o billetera, descripciones,
etiqueta de evento…). Esta guía explica cómo se aplica ese límite y qué hacer al añadir un campo nuevo.

## El problema que resuelve

Antes, un texto más largo que la columna llegaba hasta SQL Server y fallaba con un error 500 (`String or binary data would be
truncated`). Además el valor que cita ese error viene **cortado a 100 caracteres**, así que parece que la columna mide 100
aunque mida 250. Ahora el usuario ve un aviso claro con el campo, el límite y el largo real.

## Dos capas

| Capa | Qué hace | Quién la protege |
|---|---|---|
| **Servidor** — `MaxLengthValidationInterceptor` | Antes de guardar, compara **todos** los strings con el `HasMaxLength` que declara el `EcoTrackDbContext` y rechaza el que se pase: `El campo Wallet.Description no puede superar los 250 caracteres (tiene 312).` Llega al usuario como un 400 con ese mensaje. | Es la que **protege de verdad**: no se puede saltar desde el navegador. |
| **Modal** — `[StringLength]` en el ViewModel | El input recibe `maxlength` ([UiMetadata](/packages/uimetadata-contracts.md)) y el navegador frena el tipeo en el límite. | Solo **ayuda de UX**. |

Además, algunos handlers validan antes con un mensaje más amigable (p. ej. `SaveWalletHandler` dice "La descripción no puede
superar los 250 caracteres (tiene 312)."). El interceptor cubre todo lo demás, incluidas las entidades futuras.

Qué **no** alcanza: las columnas cifradas en reposo (p. ej. la descripción de una transacción) no declaran límite a propósito,
porque el texto cifrado en Base64 es más largo que el original.

## Añadir una columna de texto nueva

1. Una constante en `FieldLimits` (`EcoTrack.Core.Constants`), p. ej. `public const int WalletDescription = 250;`.
2. En el `EcoTrackDbContext`: `entity.Property(e => e.Description).HasMaxLength(FieldLimits.WalletDescription);`.
3. En el ViewModel: `[System.ComponentModel.DataAnnotations.StringLength(EcoTrack.Core.Constants.FieldLimits.WalletDescription)]`
   (con el nombre completo, para no chocar con los `using` de `UiMetadata.Contracts`).
4. Si quieres un mensaje propio en el handler, valida con la misma constante.

Con eso el límite está en **un solo lugar** y lo usan la base, el servidor y el modal. Si el límite de una columna ya
existente cambia, hay que añadir una migración además de tocar la constante.
