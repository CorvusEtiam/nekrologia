
/**
 * @todo Zaimplementuj akcje
 * @todo Dodaj importowanie/aktualizację/eksport danych i opisów z i na serwer 
 */

var DATE_TYPES = {
    DEATH : "death",
    BIRTH : "birth"
}

var ACTION = {    
    "save-metadata" : function(ev) {},
    "save-description" : function(ev) {},
    "update-metadata" : function(ev) {},
    "make-admin" : function(ev) {
        var id = $(this).getAttribute('data-target');
        $.post("/api/update/user", {
            "id" : id,
            "admin_permit" : 1
        }).done(function(result) {
            alert(result["status_msg"])
        })
    },
    "activate-account" : function(ev) {
        var id = $(this).getAttribute('data-target');
        $.post("/api/update/user", {
            "id" : id,
            "activated" : 1
        }).done(function(result) {
            alert(result["status_msg"])
        })
    },
    "remove-account" : function(ev) {
        var id = $(this).getAttribute('data-target');
        if (confirm("Czy chcesz usunąć " + $(`tr[data-user-id="${id}"] #Username`).text() + "?")) {
            $.post("/api/remove/user", {
                "id" : id
            }).done(function(result) {
                alert(result["status_msg"])      
            }) 
        }
    },
    "remove-grave" : function(ev) {
        var id = $(this).getAttribute('data-target');
        var name = $(`tr[data-grave-id="${id}"] #name`).text();
        var surname = $(`tr[data-grave-id="${id}"] #surname`).text()
        if (confirm("Czy chcesz usunąć dane dla: " + name + " " + surname + "?")) {
            $.post("/api/remove/grave", {
                "id" : id
            }).done(function(result) {
                alert(result["status_msg"])      
            }) 
        }
    }
}



function serializeForm(selector) {
    $(selector).forEach(function(idx, inp) {
        if ( inp.getAttribute("data-serializable") === "true" ) {

        }
    })
}

function createDate(type) {
    if ( DATE_TYPES[type] === undefined ) {
        console.error("Unkown kind of date.");
    }

    var day = $("#day_of_"+type).value();
    var month = $("#month_of_"+type).value();
    var year = $("#year_of_"+type).value();
    
    if ( year === "" ) {
        return null 
    } else if ( day === "" || month === "" ) {
        return year
    } else {
        return `${day}.{$month}.{$year}` // "dd.mm.yyyy"
    }
}


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

    $('button[data-action]').forEach(function(_, btn) {
        var action = btn.getAttribute('data-action')
        if ( action === "" ) return 
        if ( ACTION[action.toLowerCase()] === undefined ) console.log("Action %s unknown", action);
        
        $(btn).on("click", function(ev) { ACTION[action].call(this, ev) });
    })
}

window.onload = main;
