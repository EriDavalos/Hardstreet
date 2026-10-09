# Mascotas (Mushu y Cinnamon)

La página busca estos dos archivos:

```
mascots/mushu.png      → dragón rojo (Mulán)
mascots/cinnamon.png   → mascota pastel (Cinnamoroll)
```

**Solo tienes que dejar los PNG aquí con esos nombres exactos.** Si existen, la
página los usa automáticamente en los tres lugares donde aparecen (hero, pastel y
carta). Si no existen, se muestran los dibujos vectoriales incluidos en
[index.html](../index.html) (dentro del `<svg class="sprite">`), así que la página
nunca se ve rota.

## Recomendaciones

- **PNG con fondo transparente.** Se muestran como recorte, con sombra suave.
- **Cuadrados** (1:1) o ligeramente verticales; el dibujo se escala al ancho del
  hueco, y las proporciones se respetan.
- **Tamaño sugerido: 512×512 px** (o más). Se muestran entre 54 y 138 px según la
  pantalla, así que 512 es más que suficiente para verse nítido en pantallas retina.
- Si el PNG no es cuadrado, el `alt` vacío y el recorte harán que se vea bien igual,
  pero un cuadrado es lo más predecible.

## Nota

Las ilustraciones incluidas son dibujos originales **inspirados** en esos
personajes, no los diseños oficiales: no se pueden distribuir los PNG con
copyright de Disney/Sanrio dentro del sitio. Al dejar tus propios archivos en esta
carpeta, tú decides qué imagen se muestra (y esa carpeta no se sube al repo si la
excluyes en `.gitignore`).
