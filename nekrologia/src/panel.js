
function init_sidebar() {
    window.PANELS = {}
    document.querySelectorAll('.activity__toggle').forEach(function(el) {
        el.addEventListener('click', function(ev) {
            var target_id = el.getAttribute('data-target');
            console.log("=> %s", target_id);
            var target = document.getElementById(target_id);
            if ( target.classList.contains('hidden') ) {
                target.classList.remove('hidden');
            } else {
                target.classList.add('hidden');
            }
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

window.onload = function() {
    init_sidebar();
}
