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
        console.log("--> ", target_id);
        el.addEventListener('click', function(ev) {
            /// close all panels
            document.querySelectorAll('.panel__item').forEach(function(el) {
                el.classList.remove('active');
            });

            document.querySelectorAll('.sidebar__item').forEach(function(el) {
                el.classList.remove('active');
            });

            document.getElementById(target_id).classList.add('active');
            el.classList.add('active')
        });        
    })
}

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
                $.post('api/internal', {
                    action : "delete",
                    param: "users",
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

window.onload = function() {
    init_sidebar();
}
