var state = {
  crimes: [],
  latLng: {lat:51.4700,lng:-0.4543},
  month: "2015-01",
  markers: [],
  infoWindow: new google.maps.InfoWindow({
    content: ""
  }),
  url: "",
  map: "",
  ran: false,
  count: 1,
  colours: {
    "anti-social-behaviour": "#ffe0b3",
    "bicycle-theft": "#ffebcc",
    "burglary":"#ffd699",
    "criminal-damage-arson":"#ffcc80",
    "drugs":"#ffc266",
    "other-theft":"#ffb84d",
    "possession-of-weapons": "#ffad33",
    "public-order":"#ffa31a",
    "robbery":"#ff9900",
    "shoplifting":"#e68a00",
    "theft-from-the-person":"#cc7a00",
    "vehicle-crime":"#ffcc00",
    "violent-crime":"#ffdb4d",
    "other-crime": "#ffe680"
  }
};

// ONLOAD==========================================================================
window.onload = function(){
  state.url= "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"];
  main();
}

function main(){
  state.map = new Map(state.latLng, 14);
  getCrimes(state.url);
  var goForm = document.getElementById("latLngSelect")
  goForm.onsubmit = function(event){
    event.preventDefault();
    goButton(event);
  }
  state.map.bindclick(); 
  var help = document.getElementById("help");
  help.addEventListener("click",function(){
    console.log("clicked")
    helpToggle()
  })  
  var selector = document.getElementById("selector");
  selector.addEventListener('change', function(event){
    state.month =this.value
    state.url= "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"];
    getCrimes();
  })
}

// goes to given latitude and longitude
function goButton(event){
  lat = event.target[0].value;
  lng = event.target[1].value;
  lat = Number(lat);
  lng= Number(lng);
  if(lat < 50||lat> 60 || lng < -3||lng > 6){
    invalid()
  }else{
    state.latLng.lat = lat;
    state.latLng.lng = lng;
    for(marker of state.markers){
      marker.setMap(null);
    }
    state.map.googleMap.panTo(state.latLng);
    state.url = "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"]
    getCrimes();
  }
}

// displays error box for 1 sec
function invalid(){
  var err = document.getElementById('error');
  err.style.display = "inline";
  setTimeout(function(){
    err.style.display = "none"
  },1000)
}

// turns on blues and twos
function police(){
  var banner = document.getElementById("mostCommon");
  window.setInterval(function(){
    if (state.count > 5){clearInterval(refreshID)}
      state.count ++
    if(state.count % 2 === 0 ){
      banner.style.boxShadow = "0px -5px 20px red";
      banner.style.backgroundColor = "red";
    }else{
      banner.style.boxShadow = "0px -5px 20px blue";
      banner.style.backgroundColor = "blue";
    }
  }, 500)
  play();
}

function play(){
 var audio = document.getElementById("audio");
 audio.play();
}

// gets all crimes for area
var getCrimes = function(){
  var request = new XMLHttpRequest();
  request.open("GET", state.url);
  request.setRequestHeader("X-Mashape-Key", "pG5UZT9xg6msh7gIsawwsJas5T6Ep1dKfgCjsnOGr51xw13ZGJ");
  request.setRequestHeader("Accept", "application/json");
  request.send();

  request.onload = function () {
    if (request.status === 200) {
      var jsonString = request.responseText;
      state.crimes = JSON.parse(jsonString);
      if (state.ran){
        mapCrimes();
      }
      var magnifier = document.getElementById("magnifier").style.display = 'block';
      
      state.ran = true;
    }    
  }
}

// places found crimes on to map
function mapCrimes(type){  

  state.crimes.forEach(function(crime){
    if(type && crime.category != type){return;}
    var location = {lat: Number(crime.location.latitude), lng: Number(crime.location.longitude)}
    var outcome = crime.outcome_status|| "Not Known";
    if (outcome != "Not Known"){outcome = outcome.category} 
      var content = "Category: " + crime.category + "<br> Location: " + crime.location.street.name + "<br> Outcome: " + outcome;
    state.map.addInfoWindow(location, content);

  })
  geoFind();
}

// shows just crimes by one category
function filterCrimes(event){
  var crimeCategory = event.target.innerText;
  crimeCategory = crimeCategory.replace(/^[\s\d]+/, '');
  for(marker of state.markers){
    marker.setMap(null);
  }
  mapCrimes(crimeCategory);
}

// sorts crimes from largest to smallest 
function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = b[key]; var y = a[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

// returns street address
function geoFind(){
  var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+state.latLng.lat+"," +state.latLng.lng+ "&sensor=false"
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = function () {
    if (request.status === 200) {
      var jsonString = request.responseText;
      address = JSON.parse(jsonString);
      createData(address.results[0].formatted_address);
    }
  }
  request.send();
}

// toggles help window
function helpToggle(){
  var helper = document.getElementById("helpBox")
  console.log("change")
  if (helper.style.display === 'block'){
    helper.style.display = 'none';
  }else{
    helper.style.display = 'block';
  }
}

// tallies crimes by category for current selection and returns data
function crimeCounter(){
  var crimeTypes= [{name:"anti-social-behaviour", y: 0, color:"#ffe0b3"},
  {name:"bicycle-theft",y: 0, color: "#ffebcc"},
  {name:"burglary",y: 0, color: "#ffd699"},
  {name:"criminal-damage-arson",y: 0, color:"#ffcc80"},
  {name:"drugs",y: 0, color: "#ffc266"},
  {name:"other-theft",y: 0, color:"#ffb84d"},
  {name:"possession-of-weapons",y: 0, color: "#ffad33"},
  {name:"public-order",y: 0, color: "#ffa31a"},
  {name:"robbery",y: 0, color: "#ff9900"},
  {name:"shoplifting",y: 0, color: "#e68a00"},
  {name:"theft-from-the-person",y: 0, color: "#cc7a00"},
  {name:"vehicle-crime",y: 0, color: "#ffcc00"},
  {name:"violent-crime",y: 0, color: "#ffdb4d"},
  {name:"other-crime",y: 0, color: "#ffe680"}]

  state.crimes.forEach(function(crime){
    crimeTypes.forEach(function(type){
      if(type.name === crime.category){type.y ++}
    })  
  })
  sortByKey(crimeTypes, 'y');
  return crimeTypes
}

// makes all page text other than HTML created, this is waaaay too long
function createData(address){
  var crimeTypes = crimeCounter();
  makeHeader(address);
  makeBoxes(crimeTypes);
  mostCommon(crimeTypes);
  new PieChart(crimeTypes);
}

// creates mostcommon data and attaches listener
function mostCommon(crimeTypes){
  var common = document.createElement('h4');
  var mostCommon = document.getElementById('mostCommon');
  mostCommon.innerHTML="";
  mostCommon.addEventListener("click", function(){
    police();
  })
  common.innerHTML = "Most Common Crime:<br> " + crimeTypes[0].name;
  mostCommon.appendChild(common);
}

// makes crime types boxes and attaches listeners
function makeBoxes(crimeTypes){
  crimeTypes.forEach(function(type){
    var p = document.createElement('p');
    var textBox = document.createElement('div');
    textBox.className ="textBox" ;
    textBox.style.backgroundColor = state.colours[type.name]
    textBox.addEventListener('click',function(event){
      filterCrimes(event);
    })
    p.innerHTML = type.y + " " + type.name;
    textBox.appendChild(p);
    text.appendChild(textBox);
  })
  var p = document.createElement('p');
  var textBox = document.createElement('div');
  textBox.className ="textBox" ;
  textBox.style.backgroundColor = "white"
  textBox.addEventListener('click',function(event){
    mapCrimes();
  })
  p.innerHTML = "SHOW ALL CRIMES";
  textBox.appendChild(p);
  text.appendChild(textBox);
}

// makes text box header text
function makeHeader(address){
  var text = document.getElementById("text");
  text.innerHTML = "";
  var crimeInfo = document.createElement('h3');
  var selectMonth = document.getElementById('selector').options[document.getElementById('selector').selectedIndex].text;
  crimeInfo.innerHTML = "In " + selectMonth + " there were:<br>" + state.crimes.length + " crimes within 1 mile of:<br>" + address;
  text.appendChild(crimeInfo);
}

// Map constructor here down===================================================================
var Map = function(latLng, zoom, element){
  this.googleMap = new google.maps.Map(document.getElementById('map'), {
    center: latLng,
    zoom: zoom,
    zoomControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_CENTER
    }
  });

  // returns marker and adds to map
  this.addMarker = function(latLng){
    var marker = new google.maps.Marker({
      position:  latLng,
      map: this.googleMap
    })
    return marker;   
  }; 

  // creates marker and info window
  this.addInfoWindow = function(latLng, content){
    var marker = this.addMarker(latLng);
    state.markers.push(marker)
    marker.addListener('click', function(event){
      state.infoWindow.close()
      var infoWindow = new google.maps.InfoWindow({
        content: content
      })
      state.infoWindow = infoWindow
      infoWindow.open( this.map, marker ) 
    })
  };
  // looks for clicks on map and recenters maps and initiates search for crimes.
  this.bindclick = function(){
    google.maps.event.addListener( this.googleMap, 'click', function(event){
      for(marker of state.markers){
        marker.setMap(null);
      }
      state.latLng = {lat:event.latLng.lat(), lng: event.latLng.lng()}
      state.map.googleMap.panTo(state.latLng);
      state.url = "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"]
      getCrimes();
    }.bind(this))
  };
}
