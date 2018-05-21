var m = marked.Parser();

function sidebar() {
    var items = document.getElementsByClassName('sidebar__item');
    for ( var i = 0; i < items.length; i++ ) {
        var item = items[i];
        item.addEventListener('click', function(ev) {
            document.querySelectorAll('.sidebar__item').forEach(function(it) { it.classList.remove('active'); })
            ev.target.classList.add('active');
            var tab_id = ev.target.getAttribute('data-target');
            var tab = document.getElementById(tab_id);
            var tabs = document.getElementsByClassName('panel__item')
            for ( let t = 0; t < tabs.length; t++ ) {
                tabs[t].classList.remove('active');
            }
            tab.classList.add('active');
        });
    }
}

function reloadEditor() {

}

function saveMetadata() {
    var stored = {}
    document.querySelectorAll('#metadataForm > input[name]').forEach(function(input) {
        stored[input.name] = input.value;
    })
    $.post('/api/create/grave', stored, function(res) {
        $('#currentGrave').value = res.id;     
    });
}

function saveDescription() {
    var id = $('#currentGrave').value;
    var stored = {}
    document.querySelectorAll('#editor').forEach(function(input) {
        stored[input.name] = input.value;
    })
    stored['id'] = id

    $.post('/api/create/grave', stored, function(res) {
        res.json
    });
}


window.onload = function() {
    sidebar();
}
