var state = {
  crimes: [],
  latLng: {lat:51.499505,lng:-0.159673},
  month: "2015-01",
  markers: [],
  infoWindow: new google.maps.InfoWindow({
        content: ""
      }),
  url: "",
  map: "",
  ran: false,
  count: 1
 };


// ONLOAD==========================================================================
window.onload = function(){
  state.url= "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"];
    main();
}

function main(){
  state.map = new Map(state.latLng, 14);
  getCrimes(state.url);
  state.ran = true;
  state.map.bindclick(); 
  var banner = document.getElementById("banner");
  var selector = document.getElementById("selector");
  selector.addEventListener('change', function(event){
    state.month =this.value
    state.url= "https://stolenbikes88-datapoliceuk.p.mashape.com/crimes-street/all-crime?date="+state.month+"&lat="+state.latLng["lat"]+"&lng="+state.latLng["lng"];
    getCrimes()
    })
}

function police(){
  window.setInterval(function(){
    state.count ++
    if(state.count % 2 === 0 ){
      banner.style.boxShadow = "5px -5px 20px red";
    }else{
      banner.style.boxShadow = "5px -5px 20px blue";
    }
  }, 500)
}

// gets all crimes for area
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
      mapCrimes();
    }    
  }
}


// places found crimes on to map
function mapCrimes(){  
  var magnifier = document.getElementById("magnifier").style.display = 'block';
  state.crimes.forEach(function(crime){
    var location = {lat: Number(crime.location.latitude), lng: Number(crime.location.longitude)}
    var outcome = crime.outcome_status|| "Not Known"
    if (outcome != "Not Known"){outcome = outcome.category} 
    var content = "Category: " + crime.category + "<br> Location: " + crime.location.street.name + "<br> Outcome: " + outcome
    state.map.addInfoWindow(location, content)
  })
  geoFind();
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = b[key]; var y = a[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

function geoFind(){
      var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+state.latLng.lat+"," +state.latLng.lng+ "&sensor=false"
      var request = new XMLHttpRequest();
      request.open("GET", url);
      request.onload = function () {
          if (request.status === 200) {
              var jsonString = request.responseText;
              address = JSON.parse(jsonString);
              createData(address.results[0].formatted_address)
          }
      }
      request.send();
  }
function createData(address){
    var crimeTypes = [{name:"anti-social-behaviour", y: 0},
    {name:"bicycle-theft",y: 0},
    {name:"burglary",y: 0},
    {name:"criminal-damage-arson",y: 0},
    {name:"drugs",y: 0},
    {name:"other-theft",y: 0},
    {name:"possession-of-weapons",y: 0},
    {name:"public-order",y: 0},
    {name:"robbery",y: 0},
    {name:"shoplifting",y: 0},
    {name:"theft-from-the-person",y: 0},
    {name:"vehicle-crime",y: 0},
    {name:"violent-crime",y: 0},
    {name:"other-crime",y: 0}]

  state.crimes.forEach(function(crime){
    crimeTypes.forEach(function(type){
      if(type.name === crime.category){type.y ++}
    })  
  })
  var text = document.getElementById("text");
  text.innerHTML = "";
  var crimeInfo = document.createElement('h3')
  var selectMonth = document.getElementById('selector').options[document.getElementById('selector').selectedIndex].text
  crimeInfo.innerHTML = "In " + selectMonth + " there were:<br>" + state.crimes.length + " crimes within 1 mile of:<br>" + address
  text.appendChild(crimeInfo)
  sortByKey(crimeTypes, 'y')

  crimeTypes.forEach(function(type){
    var p = document.createElement('p');
    var textBox = document.createElement('div');
    textBox.className ="textBox" ;
    p.innerHTML = type.y + " " + type.name;
    textBox.appendChild(p);
    text.appendChild(textBox);
  })
  var common = document.createElement('h4');
  var mostCommon = document.getElementById('mostCommon');
  mostCommon.innerHTML="";
  common.innerHTML = "Most Common Crime:<br> " + crimeTypes[0].name;
  mostCommon.appendChild(common);
  new PieChart(crimeTypes);
}


// creates map
var Map = function(latLng, zoom, element){
  this.googleMap = new google.maps.Map(document.getElementById('map'), {
    center: latLng,
    zoom: zoom,
    zoomControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_CENTER
        }
  });

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
      console.log(event)
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
