function main() {
    $('.sidebar__item a').each(function(index, tab) {
        $(tab).on("click", function(e) {
            e.preventDefault();
            $(this).tab("show");
        })
    })

    $.trumbowyg.svgPath = '/styles/icons.svg';
    $('#editorNewGrave').trumbowyg({
        btns: [
            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'del'],
            ['superscript', 'subscript'],
            ['link'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['removeformat']
        ]
    });
}

window.onload = main;