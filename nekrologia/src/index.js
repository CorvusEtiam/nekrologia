var GRAVES = {};
var CEMENTARY = {};
var mymap, leftSidebar, rightSidebar;
(function () {
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

    Person.prototype.get_coords = function () {
        return [this.gps_lat, this.gps_lon];
    }

    Person.prototype.add_to_map = function () {
        this.marker = L.marker(this.get_coords());
        var popup_content = [
            "<p id='popup-fullname'>",
            this.full_name_with_title,
            "</p>",
            "<p id='popup-dates'><span>", this.date_of_birth, "</span> - <span>", this.date_of_death, "</span></p>",
            "<p><a href=\"https://www.google.com/maps/?q=" + this.gps_lon + "," + this.gps_lat + "\"/>Nawiguj ( na stronie Google Maps )</a></p>"
        ].join("");
        this.popup = L.popup().setContent(popup_content);
        this.marker.bindPopup(this.popup);
        this.marker.addTo(mymap);

    }

    Person.prototype.show_description = function () {
        if ( rightSidebar.isVisible() ) {
            rightSidebar.hide();
        }
        var id = this.id;
        if (GRAVES[id].description !== undefined) {
            $('#personDescription').html(this.description);
        } else {
            $.get('/api/grave/' + this.id, function (data) {
                window.GRAVES[id].description = data;
                $('#personDescription').html(data);
            })
        }
        $('#fullName').html(this.full_name_with_title);
        $('#cementaryName').html(CEMENTARY[this.cementary_id].full_name);
        $('#dateOfBirth').html(this.date_of_birth);
        $('#dateOfDeath').html(this.date_of_death);
        $('#city').html(CEMENTARY[this.cementary_id]['city']);
        rightSidebar.show();
    }

    Person.prototype.load_description = function () {
        $.get('/api/grave/' + this.id, function (data) {

            document.getElementById('fullName').innerText = this.full_name_with_title;
            document.getElementById('cementaryName').innerText = CEMENTARY[this.cementary_id].full_name;
            document.getElementById('dateOfBirth').innerText = this.date_of_birth;
            document.getElementById('dateOfDeath').innerText = this.date_of_death;
            document.getElementById('city').innerText = CEMENTARY[this.cementary_id]['city']
            document.getElementById('personDescription').innerHTML = data;
            rightSidebar.show();
        }.bind(this));
    }

    Person.prototype.show_description = function () {
        this.load_description();
    }

    this.Person = Person;
})();

function current_mode() {
    var mobile_land = window.matchMedia("(max-height:450px) and (orientation: landscape)").matches;
    var mobile_port = window.matchMedia("(max-width:450px) and (orientation: portrait)").matches;
    var tablet = window.matchMedia('screen and (min-width:450px) and (max-width:768px').matches;
    if (mobile_land || mobile_port) { 
        return "mobile"; 
    } else if (tablet) { 
        return "tablet" 
    } else { 
        return "desktop"; 
    }
}

function init_map() {
    mymap = L.map("map");
    var access_token = "pk.eyJ1IjoibWVyZyIsImEiOiJjajFxbGwzNnEwMGRzMndyaWN2cDl6eDB0In0.MSQQPZbp-UNthPFIWDMX4Q";
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: access_token
    }).addTo(mymap);

    rightSidebar = L.control.sidebar('rightSidebar', {
        closeButton: false,
        position: "right"
    });

    mymap.setView([52.43916748843736, 16.891230130755872], 18);

    mymap.addControl(rightSidebar);
    rightSidebar.hide();

}

function get_data() {
    $.getJSON('/api/list/grave', function (data) {
        for (let id in data) {
            GRAVES[id] = new Person(data[id]);
            GRAVES[id].add_to_map();
        }
    });

    $.getJSON('/api/list/cementary', function (data) {
        for (let id in data) {
            CEMENTARY[id] = data[id];
        }
    })
}

function init_sidebar() {
    $('.person__item').each(function(index, person) {
        $(".person__button[data-target='map']", person).on('click', function(ev) {
            $('#leftSidebar').hide();
            var person_id = $(person).data('person-id');
            mymap.setView(GRAVES[person_id].get_coords());
        });
        $(".person__button[data-target='descr']", person).on('click', function(ev) {
            $('#leftSidebar').hide();
            var person_id = $(person).data('person-id');
            GRAVES[person_id].show_description();            
        });
        
        $(person).on('click', function(ev) {
            if ( current_mode() === "desktop" ) return;
            if ( $('.person__buttons', person).hasClass('active') ) {
                $('.person__buttons', person).toggleClass('active');
            } else {
                $('.person__buttons').removeClass('active');
                $('.person__buttons', person).addClass('active');
            }
        });
        
        $(person).on('click', function(ev) {
            if ( current_mode() !== "desktop" ) return;
            
            var person_id = $(this).data('person-id');
            if ( $(this).hasClass('active') ) {
                $(this).removeClass('active');
                rightSidebar.hide();
            } else {
                $('.person__item').removeClass('active');
                $(this).addClass('active');
                mymap.setView(GRAVES[person_id].get_coords());
                GRAVES[person_id].show_description();    
            }

        });
        
    })
}


 













window.onload = function () {
    init_map();
    get_data();
    init_sidebar();
}

