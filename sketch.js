/*

mapbox://styles/hspencer/ckcskikwl1x481hqp79vs7wnv

pk.eyJ1IjoiaHNwZW5jZXIiLCJhIjoiY2tjd2tkMmk1MDI1YjJzcWNxdW9yazlyNiJ9.eh5wNGCoVQjIpgJyveOObw

*/

// API Key for MapboxGL. Get one here:
// https://www.mapbox.com/studio/account/tokens/
const key = 'pk.eyJ1IjoiaHNwZW5jZXIiLCJhIjoiY2tjd2tkMmk1MDI1YjJzcWNxdW9yazlyNiJ9.eh5wNGCoVQjIpgJyveOObw';

// Options for map
const options = {
  lat: -28.163576,
  lng: -63.878019,
  zoom: 2,
  style: 'mapbox://styles/mapbox/light-v9',
  /*
  style: 'mapbox://styles/hspencer/ckcskikwl1x481hqp79vs7wnv?access_token=pk.eyJ1IjoiaHNwZW5jZXIiLCJhIjoiY2tjd2tkMmk1MDI1YjJzcWNxdW9yazlyNiJ9.eh5wNGCoVQjIpgJyveOObw',
  */
  bearing: 180
};

// Create an instance of MapboxGL
const mappa = new Mappa('MapboxGL', key);
let myMap;
let data, sketch, w, h, travesias;
let yearSlider, allToggle;

function preload() {
  w = select('#p5').width;
  h = select('#p5').height;
  travesias = [];
  let url = "https://wiki.ead.pucv.cl/api.php?action=ask&format=json&maxlag=20000&smaxage=0&servedby=1&uselang=user&query=%5B%5BCategor%C3%ADa%3ATraves%C3%ADa%5D%5D%7C%3FA%C3%B1o%7C%3FPosici%C3%B3n%7C%3FDestino%7C%3FProfesores%7C%3FAlumnos%7Climit%3D9999";
  data = loadJSON(url, gotData, 'jsonp');
}



function gotData(response) {
  print("got data from Casiopea");
}

function createObjects() {
  for (let key in data.query.results) {
    if (key.startsWith("Travesía ")) {
      let t = data.query.results[key];
      if (t.printouts['Posición']) {
        let lat = t.printouts['Posición'][0].lat;
        let lon = t.printouts['Posición'][0].lon;
        let y = t.printouts['Año'][0];
        let url = t.fullurl;
        let travesia = new Travesia(key, lat, lon, y, url);
        travesias.push(travesia);
      }
    }
  }
}

let currentYear = 1984;

function setup() {
  sketch = createCanvas(w, h).parent('p5');
  cursor(CROSS);

  myMap = mappa.tileMap(options);
  myMap.overlay(sketch);
  myMap.onChange(draw);

  createObjects();

  yearSlider = createSlider(1984, 2024, 1984, 1);
  yearSlider.id('yearSlider');

  allToggle = createCheckbox('Ver todas', false);
  allToggle.id('allToggle');
  allToggle.changed(toggleAll);
  textFont('Alegreya Sans');
}

function toggleAll() {
  if (this.checked()) {
    yearSlider.addClass('invisible');
  } else {
    yearSlider.removeClass('invisible');
  }
}

function draw() {
  clear();
  currentYear = yearSlider.value();
  for (let travesia of travesias) {
    if (travesia.year === currentYear && !allToggle.checked()) {
      travesia.show();
      travesia.rollover(mouseX, mouseY);
      if (mouseIsPressed && travesia.over) {
        window.open(travesia.url, "_parent");
        noLoop();
      }
      for (let other of travesias) {
        if (travesia != other && other.year === currentYear) {
          stroke('#ae290022');
          other.update();
          line(travesia.x, travesia.y, other.x, other.y);
        }
      }
    } else if (allToggle.checked()) {
      // draw lines connecting all travesias... better not
      /*
      for (let other of travesias) {
        if (travesias != other) {
          other.update();
          stroke(0, 3);
          line(travesia.x, travesia.y, other.x, other.y);
        }
      }
      */
      travesia.show();
      travesia.rollover(mouseX, mouseY);
    }
    if (travesia.over) {
      fill('#ae2900');
      noStroke();
      textSize(22);
      text(travesia.name, 10, 65);
    }
  }
  if (!allToggle.checked()) {
    textSize(16);
    fill(0, 200);
    noStroke();
    text("Año " + currentYear, 15, 20);
  }
}

class Travesia {
  constructor(name, lat, lon, year, url) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.year = year;
    this.over = false;
    this.radius = 3;
    this.url = url;
    this.pos = myMap.latLngToPixel(this.lat, this.lon);
    this.x = 0;
    this.y = 0;
  }

  rollover(px, py) {
    let d = dist(px, py, this.x, this.y);
    this.over = d < this.radius;
  }

  update() {
    this.pos = myMap.latLngToPixel(this.lat, this.lon);
    this.x = this.pos.x;
    this.y = this.pos.y;
  }

  show() {
    this.update();
    noStroke();
    if (allToggle.checked()) {
      this.radius = 2;
      fill('#ae2900');
    } else {
      this.radius = 2.5;
      fill(0, 190);
    }
    ellipse(this.x, this.y, this.radius * 2);

    if (this.over) {
      noFill();
      stroke('#ae2900');
      ellipse(this.x, this.y, this.radius * 10);
    }
  }
}

function mousePressed(){
  //let pos = myMap.pixelToLatlng(mouseX, mouseY);
  console.log(myMap);
}