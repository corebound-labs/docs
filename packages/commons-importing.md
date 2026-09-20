# Commons.Importing

Lectura e interpretación de archivos tabulares (CSV, XLS, XLSX) exportados por bancos u otras apps. No depende de
ningún dominio: devuelve filas ya tipadas y cada aplicación decide qué hacer con ellas.

## Flujo

```csharp
var file      = TabularReader.Read(stream, fileName);          // filas de texto (máx. 5000 por defecto)
var detection = HeaderDetector.Detect(file.Rows);              // fila de cabecera + papel de cada columna (o null)
var mapping   = ColumnMapping.From(detection);                 // editable por el usuario
var rows      = RowMapper.Map(file.Rows, mapping);             // ParsedRow: fecha, concepto, importe con signo, error
```

## Piezas
| Tipo | Qué hace |
|---|---|
| `TabularReader` | CSV (delimitador `;` `,` tab `\|` detectado, UTF-8 o Windows-1252, comillas), XLS y XLSX con **ExcelDataReader** (MIT). Solo lee celdas: logos e imágenes de la cabecera se ignoran. Las filas vacías se conservan para que los números de fila coincidan con el archivo. Un archivo ilegible lanza `ImportFileException` (es una `InvalidOperationException`) |
| `HeaderDetector` | Busca la cabecera en las 30 primeras filas por palabras clave (es/en) y completa lo que falte mirando el contenido. `BuildResult(rows, fila)` recalcula para la fila que elija el usuario |
| `ColumnMapping` / `RowMapper` | Fecha, concepto y **una** columna de importe con signo **o** cargo/abono (el cargo resta y el abono suma, con el signo que traiga el archivo). Las filas de pie ("Total", "Saldo…") se ignoran; el resto de filas malas llevan `Error` |
| `ValueParsers` | Importes (`1.234,56`, `1,234.56`, `12,5-`, `(12,50)`, símbolos de moneda) y fechas (día-primero por defecto, mes-primero si el archivo lo exige, ISO, con o sin hora) |
| `TextNormalizer` | `Fold` (mayúsculas sin tildes) y `NormalizeConcept` (sin números, fechas ni puntuación), para huellas de duplicados y reglas de categoría |

## Límites y decisiones
- Una sola hoja (la primera con datos), 5000 filas y 100 columnas por defecto; `TabularFile.Truncated` avisa.
- Las fechas de una hoja Excel solo se reconocen si la celda tiene **formato de fecha** (como las guardan los bancos);
  un número suelto no se toma por fecha.
- El tamaño del archivo y la extensión permitida los valida quien llama (`TabularReader.IsSupported`).
- Los textos importados son datos no confiables: quien los muestre debe codificarlos, y quien los reexporte a Excel
  debe neutralizar las fórmulas (`=`, `+`, `-`, `@`).
- Sin probar aún con extractos reales de bancos concretos (Sabadell, Revolut…): los tests usan archivos sintéticos.
