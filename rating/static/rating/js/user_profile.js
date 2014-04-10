(function ($) {

	$.fn.user_ratings = function () {

//      Variablen
		var user_ratings = $(".user_ratings");
		var model = user_ratings.attr("data-model");
		var app_label = user_ratings.attr("data-app-label");

		function init_actions() {
			user_ratings.find(".remove_rating").click(function() {
				Check = confirm("Diese Bewertung löschen?");
				if (Check) {
					Dajaxice.rating.profile_remove_rating(profile_remove_rating_callback, {'id': $(this).attr('data-rating-id')})
				};
			});
    //  In .user_ratings DIV wird nach .edit_rating gesucht und wenn man drauf klickt..
			user_ratings.find(".edit_rating").click(function() {
				var comment = $(this).attr("data-rating-text");

				var id = $(this).attr("data-rating-id");

				var details = $(this).parent().parent().find(".details");
				details.empty().append('<textarea class="form-control comment_input" rows="3" placeholder="Kommentieren..." ></textarea><button class="btn btn-success post_comment btn-sm">Senden</button>');
//				Wenn comment NICHT leer ist, wird der Text in .comment_input gespeichert
                if (comment !== "None" ){
                    details.find(".comment_input").text(comment);
                }
//                  Beim Click auf Senden ".comment_input"-Value als comment Variable gespeichert
                    details.find(".post_comment").click(function() {
                        var comment = details.find(".comment_input").val();
                        console.log(comment);
                        Dajaxice.rating.profile_edit_rating(profile_edit_rating_callback, {'id': id, 'comment': comment});
                    });
			});
		}

		function refresh_user_ratings() {
			Dajaxice.rating.profile_get_data(refresh_user_ratings_callback, {'model': model, 'app_label': app_label});
		}

		function refresh_user_ratings_callback(data) {
			user_ratings.empty().append(data);
			init_actions();
		}

		function profile_remove_rating_callback(data) {
			refresh_user_ratings();
		}

		function profile_edit_rating_callback(data) {
            if (data.fehler) {
                alert(data.fehler);
            }
			refresh_user_ratings();
		}
refresh_user_ratings();
	};

	$(function () {
		$(".user_ratings").user_ratings();
	});

}(jQuery));
