
(function () {
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

function getData(url, options, self) {
    var xhr = new XMLHttpRequest();
    xhr.open(options.method, url, true);
    xhr.responseType = options.type;
    xhr.onreadystatechange = function(ev) {
        if ( xhr.readyState === XMLHttpRequest.DONE ) {
            if ( xhr.status === 200 ) {
                if ( options.type === 'json' ) {
                    options.success.call(self, JSON.parse(xhr.response));
                } else {
                    options.success(self, xhr.response);
                }
            } else {
                options.error.call(self, xhr);
            }
        }
    } 
    xhr.send();
}

var app = new Vue({
    el: '#app',
    data: {
        graves: {},
        grave_selected: null,
        cementaries: {}
    },
    mounted: function() {
        getData("/api/grave/list", {
            method: 'get',
            type: 'json',
            success: function(json) {
                for ( let id in json ) {
                    this.graves[id] = new Grave(json[id]);
                }
            },
            error(xhr) {  console.error(">> %o", xhr); return; }
        }, this);
        getData('/api/list/cementary', {
            method : 'json',
            type: "json",
            success: function(json) {
                for (let id in json) {
                    this.cementary[id] = json[id];
                }    
            },
            error(xhr) {
                console.error(">> %o", xhr); return;
            }
        });
    },
    methods: {
        loadDescription : function(id) {
            if ( this.graves[id] !== undefined && this.graves[id].description !== undefined ) {
                console.log("This grave is already loaded")
            }

            getData("/api/grave/"+id, {
                method: 'get',
                type: "document",
                success: function(html) {
                    this.graves[id].description = html;  
                },
                error(xhr) {  console.error(">> %o", xhr); return; }
            }, this)
            
        },
        graveSelected
    }
})