
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


function saveMetadata() {
    var stored = {}
    document.querySelectorAll('#metadataForm input[name]').forEach(function(input) {
        stored[input.name] = input.value;
    })
    
    stored['cementary_id'] = document.querySelector('select[name="cementary_id"').value
    if ( $('knownFullDate').value === true ) {

    } 
    
    stored['date_of_birth']
    stored['date_of_death']
    
    $.ajax({
        type: "POST",
        url: '/api/create/grave',
        success: function(res) {
            alert(res.status_msg);
            $('#currentGrave').value = res.id;     
        },
        data: JSON.stringify(stored),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
    })
}

function saveDescription() {
    var stored = {}
    stored.id = document.querySelector('select[name="grave_id"]').value;
    editor.preview();
    
    stored['description'] = document.getElementById('editorPreview').innerHTML; 
    console.log(stored)    
    $.ajax({
        type: "POST",
        url: '/api/create/description',
        success: function(res) {
            alert(res.status_msg);
        },
        data: JSON.stringify(stored),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
    })
}

function loadMetadata(grave_id) {
    $.getJSON("/api/show/grave/" + grave_id, function(data) {
        for ( var field_name in data ) {
            $('#metadataUpdateForm input[name="' + field_name + '"]').value = data[field_name]
        }    
    })
}


(function() {
/**
 * @param options -- it takes `input`, `output` element id 
 */

var TAB = 9;

function Editor(options) {
    this.options = options;
    this.inp = document.getElementById(options.inp);
    this.out = document.getElementById(options.out);
    /*
    this.modal = new Modal({
        {
            content : 'ModalContent', 
            open : 'ModalOpen', 
            body : 'ModalBody' 
        }
    })
    this.modal.body.innerHTML = 
        "<label for='align_image'>Zmień położenie obrazu w poziomie</label>" +
        "<select name='align_image'>" +
            "<option value='center'>Centrum</option>" +
            "<option value='left'>Lewo</option>" +
            "<option value='right'>Prawo</option>" +
        "</select>" +
        "<button id='saveAlignment'>Zapisz</button>"

    this.modal.body.getElementById('saveAlignment').addEventListener('click', function(ev) {
        this.selected_image.classList.add(ev.target.value);
    }.bind(this));

`   */
    this.run_preview = document.getElementById(options.preview);
    this.inp.addEventListener('keydown', function(ev) {
        var start;
        if ( ev.keyCode == TAB || ev.which == TAB ) {
            ev.preventDefault();
            start = this.selectionStart;
            this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
            this.selectionEnd = start + 1; 
        }
    })

    this.run_preview.addEventListener('click', function(ev) {
        this.out.innerHTML = this.preview();   
    }.bind(this));

    this.renderer = new marked.Renderer();
    this.renderer.image = function(href, title, text) {
        var new_href = "images/uploaded/" + href;
        return '<img src="' + new_href + '" alt="' + text + '" />'
    }
}

Editor.prototype.preview = function() {
    return marked(this.inp.value, {renderer: this.renderer});
}


this.Editor = Editor;

})();

window.onload = function() {
    sidebar();
    window.editor = new Editor({
        inp : 'editorInput',
        out : 'editorPreview',
        preview : 'refreshButton'
    });    

    $('.is__unknown').on('change', function(ev) {
        var elem = ev.target.parentNode.parentNode.querySelector('input[name]');
        elem.type = ( ev.target.checked ) ? "date" : "number"; 
    })

    

    $('#selectPersonToUpdate').on('change', function(el) {
        loadMetadata(el.target.value);
    })
    
    $('#sendMetadata').on('click', function(ev) {
        ev.preventDefault();
        saveMetadata();
    })

    $('#sendDescription').on('click', function(ev) {
        ev.preventDefault();
        saveDescription();
    })

    

    $('#sendImage').on('click', function() {
        var fi = $('#upload').files[0];
        var formData = new FormData();
        formData.append("picture", fi, fi.name)
        $.ajax({
            url : "/panel/upload", 
            type: 'POST',
            data: formData,
            processData: false,
            contentType : false
        });
    });
};
