var state = {
  crimes: [],
  latLng: {lat:55.9486,lng:-3.1999},
  month: "2015-12",
  url: "",
  map: ""
}

var getCrimes = function(){
  var request = new XMLHttpRequest();
  request.open("GET", state.url);
  request.setRequestHeader("X-Mashape-Key", "pG5UZT9xg6msh7gIsawwsJas5T6Ep1dKfgCjsnOGr51xw13ZGJ")
  request.setRequestHeader("Accept", "application/json")
  request.send();

  request.onload = function () {
    if (request.status === 200) {
      var jsonString = request.responseText;
      state.crimes = JSON.parse(jsonString);
      main();
    }    
  }
}

window.onload = function(){
  state.url= "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"]
  getCrimes(state.url);
}


function main(){
  console.log(state.crimes)
  state.map = new Map(state.latLng, 16);
  mapCrimes();
}

function mapCrimes(){
  state.crimes.forEach(function(crime){
    var location = {lat: Number(crime.location.latitude), lng: Number(crime.location.longitude)}
    var content = "crime here"
    state.map.addInfoWindow(location, content)
  })

}

// creates map
var Map = function(latLng, zoom){
  this.googleMap = new google.maps.Map(document.getElementById('map'), {
    center: latLng,
    zoom: zoom
  });
  this.addMarker = function(latLng){
    var marker = new google.maps.Marker({
      position:  latLng,
      map: this.googleMap,
    })
    return marker;   
  }; 
  // creates marker and info window
  this.addInfoWindow = function(latLng, content){
    var marker = this.addMarker(latLng);
    marker.addListener('click', function(event){
      var infoWindow = new google.maps.InfoWindow({
        content: content
      })
      infoWindow.open( this.map, marker ) 
    })
}


}
