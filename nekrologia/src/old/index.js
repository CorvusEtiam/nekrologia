var GRAVES = {};
var CEMENTARY = {};
var personSelected = null;
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

    Person.prototype.center_map = function() {
        mymap.setView(this.get_coords());
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
/*
    Person.prototype.show_description = function () {
        this.load_description();
    }
*/
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

function init_sidebar () {
    $('.person__item').each(function(index, person) {
        
        $(person).on('click', function(ev) {
            var id = $(this).data('person-id');
            if ( current_mode() === "desktop" || current_mode() === "tablet" ) {
                mymap.setView(GRAVES[id].get_coords());
            } else if ( current_mode() === "mobile") {
                $('#leftSidebar').addClass('hidden');
            }
            GRAVES[id].show_description();              
        })
        
        $(person).on("click", function(ev) {
            var id = $(this).data('person-id');
            if ( personSelected !== id ) {
                personSelected = id;
            } else {
                personSelected = null;
            }
            update_nav();
        })
    })
}

function update_nav() {
    if ( personSelected !== null ) {
        $('.ui__control').each(function(idx, control) {
            if ( $(control).hasClass('hidden') ) {
                $(control).removeClass('hidden')
            }
        })
    } else {
        $('.ui__control').each(function(idx, control) {
            $(control).addClass("hidden");
        });
    }
}

function init_nav() {
    $('.button__toggle').each(function(idx, toggler) {
        var target = $(toggler).data('target');
        console.log("target: %s", target);
        $(toggler).on('click', function(ev) {
            $(toggler).toggleClass('active')
            $('#' + target).toggleClass('active');
        }) 
    })  
    /// Widoczne tylko w trybie @mobile i @tablet
    $('#navPersonList').on('click', function(ev) {
        if ( $('#leftSidebar').hasClass('hidden') ) {
            if ( rightSidebar.isVisible() ) { rightSidebar.hide(); }
            $('#navPersonList').removeClass('hidden');
        }
    })
    $('#navOpenMap').on('click', function(ev) {
        if ( personSelected !== null && GRAVES[personSelected] !== undefined ) {
            let person = GRAVES[personSelected];
            mymap.setView(person.get_coords());
        }
    })
    $('#navPersonDescription').o('click', function(ev) {

    })

    /**
     * @todo Navbar buttons rewrite 
     */
}
 


window.onload = function () {
    init_map();
    get_data();
    init_sidebar();
    init_nav();
    update_nav();
    
}

