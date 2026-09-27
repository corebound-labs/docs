# Contactos y gastos compartidos

Cómo agregar personas con las que compartís cuentas o billeteras, y cómo llevar
gastos en común (viajes, hogar compartido…) con saldos y liquidación. Para dar de
alta cuentas, billeteras, tarjetas y transacciones ver
[Primeros pasos](getting-started.md).

## Contactos

**Contactos → + Crear contacto**: Nombre, y opcionalmente un Email.

- **Con email**: aparece un ícono de sobre en su fila para enviarle (o
  reenviarle) una invitación por correo. Al abrir el link, la otra persona ve una
  pantalla de "Solicitud de conexión" —*"Fulano (fulano@mail.com) quiere añadirte a
  su lista de contactos en EcoTrack"*— y puede **Aceptar** o **Rechazar**. Al
  aceptar, ambos os veis mutuamente como contactos y ya podés compartirle cuentas o
  billeteras.
- **Sin email**: sigue sirviendo como una etiqueta para repartir gastos con alguien
  que no usa la app — no recibe invitación ni puede entrar a EcoTrack, es solo un
  nombre para tus reportes.

Cada contacto muestra su **Estado de invitación** (pendiente, aceptada, rechazada o
cancelada) y si es **Interno** (ya vinculado a un usuario real de la app).

## Compartir una cuenta o billetera

Desde el modal de crear o editar una **Cuenta** o una **Billetera** hay una sección
**Participants**: elegís un contacto en el desplegable y hacés clic en **+** para
agregarlo a la lista. Para cada persona agregada se define:

- **Permiso**: `Edit` (puede ver y modificar) o `Read` (solo puede ver).
- **% Titularidad**: qué porcentaje de esa cuenta/billetera es suyo.
- **Válido desde**: a partir de cuándo cuenta esa titularidad.

El dueño real (`Owner`) no se puede editar ni quitar desde ahí. Si compartís una
**Cuenta**, cada cotitular hereda automáticamente acceso a sus billeteras (se ve
marcado como "(heredado)" en la billetera) — podés declararle ahí un permiso
distinto para una billetera puntual, pero no podés quitarle del todo el acceso
heredado sin tocar su % en la Cuenta. Quien es cotitular (no dueño) ve un botón
para **salir** de la cuenta o billetera compartida cuando quiera dejar de tenerla.

## Gastos compartidos por evento

Al [crear una transacción](getting-started.md#transacciones) podés ponerle una
**Etiqueta de evento** libre (ej. "Viaje a la playa", "Gastos del depto") y agregar
**Participants**: por cada contacto sumado a esa transacción se define quién es el
**Pagador**, qué **% de participación** le toca (50% por defecto entre dos
personas) y su **Permiso** sobre esa transacción puntual.

En **Eventos** (menú lateral) se ve el resumen: cada etiqueta agrupa sus
transacciones y muestra, por cada contacto, si **te debe** o **le debés**, más un
**Saldo global** arriba de todo. Hacer clic en una fila lleva a las transacciones
de ese evento.

### Saldar deudas
- **Saldar** (en la fila de una persona): solo aparece del lado de a quién le
  deben — registra que te pagaron esa deuda puntual.
- **Saldar todo**: liquida de una vez todas las deudas a tu favor. Si para
  alguna persona no se puede determinar automáticamente de qué billetera suya
  sale el pago, esa persona se salta y hay que saldarla a mano desde su fila.
- Al saldar, a la otra persona le llega un aviso ("*Fulano te marcó un pago de
  $X*") con botones **Confirmar** o **Descartar**, para que quede de acuerdo en
  ambos lados.
- Elegir **"Envío a otra persona"** como tipo de transacción es la otra puerta de
  entrada a este mismo mecanismo — ver [Tipo de transacción](getting-started.md#tipo-de-transacción).
