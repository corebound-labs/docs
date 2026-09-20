# Corebound Labs — Documentación

Este sitio tiene **dos áreas separadas**. Usá las pestañas de arriba.

| | 📦 Paquetes (NuGet) | 🏠 Proyecto EcoTrack |
|---|---|---|
| **Qué es** | Librerías reutilizables (`Commons.*` y `UiMetadata.*`) | Una aplicación web concreta de finanzas personales y compartidas |
| **Tipo** | Class Libraries (`Commons.*`) y Razor Class Libraries (`UiMetadata.*`) | ASP.NET Core MVC (.NET 10) |
| **Conocen el dominio** | **No.** No saben qué es una cuenta ni una transacción | **Sí.** Cuentas, wallets, tarjetas, transacciones, planes |
| **Se reutilizan** | Sí, en cualquier proyecto .NET | No, es un producto |
| **Ejemplos de código** | Genéricos (Product, Order…), pensados para copiar a cualquier app | Los del propio código de EcoTrack |
| **Dónde está el código** | `EcoTrack/Commons/...` (hoy dentro del repo de EcoTrack, listos para extraerse) | `EcoTrack/EcoTrack.*` |

## ¿Qué busco?

- **"¿Cómo uso X en mi proyecto?"** → [Paquetes](/packages/)
- **"¿Cómo funciona tal cosa de EcoTrack?"** (seguridad, roles, 2FA, despliegue…) → [Proyecto EcoTrack](/ecotrack/)
- **"¿Qué paquetes usa EcoTrack y cómo?"** → [Qué paquetes usa EcoTrack](/ecotrack/uso-de-paquetes.md)

## Regla de oro

Los paquetes **nunca** dependen de EcoTrack. EcoTrack depende de los paquetes.
Todo lo que mencione entidades o pantallas de EcoTrack vive en la pestaña
*Proyecto EcoTrack*; la pestaña *Paquetes* es documentación de librería pura.
