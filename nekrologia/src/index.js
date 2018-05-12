var PERSON, CEMENTARY, STATES;

// MAP -> LIST | DESCRIPTION
// LIST -> MAP | DESCRIPTION 
// DESCRIPTION -> LIST | MAP 


(function() {
    function UIElem(id) {
        this.id = id;
        this.handle = document.getElementById(id);
    }

    UIElem.prototype.show = function() {}
    UIElem.prototype.hide = function() {}
    UIElem.prototype.toggle = function() {}
    
    this.UI = UI;

})();

function is_mobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

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