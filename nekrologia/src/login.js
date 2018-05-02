
window.onload = function() {
    $('#buttonSubmit').on('click', function(ev) {
        $.ajax(
            {
                url : '/login',
                data: $('form').serialize(),
                type: 'POST',
                success: function(resp){
                    console.log(resp);
                },
                error: function(error) {
                    console.log(error);
                }

            }
        );
    });
}

