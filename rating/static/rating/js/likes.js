(function ($) {

	$.fn.like = function () {

    //  Variablen //
		var like = $(".like");
		var id = like.attr("data-id");
		var model = like.attr("data-model");
		var app_label = like.attr("data-app-label");
		var status = false;




        // Replace original inputs HTML with the new one


		function init_click(){
			like.one("click", function () {
				Dajaxice.rating.set_like(set_like, {'id': id, 'model': model, 'app_label': app_label});

			});

		}

		function set_like(data){
			status = data.like;
//          Ein Feedback an User
            if (status == true){
                $(".like_feedback").fadeIn("slow").text("Like!");
                    setTimeout(function() {
                        $(".like_feedback").fadeOut("slow");
                    }, 1500);
            }else{
                $(".like_feedback").text("Unlike!").fadeIn("slow");
                    setTimeout(function() {
                        $(".like_feedback").fadeOut("slow");
                    }, 1500);
            }

            set_hover();

		}
//      Hover Effekt
		function set_hover(){
//          Wenn like = false ist, wird das Like beim drüberfahren eingefärbt.
			if (status == false) {
				like.hover(
					function() {
						like.removeClass("fa-thumbs-o-up").addClass("fa-thumbs-up");
					}, function() {
						like.removeClass("fa-thumbs-up").addClass("fa-thumbs-o-up");
					}
				);
			}
//          Wenn like = true ist, wird das Like beim drüberfahren schwarz bleiben.
			else {
//              Schaltet das Hover Effekt aus
				like.unbind('mouseenter mouseleave');
				like.addClass("fa-thumbs-up");
			}
			init_click();
		}

// Like Status wird vom ajax.py geholt und an get_like function übergeben.
		function refresh_like() {
			Dajaxice.rating.get_like(get_like, {'id': id, 'model': model, 'app_label': app_label});
		}

		function get_like(data) {
			status = data.like;
            console.log(status);

			set_hover();
		}
//
//        //Klonen vom RatingInput um Datenanbindungen mit Attributen zu bewahren
//	    var newInput = like.clone()
//				.attr('value', status);
//        console.log(newInput);
//
//        like.replaceWith(newInput);
//         console.log(like);


		refresh_like();

	};

	$(function () {
		$(".like").like();
	});

}(jQuery));
