

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
    }

    Grave.prototype.to_repr = function() {
        return "Grave[id : " + this.id + "]";
    }
    
    
    this.Grave = Grave;
})();

(function() {
    function Cementary(data) {
        this.id = data.id 
        this.full_name = data.full_name;
        this.full_address = data.full_address 
        this.city = data.city;
    }

    this.Cementary = Cementary;
})

(function() {
    function User(data) {
        this.username = data.username;
        this.email    = data.email;
    }
    this.User = User;
})

