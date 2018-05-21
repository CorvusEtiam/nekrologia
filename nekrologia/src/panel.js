/**
 * @todo create full text editor from Mozilla page on Rich Text Editors
 * @todo fill-in POST method for metadata 
 */
function closeAll() {
    document.querySelectorAll('.panel__item').forEach(function(el) {
        el.classList.remove('active');
    });

    document.querySelectorAll('.sidebar__item').forEach(function(el) {
        el.classList.remove('active');
    });
}



function init_sidebar() {
    document.querySelectorAll('.activity__toggle').forEach(function(el) {
        el.addEventListener('click', function(ev) {
            var target_id = el.getAttribute('data-target');
            console.log("=> %s", target_id);
            var target = document.getElementById(target_id);
            target.classList.toggle('hidden');
        });
    });

    document.querySelectorAll('.sidebar__item').forEach(function(el) {
        var target_id = el.getAttribute('data-target');
        el.addEventListener('click', function(ev) {
            closeAll();
            document.getElementById(target_id).classList.add('active');
            el.classList.add('active')
        });        
    })
}
/*
var MODALS = (function() {
    function init_modal() {
        
    }

    var o = {};
    o.remove_user = function(user_id) {
        $.getJSON('api/internal', { action: 'show', param : 'user', id: user_id}, function(ev) {
            var html = `
                <p>
                    Login: <span id='modalRemUser_Username'></span>
                    Email: <span id='modalRemUser_Email'></span>
                </p>
                <div>
                    <button id='modalRemUser_BtnAnuluj' class='btn__info'>Anuluj</button>
                    <button id='modalRemUser_BtnDelete' class='btn__warn'>Usuń</button>
                </div>`
            
            $('#modalHeader').text("Usuń użytkownika");
            $('#modalContent').html(html);
            $('#modalRemUser_BtnAnuluj').on('click', function(ev) {
                $('#modal').toggle();
            })
            $('#modalRemUser_BtnDelete').on('click', function(ev) {
                $.post('api/remove/user', {
                    id: user_id 
                }).done(function(data) {
                    console.log(data);
                })
            })
        });
    }
})

function init_user_manager() {
    document.querySelectorAll('button.remove-button').forEach(function(el) {
        var id = el.getAttribute('data-target');
        el.addEventListener('click', function(ev) {
            MODALS.remove_user(id);
        })
    });
    
    document.querySelectorAll('button.edit-button').forEach(function(el) {
        var id = el.getAttribute('data-target');
        el.addEventListener('click', function(ev) {
            MODALS.edit_user(id);
        })
    });
    
}
*/
window.onload = function() {
    init_sidebar();
    document.getElementById('metadataPanelSaveButton').addEventListener('click', function(ev) {
        var data = {}
        document.querySelectorAll('#metadataPanel > input').forEach(function(el) {
            data[el.getAttribute('name')] = el.value;
        })
        localStorage.setItem('grave_metadata', data);
        if (localStorage.getItem('grave_description') === undefined ) {
            alert("Dane zostały zapisane. Proszę uzupełnić opis");
        } else {
            var choice = confirm("Czy uzupełniłeś również opis i chcesz przesłać dane?");
            if (choice) {
                data['description'] = localStorage.getItem('grave_description');
                $.post('api/create/grave', {
                    data: JSON.stringify(data),
                    dataType: "json"
                    /* TODO Uzupełnij jquery post */ 
                })
            } else {
                closeAll();
                document.querySelector('#editorPanel').classList.add('active');
                document.querySelector('[data-target="editorPanel"]').classList.add('active');
            }
        }
    })

    document.getElementById('cementaryPanelSaveButton').addEventListener('click', function(ev) {
        var form_data = {};
        document.querySelectorAll('#cementaryNewForm > input').forEach(function(el) {
            form_data[el.getAttribute('name')] = el.value();    
        })
        $.post('api/create/cementary', form_data, function(res) {
            if ( res !== undefined && res['status_msg'] !== undefined ) {
                if (res.status_msg == 'ok') {
                    alert('Cmentarz został dodany do listy');
                } else {
                    alert("Nastapił błąd: \n " + res.status_msg);
                }
            }
        });
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
    this.editor = new Editor({
        inp : 'editorInput',
        out : 'editorPreview',
        preview : 'refreshButton'
    });
};

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

(function() {
    function Modal(options) {
        this.el = document.getElementById(options.content);
        this.close = document.getElementById(options.close || 'ModalClose');
        this.body = document.getElementById(options.body);

        this.close.addEventListener('click', function(e) {
            this.body.classList.remove('active');
        }.bind(this))
    }

    Modal.prototype.open = function() {
        this.body.classList.add('active');
    }

    this.Modal = Modal;
})

function load_grave(id) {
    $.post("/api/show/grave/" + id, function(res) {
        $(".panel__form > [name='*']").each(function(el) {
            var name = el.getAttribute('name');
            el.value = res[name];
        })
    })
}