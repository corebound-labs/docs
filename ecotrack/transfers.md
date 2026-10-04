# Transferencias entre billeteras propias

Mover dinero de una billetera tuya a otra. En el modal de **transacciones**, elige el tipo **Transferencia entre mis
cuentas** y la **billetera de destino**.

## Qué se crea

Dos transacciones **vinculadas** por un mismo `Operation` (`OperationType = OwnTransfer`):

| Lado | Billetera | Importe |
|---|---|---|
| Origen | la elegida como billetera | `−importe` |
| Destino | la billetera de destino | `+importe` |

- La billetera de **destino no puede ser la de origen**: el selector no ofrece la de origen, y si la cambias después, el
  destino se reinicia. El servidor también lo rechaza.
- Solo entre billeteras del **mismo activo/divisa**, y con permiso de **edición en ambas**. Para pagar a otra persona se usa
  el tipo **Envío a otra persona** (saldar deudas).
- No crea etiqueta de evento ni reparto entre participantes.

## Editar una transferencia

Al editar **cualquiera de los dos lados** se actualiza también el otro, para que sigan sumando cero:

- El otro lado recibe el **importe con el signo opuesto** y la **misma fecha** (el `Operation` también).
- La **descripción** se copia solo si los dos lados tenían la misma nota. Los textos automáticos ("Transferencia a X" /
  "Transferencia desde Y") se dejan como están.
- Antes de guardar nada se comprueba que la otra billetera esté en una cuenta **abierta** y que tengas permiso de
  **edición** sobre ella. Si no, la edición se rechaza y no cambia nada.
- Una transacción ya creada **no se puede mover a otra billetera**.

Las transferencias que se editaron antes de este arreglo pueden haber quedado con importes distintos: no se reparan solas;
edita uno de los dos lados y se corrige.

## Borrar

Borrar un lado **no borra el otro**: este se desvincula del `Operation` y queda como un movimiento normal.
