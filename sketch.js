// --- Configuración global ---

const MAPBOX_KEY = 'pk.eyJ1IjoiaHNwZW5jZXIiLCJhIjoiY2tjd2tkMmk1MDI1YjJzcWNxdW9yazlyNiJ9.eh5wNGCoVQjIpgJyveOObw';

const MAP_OPTIONS = {
  lat: -28.163576,
  lng: -63.878019,
  zoom: 2,
  style: 'mapbox://styles/mapbox/light-v9',
  bearing: 180 // sur arriba — perspectiva desde Chile
};

// Semantic MediaWiki: todas las páginas de Categoría:Travesía con Año, Posición y Destino
const WIKI_URL = 'https://wiki.ead.pucv.cl/api.php?action=ask&format=json' +
  '&query=%5B%5BCategor%C3%ADa%3ATraves%C3%ADa%5D%5D%20%7C%3F%20A%C3%B1o%20%7C%3F%20Posici%C3%B3n%20%7C%3F%20Destino%7Climit%3D9999' +
  '&utf8=1&formatversion=latest';

const YEAR_MIN   = 1984;
const YEAR_MAX   = 2026;
const COLOR_MAIN = '#ae2900';

const mappa = new Mappa('MapboxGL', MAPBOX_KEY);

let myMap, canvas;
let data;
let travesias  = [];
let yearSlider, allToggle;
let currentYear = YEAR_MIN;

// --- Carga de datos ---

function preload() {
  // jsonp necesario: la API de la wiki no envía cabeceras CORS
  data = loadJSON(WIKI_URL, () => {}, 'jsonp');
}

// --- Setup ---

function setup() {
  const w = select('#p5').width;
  const h = select('#p5').height;
  canvas = createCanvas(w, h).parent('p5');
  cursor(CROSS);
  textFont('Alegreya Sans');

  myMap = mappa.tileMap(MAP_OPTIONS);
  myMap.overlay(canvas);
  myMap.onChange(draw);

  buildTravesias();

  yearSlider = createSlider(YEAR_MIN, YEAR_MAX, YEAR_MIN, 1);
  yearSlider.id('yearSlider');

  allToggle = createCheckbox('Ver todas', false);
  allToggle.id('allToggle');
  allToggle.changed(onToggleAll);
}

function buildTravesias() {
  for (let key in data.query.results) {
    if (!key.startsWith('Travesía ')) continue; // filtra páginas relacionadas que no son travesías
    const t = data.query.results[key];
    if (!t.printouts['Posición'].length) continue;
    const { lat, lon } = t.printouts['Posición'][0];
    const year = t.printouts['Año'][0];
    travesias.push(new Travesia(key, lat, lon, year, t.fullurl));
  }
}

function onToggleAll() {
  if (this.checked()) {
    yearSlider.addClass('invisible');
  } else {
    yearSlider.removeClass('invisible');
  }
}

// --- Draw ---

function draw() {
  clear();
  currentYear = yearSlider.value();
  const showAll = allToggle.checked();

  for (const travesia of travesias) {
    const visible = showAll || travesia.year === currentYear;
    if (!visible) continue;

    travesia.show();
    travesia.rollover(mouseX, mouseY);

    // líneas entre travesías del mismo año (solo en vista filtrada)
    if (!showAll) {
      for (const other of travesias) {
        if (other !== travesia && other.year === currentYear) {
          stroke(COLOR_MAIN + '33');
          other.update();
          line(travesia.x, travesia.y, other.x, other.y);
        }
      }
    }

    if (travesia.over) {
      noStroke();
      fill(COLOR_MAIN);
      textSize(22);
      text(travesia.name, 10, 65);

      if (mouseIsPressed) {
        window.open(travesia.url, '_parent');
        noLoop();
      }
    }
  }

  if (!showAll) {
    noStroke();
    fill(0, 200);
    textSize(16);
    text('Año ' + currentYear, 15, 20);
  }
}

// --- Clase Travesia ---

class Travesia {
  constructor(name, lat, lon, year, url) {
    this.name = name;
    this.lat  = lat;
    this.lon  = lon;
    this.year = year;
    this.url  = url;
    this.x      = 0;
    this.y      = 0;
    this.radius = 3;
    this.over   = false;
  }

  update() {
    const pos = myMap.latLngToPixel(this.lat, this.lon);
    this.x = pos.x;
    this.y = pos.y;
  }

  rollover(px, py) {
    this.over = dist(px, py, this.x, this.y) < this.radius * 1.5;
  }

  show() {
    this.update();
    const showAll = allToggle.checked();
    this.radius = showAll ? 2 : 2.5;
    noStroke();
    fill(showAll ? COLOR_MAIN : color(0, 190));
    ellipse(this.x, this.y, this.radius * 2);

    if (this.over) {
      noFill();
      stroke(COLOR_MAIN);
      ellipse(this.x, this.y, this.radius * 10);
    }
  }
}
