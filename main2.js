//Klasse Standort
class Standort {

	//Konstruktor der Klasse
	constructor(id, la, lo, name, unit_type, adress, street, street_addition, place, country_code, country, next_location) {

    this.id = id;
		this.la = la;
		this.lo = lo;
		this.name = name;
		this.unit_type = unit_type;
		this.adress = adress;
		this.street = street;
		this.street_addition = street_addition;
		this.place = place;
		this.country_code = country_code;
		this.country = country;
    this.next_location = next_location;
	}
}

//Globale Variablen

var id;
var la;
var lo;
var name;
var unit_type;
var street;
var street_addition;
var zip_code;
var place;
var country_code;
var country;
var adress;
var next_location;


//Feld, in dem alle Standorte gespeichert werden (inkl. aller Attribute)
var auto_standort = [];
var contentString = [];
var ids = []; //Alle IDs, um zu vergleichen, ob IDs existieren

var json_length;

//Feld, in dem alle Marker gespeichert werden
var markers = [];

  var abfrage;

  var abfrage = new XMLHttpRequest();
  abfrage.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var myObj = JSON.parse(abfrage.responseText);
  
      console.log(myObj.results[0].data.coordinates);
      console.log(abfrage);


      //Länge des Datensatzes (die Anzahl der Standorte)
      json_length = Object.keys(myObj.results).length;
  
      //json_length = Object.keys(myObj.results[0].data).length;
      json_length = Object.keys(myObj.results).length;

  
      //hier werden die Daten aus der JSON-Datei in Variablen gespeichert
      for (var i = 0; i < json_length; ++i){
  
        if (myObj.results[i].type === "supply_chain_unit") {
          id = myObj.results[i].data.id;
          la = myObj.results[i].data.coordinates.latitude;
          lo = myObj.results[i].data.coordinates.longitude;
          name = myObj.results[i].data.name;
          unit_type = myObj.results[i].data.unit_type;
          street = myObj.results[i].data.street;
          street_addition = myObj.results[i].data.street_addition;
          zip_code = myObj.results[i].data.zip_code;
          place = myObj.results[i].data.place;
          country_code = myObj.results[i].data.country_code;
          country = myObj.results[i].data.country;
          adress = myObj.results[i].data.country + ", " + myObj.results[i].data.place;
          next_location = myObj.results[i].data.next_location;
          
        //für jeden Standort wird ein Objekt erzeugt
          let t = new Standort(id, la,lo,name,unit_type,adress, street, street_addition,place,country_code, country, next_location);
  
        auto_standort.push(t);
        console.log(myObj.results[i].type);
        }
      }
    }
  }
        console.log(auto_standort);
  
  
  
  abfrage.open("GET", "response2.json", false);
  abfrage.send();
  
  //Google Map wird initialisiert
  function initMap() {
  
      //hier wird definiert, wie stark in die Karte reingezoomt wird und wo sich das Zentrum befinden soll, wenn man die Seite aufruft
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: {lat: 30.363, lng: 50.234},
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180
          }
        },
      });
      map.setOptions({ minZoom: 2.5});

      //hier wird die Verbindungslinie zwischen den Standorten erstellt      
      //hier fügen wir die Koordinaten der einzelnen Standorte in die Linie ein
      //die Standorte werden automatisch der Reihenfolge nach aus der .json-Datei/Datenbank abgerufen
      //Version 2 mit verschiedenen Linie

      for (var i = 0; i < auto_standort.length; i++) {
        if (auto_standort[i].unit_type === "Material Lieferant" || auto_standort[i].unit_type === "Produktionsstätte") {
            next = auto_standort[i].next_location;
            var j = 0;
            while(auto_standort[j].id != next) {
              j++;
            }
            const line = new google.maps.Polyline({
              path: [
                {lat: auto_standort[i].la, lng: auto_standort[i].lo},
                {lat: auto_standort[j].la, lng: auto_standort[j].lo},
              ],
               map: map,
               geodesic: true,
            });
        }
      }
  
      //Marker anlegen anhand ihres Typus
      const infowindow = new google.maps.InfoWindow({
      });
  
        for (var i = 0; i < auto_standort.length; i++) {
          const a = i;
          if (auto_standort[i].unit_type === "Material Lieferant") {
             newMarker = new google.maps.Marker({
              position: {lat: auto_standort[i].la, lng: auto_standort[i].lo},
             map: map,
             icon: new google.maps.MarkerImage('bilder/fabrik2.png', null, null, null, new google.maps.Size(30,30)),
             animation: google.maps.Animation.DROP,
             title: auto_standort[i].name
             });
          }
         else if (auto_standort[i].unit_type === "Produktionsstätte") {
            newMarker = new google.maps.Marker({
              position: {lat: auto_standort[i].la, lng: auto_standort[i].lo},
            map: map,
            icon: new google.maps.MarkerImage('bilder/nahmaschine2.png', null, null, null, new google.maps.Size(30,30)),
            animation: google.maps.Animation.DROP,
            title: auto_standort[i].name
            });
          } else {
            newMarker = new google.maps.Marker({
              position: {lat: auto_standort[i].la, lng: auto_standort[i].lo},
            map: map,
            //icon: new google.maps.MarkerImage('bilder/marker_blue.png', null, null, null, new google.maps.Size(30,30)),
            animation: google.maps.Animation.DROP,
            title: auto_standort[i].name
            });
          }
  
          //hier wird einerseits die Funktionalität implementiert, dass unser Infowindow erscheint und zwar jedes mal ein spezifisches für jeden Standort
          newMarker.addListener("click", () => {
  
            document.querySelector('#firstHeading').textContent = auto_standort[a].name;
            document.querySelector('#typ').textContent = auto_standort[a].unit_type;
            document.querySelector('#adresse').textContent = auto_standort[a].adress;
  
            //Wenn auf den Standort geklickt wird, öffnet sich das infoWindow, zoomt zum spezifischen Standort; lässt den Hintergrund ausblurren 
            $('.info').addClass("show");
            $('.info').removeClass("hide");
            $('.info').addClass("showInfo");
            map.setCenter({lat: auto_standort[a].la, lng: auto_standort[a].lo});
            map.setZoom(8);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            $('.container').addClass("active");
          });
  
          //alle Marker werden in markers gespeichert
          markers.push(newMarker);
        }
  
        console.log(auto_standort);
  
  
        // Hier wird der Filter für die Produzenten gesetzt
        var checkbox_produzenten = document.getElementById('checkbox-1');
  
        checkbox_produzenten.addEventListener('change', function() {
          var i;
  
          if(this.checked) {
            for (i = 0; i < auto_standort.length; i++) {
              if(auto_standort[i].unit_type === "Produktionsstätte") {
                markers[i].setVisible(true);
              }
            }
          } else {
            for (i = 0; i < auto_standort.length; i++) {
              if(auto_standort[i].unit_type === "Produktionsstätte") {
                markers[i].setVisible(false);
              }
            }
          }
        });
  
        // Hier wird der Filter für die Lieferanten gesetzt
        var checkbox_lieferanten = document.getElementById('checkbox-2');
  
        checkbox_lieferanten.addEventListener('change', function() {
          var i;
  
          if(this.checked) {
            for (i = 0; i < auto_standort.length; i++) {
              if(auto_standort[i].unit_type === "Material Lieferant") {
                markers[i].setVisible(true);
              }
            }
          } else {
              for (i = 0; i < auto_standort.length; i++) {
                if(auto_standort[i].unit_type === "Material Lieferant") {
                  markers[i].setVisible(false);
                }
              }
          }
        });
        
      // Hier wird die Funktionalität der Suchleiste implementiert
      var button = document.getElementById('button');
      button.addEventListener("click", function() {
        var i;
        var input = document.getElementById('searchbar').value.toLowerCase();
        var eingabe = false;
  
        for(i = 0; i < markers.length; i++) {
          //erstmal alle Marker unsichtbar machen, sodass danach nur die gesuchten auf sichtbar gesetzt werden müssen
          markers[i].setVisible(false);
          if(auto_standort[i].name.toLowerCase() == input || auto_standort[i].country.toLowerCase() == input || auto_standort[i].place.toLowerCase() == input) {
            markers[i].setVisible(true);
            eingabe = true;
          }
        }
  
        //falls die Eingabe nicht übereinstimmt / es keine Eingabe gibt, werden alle Standorte angezeigt
        if (!eingabe && input != "") {
          for(i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
          }
  
          document.querySelector('.msg').innerHTML = "Kein Ergebnis!";
  
          window.scrollTo({ top: 0, behavior: 'smooth' });
          $('.alert').addClass("show");
          $('.alert').removeClass("hide");
          $('.alert').addClass("showAlert");
          setTimeout(function () {
            $('.alert').removeClass("show");
            $('.alert').addClass("hide");
          setTimeout(() => {  $('.alert').removeClass("showAlert"); }, 1100);
          }, 3000); 
          //wenn die Eingabe leer ist, werden alle Standorte angezeigt
        } else if (input === "") {
          for(i = 0; i < markers.length; i++) {
            markers[i].setVisible(true);
          }
  
          $('.alert').removeClass("show");
            $('.alert').addClass("hide");
            setTimeout(() => {  $('.alert').removeClass("showAlert"); }, 1100);
        } else if (eingabe) {
            $('.alert').removeClass("show");
            $('.alert').addClass("hide");
            setTimeout(() => {  $('.alert').removeClass("showAlert"); }, 1100);
            map.setZoom(4);
        }
  
        
      });
  
      //Damit wird das InfoWindow geschlossen
    $('.close-info').click(function () {
      $('.info').removeClass("show");
      $('.info').addClass("hide");
      setTimeout(() => {  $('.info').removeClass("showInfo"); }, 1100);
      document.getElementById('map').scrollIntoView({
      behavior: 'smooth'
      });
      $('.container').removeClass("active");
    })
    
  } //Ende der initMap Funktion
  
  //close Alert function
  $('.close-btn').click(function () {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
    setTimeout(() => {  $('.alert').removeClass("showAlert"); }, 1100);
  });