# Versiones: cómo se numeran y cómo se publican

Cada vez que algo llega a `master` se publica una versión nueva de forma automática (workflow **Release** de
`Commons-CI`, el mismo para EcoTrack y Commons). La versión sale **de los mensajes de commit**, así que el tipo del
commit (o del título de la PR, si se hace *Squash and merge*) decide qué número sube.

## Formato

```
1.311.0-10042
│ │   │  └──── sufijo: MMdd + número de build de ese día  →  4 de octubre, segunda versión
│ │   └─────── último número
│ └─────────── número del medio
└───────────── primer número
```

| Tipo de commit | Qué sube | Ejemplo |
|---|---|---|
| `feat:` | el **número del medio** | `1.309.0` → `1.310.0` |
| `fix:` | el **último número** | `1.309.0` → `1.309.1` |
| `feat!:` / `fix!:` (cambio incompatible) | el **primero** | `1.309.1` → `2.0.0` |
| cualquier otro (`docs`, `chore`, `ci`, `refactor`, `test`…) | **nada** (cambia solo el sufijo) | `1.309.1` → `1.309.1` |

- Si en una publicación entran varios commits, gana el cambio **más grande** (`feat` gana a `fix`).
- Un cambio **incompatible** se marca con `!` justo antes de los dos puntos: `feat!: …` o `feat(api)!: …`. Con
  "Squash and merge", el título de la PR es el que cuenta. Escribir `BREAKING CHANGE` en el cuerpo del commit **no** se
  detecta.
- Por eso los commits deben ser **solo `feat` o `fix`**: un `ci:` o `chore:` no sube ningún número.
- Si un commit ya tiene su tag (por ejemplo, un re-run del workflow), conserva esa versión: no se crea otro tag.

### Cuándo pasar al primer número siguiente (2.0.0)

- **Commons (paquetes NuGet):** cuando se rompe la API pública y EcoTrack tendría que cambiar código para seguir
  compilando (renombrar o quitar un método público, cambiar una firma o el contrato de un atributo).
- **EcoTrack (la aplicación):** nadie la consume como librería, así que es un **hito que se decide**: la salida oficial, un
  rediseño completo o un cambio que obliga a migrar datos a mano.

## El sufijo `-MMddn`

`MMdd` es el día (zona horaria `Europe/Madrid`) y `n` el número de build de ese día, **sin separador**. `10042` es la
segunda versión del 4 de octubre. Límites conocidos:

- Desde la **décima build del día** el orden de NuGet deja de ser cronológico (`100410` queda por encima de `10051`).
- De **enero a septiembre** el sufijo empieza por cero (`01041`): NuGet lo acepta, SemVer estricto no.

## Versión base

La base de EcoTrack es el tag `v1.309.0-1004` (la numeración anterior era `v1.0.0-309`). El número que se publica sale
del **tag más alto** que alcanza el commit publicado, más los cambios que ningún tag contiene todavía. Las versiones
publicadas de Commons parten de `v1.0.0-18` (hoy `1.0.1-10041`).

## Dónde se ve la versión

- En el **pie** de la barra lateral y en las pantallas de acceso (`AppVersion`, sale de `git describe --tags` al compilar).
- En `GET /health` → `{"status":"ok","version":"v1.311.0-10042"}` (anónimo, sin caché).
- En los paquetes NuGet de Commons: los `.csproj` de EcoTrack los fijan a una versión exacta.

El despliegue (**Deploy**) arranca **después** de que **Release** termine: así el tag ya existe cuando se compila. Antes
arrancaban a la vez y el sitio mostraba siempre la versión anterior.

## Subir los paquetes de Commons en EcoTrack

1. Merge en `develop` de Commons y promoción a `master` (*Create a merge commit*): se publican los paquetes.
2. Anota la versión que sale en el tag de Commons.
3. En EcoTrack, cambia esa versión en todos los `PackageReference` de `Commons.*` y `UiMetadata.*` (todos comparten
   versión) y abre la PR.
