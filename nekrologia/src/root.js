window.PEOPLES = {}
window.DEFAULT_DESCR = "<span class='person-unkown'>Nieznaleziono opisu dla tej osoby</span>";
window.IS_MOBILE = false;
window.SIZE = (function () {
    return {
        width: document.body.clientWidth,
        height: document.body.clientHeight
    }
})();

window.STATE = {
    currently_selected: undefined,
    current_mode: function () {
        var a = window.matchMedia("(max-height:425px) and (orientation: landscape)").matches;
        var b = window.matchMedia("(max-width:425px) and (orientation: portrait)").matches;
        if (a || b) return "mobile";
        return "desktop";
    }
}

/*
dane:
    - Aktualnie wybrana postać
    - Aktualny tryb
    - Wymiary okna 
widok:
    - tryb desktop > 1024px
    - tryb tablet od 400px do 1024px
    - tryb mobilny < 400px
*/

var MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']

function Person(data) {
    this.id = data.id;
    this.name = data.imie;
    this.surname = data.nazwisko;
    this.birth_day = data.data_urodzin;
    this.death_day = data.data_smierci;
    this.gender = data.plec;
    this.title = data.title;
    this.cementary = data.cmentarz;
    this.coords = data.coords;
    this.html = undefined;
}

Person.prototype.center_map = function () {
    mymap.setView([52.43916748843736, 16.891230130755872], 18);

}

function prettify_date(date) {
    var date = date.split('-');

    var day = Number(date[0]);
    var month = Number(date[1]);
    var year = Number(date[2]);
    // 1 grudnia 1991
    return day + " " + MONTHS[month - 1] + " " + year;
}


Person.prototype.show_description = function () {
    load_person(this.id);
    $('#show-on-google').attr('href', "https://www.google.com/maps/?q=" + this.coords[0] + "," + this.coords[1])
    $('#person-descr').html(this.html || window.DEFAULT_DESCR)
    $('section#name').text(this.fullname(true));
    $('#of-birth').text(prettify_date(this.birth_day));
    $('#of-death').text(prettify_date(this.death_day));
}
/*
<div class="person-menu">
        <button id='b-map'>Mapa</button>
        <button id='b-descr'>Opis</button>
    </div>
*/
Person.prototype.add_to_map = function () {
    this.marker = L.marker(this.coords);
    var popup_content = [
        "<p id='popup-fullname'>",
        this.fullname(false),
        "</p>",
        "<p id='popup-dates'><span>", this.birth_day, "</span> - <span>", this.death_day, "</span></p>",
        "<p><a href=\"https://www.google.com/maps/?q=" + this.coords[0] + "," + this.coords[1] + "\"/>Nawiguj ( na stronie Google Maps )</a></p>"
    ].join("");
    this.popup = L.popup().setLatLng(this.coords).setContent(popup_content);
    /*
      this.marker.on("mouseover", function (ev) {
          this.popup.openOn(window.mymap);
       }.bind(this));
      this.marker.on("click", function (ev) {
          if ( window.SIZE.width <= 400 ) {
              $('#left-sidebar').toggleClass('hidden');
          }  
          this.show_description();
          rightSidebar.toggle();
      }.bind(this));
      */
    this.marker.bindPopup(this.popup);
    this.marker.addTo(mymap);
}

function init_map() {
    window.mymap = L.map("map");
    var access_token = "pk.eyJ1IjoibWVyZyIsImEiOiJjajFxbGwzNnEwMGRzMndyaWN2cDl6eDB0In0.MSQQPZbp-UNthPFIWDMX4Q";
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: access_token
    }).addTo(mymap);

    window.rightSidebar = L.control.sidebar('right-sidebar', {
        closeButton: false,
        position: "right"
    });


    mymap.setView([52.43916748843736, 16.891230130755872], 18);

    mymap.addControl(rightSidebar);
    window.rightSidebar.hide();


}


function download_peoples() {
    $.POST('api/list/grave', function (data) {
        for (var id in data) {
            var osoba = data[id];
            window.PEOPLES[id] = new Person(osoba);
            window.PEOPLES[id].add_to_map();
        }
    });
}

function load_person(id) {
    $.post('/api/person/' + id,
        function (data) { window.PEOPLES[id].html = data; $('#person-descr').html(data) })

}

function load_cementaries() {
    $.post('/api/list/cementary', function (json) {
        window.CEMENTARY = json;
    })
}

function is_mobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function searchBar() {}

window.onload = function main() {
    init_map();
    download_peoples();
    load_cementaries();
    window.IS_MOBILE = is_mobile();
/*
    $('#my-nav-list').on('click', function (ev) {
        $('li.active').removeClass('active');
        $(this).addClass('active');
        rightSidebar.hide();
        $('#left-sidebar').removeClass('hidden');
    })

    $('#my-nav-map').on('click', function (ev) {
        $('li.active').removeClass('active');
        $(this).addClass('active');
        rightSidebar.hide();
        $('#left-sidebar').addClass('hidden');
        if (STATE.currently_selected) {
            PEOPLES[STATE.currently_selected].center_map();
            PEOPLES[STATE.currently_selected].marker.openPopup();
        }
    })

    $('#my-nav-descr').on('click', function (ev) {
        $('li.active').removeClass('active');
        $(this).addClass('active');
        if (STATE.currently_selected) {
            PEOPLES[STATE.currently_selected].show_description();
        }
        $('#left-sidebar').addClass('hidden')
        rightSidebar.show();


    })

    $(window).resize(function() {
        $('#left-sidebar').removeClass('hidden');
    })

    $('#person-search-bar').on('input', function(ev) {
        $('.person-wrapper').removeClass('hidden');
        searchBar(this.value); 
    })   
*/
}





