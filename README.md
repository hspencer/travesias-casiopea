## Travesias de Casiopea

Visualización de las travesías de Amereida realizadas desde 1984 por la Escuela de Arquitectura y Diseño de la Pontificia Universidad Católica de Valparaíso. 

Las travesías se presentan ordenadas por año y desplegadas en el mapa. La cartografía utilizada es de [MapBox](https://www.mapbox.com/maps).

### Consulta vía API

Los datos de las travesías son [consultados al archivo de la Wiki Casiopea](https://wiki.ead.pucv.cl/api.php?action=ask&format=json&query=%5B%5BCategor%C3%ADa%3ATraves%C3%ADa%5D%5D%20%7C%3F%20A%C3%B1o%20%7C%3F%20Posici%C3%B3n%20%7C%3F%20Destino%7Climit%3D9999&utf8=1&formatversion=latest) mediante su API.  

```
{{#ask: [[Categoría:Travesía]]
|? Año
|? Posición
|? Destino
|limit = 9999
}}

```

Estos datos pueden cambiar y están sujetos a actualización en el tiempo.