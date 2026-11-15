# Ἱστορίαι — Las Historias de Heródoto

Mapa interactivo de los lugares de las *Historias* de Heródoto, con el texto completo del libro
para leer mientras el mapa sigue la lectura. Interfaz en español e inglés.

Sitio: https://abimaelgarciah-blip.github.io/Herodoto-Map/

## Desarrollo

```bash
npm install
npm run dev
```

El despliegue en GitHub Pages lo hace `.github/workflows/pages.yml` al llegar cambios a la rama principal.

## Fuentes y licencias

| Contenido | Fuente | Licencia |
|---|---|---|
| Texto español (`public/book/es`) | *Los nueve libros de la Historia*, traducción de Bartolomé Pou, S. J. (1727-1802). Obtenido por OCR de una edición digital; puede contener erratas. | Dominio público |
| Texto inglés y lugares por capítulo (`public/book/en`, `public/book/places.json`) | Traducción de A. D. Godley (1920), modernizada y etiquetada por el [Perseus Digital Library](https://github.com/PerseusDL/canonical-greekLit) (Tufts University). Convertida a JSON por `scripts/build_book_en.py`. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Costas y ríos (`data/land.json`, `data/rivers.json`) | [Natural Earth](https://www.naturalearthdata.com/) | Dominio público |

Los archivos derivados de Perseus se redistribuyen bajo la misma licencia CC BY-SA 4.0.

La numeración de capítulos del texto español se alinea con la estándar mediante
`scripts/build_book_es.py`; donde el OCR no permitió separar dos capítulos, aparecen unidos (por ejemplo «101–103»).
