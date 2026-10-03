# Ajuste manual de saldo

Declarar "en esta billetera tengo X" sin tener que cargar cada movimiento. Sirve para el **saldo inicial** al crear una
billetera y para corregir el saldo cuando te olvidaste de cargar algo.

## Cómo se usa

En el modal de **billetera** (al crearla o al editarla) está el campo **Saldo actual**:

- Al **editar**, viene precargado con el saldo que EcoTrack tiene calculado a hoy.
- Al **crear**, si lo dejas vacío no pasa nada; si pones un valor, es el saldo inicial.
- Escribe el saldo **real** que tienes (no la diferencia) y guarda.

Si el valor cambió, EcoTrack crea **una transacción de ajuste** por la diferencia. Si no cambió, no crea nada: cambiar solo el
nombre de la billetera nunca genera un ajuste.

| Saldo en EcoTrack | Dices que tienes | Se crea |
|---|---|---|
| 800 | 1000 | una transacción de **+200** |
| 800 | 700 | una transacción de **−100** |
| 800 | 800 | nada |

> **Billeteras compartidas.** "Saldo actual" es el saldo **total** de la billetera, no tu porcentaje de titularidad. El
> campo lo avisa con un texto de ayuda.

## Qué es un ajuste, en realidad

No se pisa el saldo: el saldo de una billetera **no es una columna**, es la suma de sus transacciones. El ajuste es una
transacción más, con estas particularidades:

- Se ve en **Transacciones** como cualquier otra, y se puede **editar o borrar**. Su importe es la **diferencia**
  (+200, −100), no el saldo; si lo editas, cambias el saldo.
- Suma al saldo, pero **no cuenta como ingreso ni gasto** en el dashboard ni en los gráficos.
- Lleva un `Operation` de tipo `BalanceAdjustment`, el mismo mecanismo que usan las transferencias entre billeteras propias
  (`OwnTransfer`); no hay cambios de esquema.
- Si le pasas una fecha anterior (no hay selector hoy: siempre es la de hoy), solo contaría los movimientos hasta ese día.

## Reglas y límites

- Hace falta permiso de **edición** sobre la billetera, y que la cuenta no esté cerrada.
- No consume el cupo diario de transacciones del plan: se trata como una acción de configuración.
- El ajuste solo se crea si el valor difiere de lo que el modal mostró al abrirse (`BalanceAtLoad`). Así, guardar un cambio de
  nombre no pisa un movimiento que otro cotitular haya cargado mientras tenías el modal abierto.
- Si el campo no viaja de vuelta en el envío, la edición simplemente no ajusta: nunca ajusta de más.

## Dónde está en el código

| Pieza | Ubicación |
|---|---|
| Campo y aviso | `WalletViewModel.Balance` / `BalanceAtLoad` (`EcoTrack/ViewModels`) |
| Orquestación del guardado | `CommonController.Save`, tras `SaveWalletHandler` |
| Crear el ajuste | `Features/Wallets/AdjustWalletBalance` (`AdjustWalletBalanceHandler`) |
| Cálculo del saldo | `WalletBalanceCalculator` (`Common/Services`), compartido por el modal y el handler |
| Exclusión de ingresos/gastos | `AnalyticsCore` |
| Tipo de operación | `OperationTypes.BalanceAdjustment` (`EcoTrack.Core.Constants`) |
