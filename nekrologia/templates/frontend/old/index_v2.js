
(function() {
    'use strict';

    function Grave(data) {
        if (data === undefined ) { return; }
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

    function makeGrave(data) {
        if ( typeof(data) !== 'object' ) {
            var g;
            $.getJSON('/api/show/grave/'+data, function(data) {
                g = new Grave(data);
            });
        } else {
            g = new Grave(data);
        }
        return g;
    }

    this.makeGrave = makeGrave;
})();


$(window).ready(function() {
    window.ns = {};
    ns.MOBILE_THRESHOLD = 480;
    ns.TABLET_THRESHOLD = 760;
    ns.DESKTOP_THRESHOLD = 1200;
    ns.MOBILE = 0;
    ns.TABLET = 1;
    ns.DESKTOP = 2;


    ns.utils = {

        is_mobile : function() {
            var check = false;
            (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        },

        screen_type : function() {
            var w = window.innerWidth;
            if ( w <= ns.MOBILE_THRESHOLD ) { 
                return ns.MOBILE;
            } else if ( w > ns.TABLET_THRESHOLD && w <= ns.DESKTOP_THRESHOLD ) { 
                return ns.TABLET;
            } else {
                return ns.DESKTOP;
            }
        }
    }

    ns.init = function() {
        this.init_map();
        this.loaders.graves();
        this.loaders.cementaries();
        this.left_sidebar.init();
        window.addEventListener('resize', function(ev) {
            if ( this.screen_type() !== this.MOBILE ) {
                if ( this.leftSidebar.style.display === 'none' ) {
                    this.leftSidebar.style.display = 'block';
                }
            }
        }.bind(ns));
    }

    ns.loaders = {
        graves: function() {
            $.getJSON('/api/list/grave', function(data) {
                ns.graves = {};
                for ( let id in data ) {
                    if ( data.hasOwnProperty(id) ) {
                        ns.graves[id] = makeGrave(data[id]);
                    }
                }
            })
        },
        cementaries : function() {
            $.getJSON('/api/list/cementary', function(data) {
                ns.cementaries = {};
                for ( let id in data ) {
                    if ( data.hasOwnProperty(id) ) {
                        ns.cementaries[id] = data[id];
                    }
                }
            })
        },
        person(id) {
            $.post('/api/grave/'+id, function(data) {
                if ( data !== "" ) {
                    ns.graves[id].description = data;
                }
            })
        }
    }

    ns.views = {
        show_description : function(person) {
            /// link do google maps
            /// przycisk centrujący mapę i ew. zamykający sidebar;  
            var getId = document.getElementById.bind(document);
            if ( this.description === undefined ) {
                getId('fullName').innerText = person.full_name_with_title;
                getId('cementaryName').innerText = ns.cementaries[person.cementary_id].full_name;
                getId('dateOfBirth').innerText = person.date_of_birth;
                getId('dateOfDeath').innerText = person.date_of_death;
                getId('city').innerText = ns.cementaries[person.cementary_id]['city']
                getId('personDescription').innerHTML = person.description;
                ns.right_sidebar.show();
            }   
        },

        add_to_map : function(person) {
            var coords = [person.gps_lon, person.gps_lat];
            person.marker = L.marker(coords);
            var popup_content = [
                "<p id='popup-fullname'>",
                    person.full_name_with_title,
                "</p>",
                "<p id='popup-dates'><span>", person.date_of_birth, "</span> - <span>", person.date_of_death, "</span></p>",
                "<p><a href=\"https://www.google.com/maps/?q=" + person.gps_lon + "," + person.gps_lat + "\"/>Nawiguj ( na stronie Google Maps )</a></p>"
            ].join("");
    
            person.popup = L.popup().setLatLng(coords).setContent(popup_content);
            person.marker.bindPopup(person.popup);
            person.marker.addTo(ns.map);
        },

        center_map : function(lat, lon) {
            ns.map.setView([lat, lon], 18);
        },
        
    }

    ns.init_map = function() {
        ns.map = L.map("map");
        var access_token = "pk.eyJ1IjoibWVyZyIsImEiOiJjajFxbGwzNnEwMGRzMndyaWN2cDl6eDB0In0.MSQQPZbp-UNthPFIWDMX4Q";
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: access_token
        }).addTo(mymap);
        
        var right_sidebar = L.control.sidebar('rightSidebar', {
            closeButton: false,
            position: "right"
        });
        
        ns.map.setView([52.43916748843736, 16.891230130755872], 18);
    
        ns.map.addControl(right_sidebar);
        right_sidebar.hide();
        ns.right_sidebar = right_sidebar;
    }

    ns.left_sidebar = {
        init : function() {
            ns.leftSidebar = document.getElementById('leftSidebar');
            var entries = document.getElementsByClassName('person__item')
            for ( var i = 0; i < entries.length; i++ ) {
                entries[i].addEventListener('click', function(ev) {
                    /** Logika tego co staje się po kliknięciu jednego z przycisków w lewym pasku  */
                    var screen = this.utils.screen_type();
                    if ( screen === ns.MOBILE ) {
                        this.left_sidebar.hide();
                    }
                    this.views.show_description(ev.target.getAttribute('data-person-id'));
                    this.right_sidebar.show();                
                }.bind(ns), false);
            }
        },

        show: function () {
            ns.leftSidebar.style.display = "block";
        },

        hide: function() {
            ns.leftSidebar.style.display = 'none';
        }
    }

    ns.top_menu = {
        init: function() {},
    }
})

/**
 * 1. Init_map 
 * 2. Download all graves, cementaries
 * 3. 
 * 
 * 
 * 
 */
