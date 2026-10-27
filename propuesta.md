# Propuesta del proyecto: Inventario Tienda

Somos un equipo de tres estudiantes. Para el examen elegimos hacer un sistema de inventario para una tienda ficticia de artículos de oficina y hogar.

## Problema

En la tienda de ejemplo, los productos y sus cantidades se anotan en distintos lugares. Por eso cuesta encontrar un producto, saber cuánto hay y ver qué hace falta reponer.

## Objetivo

Hacer un prototipo web sencillo que permita consultar productos, revisar las existencias y registrar entradas y salidas.

## Usuarios

- La persona que administra la tienda y revisa los productos.
- La persona que lleva el inventario y registra movimientos.
- Quien necesita consultar si hay un producto disponible.

## Funciones principales

- Ver un resumen de productos, unidades y productos con pocas existencias.
- Buscar productos por nombre o código y filtrarlos por existencias.
- Agregar, editar y eliminar productos.
- Registrar entradas y salidas. El sistema no permite sacar más unidades de las que hay.
- Guardar los cambios en el navegador para la demostración.

## Requisitos básicos

- La página debe funcionar en una computadora y en una pantalla pequeña.
- Los textos y formularios deben estar en español.
- Los precios y las cantidades deben ser números válidos y no negativos.
- El prototipo debe abrirse en un navegador sin instalar programas.
- Los productos usados para la demostración son ficticios.

## Plan del equipo

| Integrante | Responsabilidades |
| --- | --- |
| Junior Silva | Coordinar el tiempo e integrar el proyecto. |
| Christhian Ortiz | Analizar el problema y definir los requisitos. |
| Marcos Guido | Diseñar las pantallas y preparar el prototipo. |

## Tiempo del examen

| Etapa | Tiempo |
| --- | ---: |
| Objetivo | 5 min |
| Análisis | 10 min |
| Planificación | 5 min |
| Diseño | 10 min |
| Prototipo | 15 min |
| Seguimiento y pruebas | 5 min |
| Aceptación | 3 min |
| Cierre y publicación | 2 min |
| **Total** | **55 min** |

## Diseño y herramientas

La aplicación tiene tres partes: **Resumen**, **Productos** y **Movimientos**. Está hecha con HTML, CSS y JavaScript. Los datos se guardan en el almacenamiento local del navegador; no usamos una base de datos.

## Seguimiento y control

Antes de presentar, revisaremos que se pueda navegar entre las tres partes, buscar productos, guardar cambios y registrar entradas y salidas sin dejar el inventario en negativo.

## Aceptación

Daremos por listo el prototipo si podemos demostrar al menos cinco cosas: consultar el resumen, buscar un producto, filtrar existencias bajas, registrar una entrada o salida válida y rechazar una salida mayor que el saldo disponible.

## Cierre

El examen pide subir el proyecto a GitHub y publicar el sitio con GitHub Pages. El equipo hará ese paso y presentará la dirección del sitio.

Después de la demostración se podrían confirmar la moneda y el nivel de existencias bajas, y más adelante agregar una base de datos.
