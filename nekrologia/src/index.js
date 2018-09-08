var GRAVE, CEMENTARY, MODALS;
MODALS = {};
GRAVE = {};
CEMENTARY = {};
var mymap, rightSidebar, currentSelection;

function template(string, replace_map) {
    return string.replace(/\$([A-Za-z_ ]+)/gmi,
    function(substr, key) {
          return replace_map[key] || "";
    });
}

currentSelection = {
    selected : null,
    set(id) { 
        if ( id === undefined ) { id = null; }
        if ( id === this.selected ) {
            this.selected = null;    
        } else {
            this.selected = id;
        }
        this.update();
    },
    get() { return this.selected; },
    update() {
        let open_map = document.getElementById('navOpenMap');
        let open_descr = document.getElementById('navPersonDescription');
        if ( this.selected === null ) {
            open_map.classList.add('hidden');
            open_descr.classList.add('hidden');
        } else {
            open_map.classList.remove('hidden');
            open_descr.classList.remove('hidden');
        }
    }
};

function add_to_map(grave) {
    var marker = L.marker(grave.get_coords());
    var popup_content = `
        <p class="popup__fullname">${grave.full_name_with_title}</p>
        <p class='popup__dates'><span>${grave.date_of_birth}</span> - <span>${grave.date_of_death}</span></p>
        <p class="popup__open"><a id='openGoogleMaps' href="https://www.google.com/maps/?q=${grave.gps_lon},${grave.gps_lat}"/>Nawiguj ( na stronie Google Maps )</a></p>
    `
    

    var popup = L.popup().setLatLng(this.coords).setContent(popup_content);
    marker.bindPopup(popup);
    marker.addTo(mymap);
    marker.on("click", function(ev) {
        var self = grave;
        var mode = current_mode();
        if ( mode !== 'mobile' ) {
            update_description(self.id);
            if ( !rightSidebar.isVisible() ) {
                rightSidebar.show();
            }
            if ( mode === "desktop" ) {
                center_map(self.id);    
            }
        } else {
            update_description(self.id);
            if ( !rightSidebar.isVisible() ) {
                rightSidebar.show();
            }
            document.getElementById('leftSidebar').classList.add('hidden');    
        }

    })
    grave.popup = popup;
    grave.marker = marker;
}



/*
class Person 
*/

(function() {
    function Grave(data) {
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
        this.description = undefined;
    }

    Grave.prototype.get_coords = function () {
        return [this.gps_lat, this.gps_lon];
    }

    this.Grave = Grave;
})();



function current_mode() {
    var mobile_port = window.matchMedia("(max-width:450px)").matches;
    var tablet = window.matchMedia('screen and (min-width:450px) and (max-width:768px').matches;
    if (mobile_port) { 
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

var AJAX = {
    /**get_data options type
     * @typedef {Object} GetDataOptions
     * @property {string} method - AJAX method 
     * @property {boolean} [sync=true]  - ASYNC = true 
     * @property {string} type   - response type "json"|"document"
     * @property {callback} success - success callback taking one response param
     * @property {callback} error   - error callback take xhr as param 
     * @property {string} [dataType=application/json] - Data type set by setRequestHeader fn. Need data field to be defined
     * @property {string} [data] - content to be send with request   
     */
    /**Get Data by AJAX
     * @param {string} url -- path to download
     * @param {GetDataOptions} options -- options 
     * @param {Object} self -- bind it as this within success and error callbacks
     */
    get_data: function(url, options, self) {
        var xhr = new XMLHttpRequest();
        var method = options.method.toUpperCase();
        if ( method !== 'POST' && method !== 'GET') {
            console.error("Method: %s not supported by AJAX.get_data", method);
        }
        xhr.open(method, url, options.sync || true);
        
        xhr.responseType = options.type;
        xhr.onreadystatechange = function(ev) {
            if ( xhr.readyState === XMLHttpRequest.DONE ) {
                if ( xhr.status === 200 ) {
                    if ( options.type === 'json' ) {
                        options.success.call(self, xhr.response);
                    } else {
                        options.success.call(self, xhr.responseText);
                    }
                } else {
                    options.error.call(self, xhr);
                }
            }
        } 
        if ( options.data !== undefined ) {
            xhr.setRequestHeader("Content-Type", options.contentType || "application/json")
        } else {
            xhr.send();
        }
    },
    load_cementaries() {
        this.get_data('api/list/cementary', {
            method: "GET",
            type: "json",
            success: function(json) {
                for ( let item in json ) {
                    CEMENTARY[item] = json[item];
                }
            },
            error(xhr) { console.log(">> %o", xhr); return; }
        });
    },
    load_graves() {
        this.get_data('api/list/grave', {
            method: "GET",
            type: "json",
            success: function(json) {
                for ( let item in json ) {
                    GRAVE[item] = new Grave(json[item]);
                    add_to_map(GRAVE[item]);
                }
            },
            error(xhr) { console.log(">> %o", xhr); return; }
        });
    },
    load_description(id, force, after_cb) {
        if ( GRAVE[id].description !== undefined ) {
            if (!force) return;
        } 
        this.get_data('/api/grave/'+id, {
            method: "GET",
            type: "text",
            success: function(html) {
                console.log("HTML ::: ", html.slice(1, 100));
                GRAVE[id].description = html;
                if ( after_cb !== undefined ) after_cb(GRAVE[id]);
            },
            error(xhr) {
                console.log(">> %o", xhr); return;
            }
        })
    }
}

function center_map(id) {
    mymap.setView(GRAVE[id].get_coords());
}

function update_description(id) {
    function show(grave) {
        document.getElementById('fullName').innerText = grave.full_name_with_title;
        document.getElementById('cementaryName').innerText = CEMENTARY[grave.cementary_id].full_name;
        document.getElementById('dateOfBirth').innerText = grave.date_of_birth;
        document.getElementById('dateOfDeath').innerText = grave.date_of_death;
        document.getElementById('city').innerText = CEMENTARY[grave.cementary_id]['city']
        document.getElementById('personDescription').innerHTML = grave.description;    
    }
    
    if ( GRAVE[id].description === undefined ) {
        AJAX.load_description(id, false, show);
    } else {
        show(GRAVE[id]);
    }
}

function init_left_sidebar() {
    document.querySelectorAll('.person__item').forEach(function(grave) {
        grave.addEventListener('click', function(ev) {
            const mode = current_mode();
            const id = this.getAttribute('data-person-id');
            currentSelection.set(id);
            if ( currentSelection.get() === null) {
                if ( rightSidebar.isVisible() ) { rightSidebar.hide(); }
                return;
            }
            
            if ( mode !== 'mobile' ) {
                update_description(id);
                if ( !rightSidebar.isVisible() ) {
                    rightSidebar.show();
                }
                if ( mode === "desktop" ) {
                    center_map(id);    
                }
            } else {
                update_description(id);
                if ( !rightSidebar.isVisible() ) {
                    rightSidebar.show();
                }
                document.getElementById('leftSidebar').classList.add('hidden');    
            }
        }.bind(grave))
    })
}

function $id(id, callback) {
    var el = document.getElementById(id); 
    el.addEventListener('click', callback.bind(el));        
}

function init_nav_bar() {
    $id('cornerMenu', function(ev) {
        let id = this.getAttribute('data-target');
        document.getElementById(id).classList.toggle('active')
    })

    $id('navPersonList', function(ev) {
        if ( rightSidebar.isVisible() ) {
            rightSidebar.hide();
        }
        var left = document.getElementById('leftSidebar');
        if ( left.classList.contains('hidden') ) {
            left.classList.remove('hidden');
        }
    });

    $id('navOpenMap', function(ev) {
        if ( current_mode() === "mobile" ) {
            var left = document.getElementById('leftSidebar');
            left.classList.add('hidden');
        }
        rightSidebar.hide();
        center_map(currentSelection.get());
    })

    $id('navPersonDescription', function(ev) {
        if ( current_mode() === "mobile" ) {
            var left = document.getElementById('leftSidebar');
            left.classList.add('hidden');            
        }
        update_description(currentSelection.get());
        if ( !rightSidebar.isVisible() ) {
            rightSidebar.show();
        }
    });
}

function init_modal() {
    var modal = document.getElementById("aboutPage");
    $id("aboutPageOpen", function(ev) {
        modal.style.display = "block";
    });
    $id("aboutPageClose", function(ev) {
        modal.style.display = "none";
    }); 
    document.querySelectorAll('.tab__control').forEach(function(elem) {
        elem.addEventListener("click", function(ev) {
            let tab_id = this.getAttribute('data-target');
            document.querySelectorAll('.tab__panel').forEach(function(panel) {
                panel.classList.remove('active');
            })
            document.getElementById(tab_id).classList.add('active');
            ev.preventDefault();
         }.bind(elem));
    })

    modal.style.display = "block";
}

window.onresize = function(ev) {
    if ( window.matchMedia('(min-width:768px)') ) {
        if ( document.getElementById('leftSidebar').classList.contains('hidden') ) {
            document.getElementById('leftSidebar').classList.remove('hidden');
        }
    }


}



window.onload = function() {
    init_map();
    AJAX.load_cementaries();
    AJAX.load_graves();
    init_left_sidebar();
    init_nav_bar();
    init_modal();
    currentSelection.update();
} 















