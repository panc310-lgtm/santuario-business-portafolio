# Santuario Business · Portafolio

Página estática en español: **Empresas con las que hemos trabajado**.

La colección presenta Neutra Despertar, Open World Agency, HD Company y ErikaCell, con tarjetas ilustradas, navegación por empresa y enlaces a sus sitios y redes.

## Publicación

La web se publica en GitHub Pages mediante el flujo `.github/workflows/pages.yml`. Cada actualización de `main` genera la página y despliega únicamente la carpeta `dist/`. También se puede ejecutar el flujo manualmente desde la pestaña **Actions**.

## Editar y generar la página

Los nombres, textos y enlaces están en `empresas.json`. HD Company conserva únicamente su nombre y enlace. Las imágenes están en `dist/assets/`, los estilos en `dist/styles.css` y la navegación en `dist/portfolio.js`.

Con Node.js 24, sin instalar dependencias:

```sh
node build-page.mjs
```

El generador actualiza `dist/index.html`. CSS, JavaScript e imágenes se conservan dentro del repositorio. La composición actual está diseñada para cuatro empresas; cambiar su cantidad requiere adaptar los contadores y la navegación.

La página incluye una versión de sus estilos y navegación en cada generación para que el navegador reciba las correcciones sin reutilizar esos archivos de una versión anterior.

Para una vista previa local, ejecutar desde la carpeta del repositorio:

```sh
python3 -m http.server 8080 --directory dist
```

Abrir `http://localhost:8080` en el navegador.

## Interacción y accesibilidad

- Desplazamiento vertical con una empresa destacada a la vez.
- Botones nativos para seleccionar empresa y enlaces accesibles con teclado.
- La misma galería en ventanas bajas, móviles verticales y móviles horizontales.
- Con movimiento reducido, los cambios de tarjeta son instantáneos y se mantienen los controles.
- Los detalles permiten desplazamiento si el texto excede el espacio disponible.
- Contenido y enlaces disponibles cuando JavaScript está desactivado.

## Origen

Exportación de la página de Santuario Business aprobada el 2 de octubre de 2026, desde la revisión `becfa3bf871e0b794d24b4b0bb24c1a8000c939a`. Este repositorio tiene su propio historial y publicación.

Los nombres y activos de cada marca se incluyen para presentar los trabajos descritos por Santuario Business; este repositorio no concede derechos sobre esas marcas.

Referencia de configuración: [flujos personalizados de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
