var PERSON, CEMENTARY;

(function() {
    function Person(data) {
        this.id = data.id;
        this.name = data.name;
        this.surname = data.surname;
        this.title = data.title;
        this.full_name_with_title = data.full_name_with_title;
        this.date_of_birth = data.date_of_birth;
        this.date_of_death = data.date_of_death;
        this.cementary_id = data.cementary_id;
        this.gps_lon = data.gps_lon;
        this.gps_lat = data.gps_lat;
    }    

    Person.prototype.add_to_map = function() {
        this.marker = L.marker(this.coords);
        var popup_content = [
            "<p id='popup-fullname'>",
                this.full_name_with_title,
            "</p>",
            "<p id='popup-dates'><span>", this.date_of_birth, "</span> - <span>", this.date_of_death, "</span></p>",
            "<p><a href=\"https://www.google.com/maps/?q=" + this.gps_lon + "," + this.gps_lat + "\"/>Nawiguj ( na stronie Google Maps )</a></p>"
        ].join("");

        this.popup = L.popup().setLatLng(this.coords).setContent(popup_content);
        this.marker.bindPopup(this.popup);
        this.marker.addTo(mymap);
    }

    Person.prototype.load_description = function() {
        $.post('/api/person/' + this.id, function(data) {
            if ( data === "" ) {
                this.description = data;
            }
        }.bind(this));
    }

    Person.prototype.show_description = function() {
        if ( this.description === undefined ) {
            this.load_description();
            var cementary; 
            document.getElementById('fullName').innerText = this.full_name_with_title;
            document.getElementById('cementaryName').innerText = CEMENTARY[this.cementary_id]['full_name'];
            document.getElementById('dateOfBirth').innerText = this.date_of_birth;
            document.getElementById('dateOfDeath').innerText = this.date_of_death;
            document.getElementById('city').innerText = CEMENTARY[this.cementary_id]['city']
            document.getElementById('personDescription').innerHTML = this.description;
            rightSidebar.show();
        }
    }
})();

function init_map() {
    mymap = L.map("map");
    var access_token = "pk.eyJ1IjoibWVyZyIsImEiOiJjajFxbGwzNnEwMGRzMndyaWN2cDl6eDB0In0.MSQQPZbp-UNthPFIWDMX4Q";
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: access_token
    }).addTo(mymap);
    
    rightSidebar = L.control.sidebar('RightSidebar', {
        closeButton: false,
        position: "right"
    });
    
    mymap.setView([52.43916748843736, 16.891230130755872], 18);

    mymap.addControl(rightSidebar);
    rightSidebar.hide();
}

function init_toggle_buttons() {
    document.querySelectorAll('.button__toggle').forEach(function(el) {
        var target = el.getAttribute('data-target');
        el.addEventListener(function(ev) {
            document.getElementById(target).classList.toggle('active');
        })
    })
}

window.onload = function () {
    init_map();
    init_toggle_buttons();
}