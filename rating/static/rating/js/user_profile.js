(function ($) {

	$.fn.user_ratings = function () {

		// Init Variablen
		var user_ratings = $(".user_ratings");
		var model = user_ratings.attr("data-model");
		var app_label = user_ratings.attr("data-app-label");

		function init_actions() {
			// Das Löschen einer Bewertung
			user_ratings.find(".remove_rating").click(function() {
				Check = confirm("Diese Bewertung löschen?");
				if (Check) {
					Dajaxice.rating.profile_remove_rating(profile_remove_rating_callback, {'id': $(this).attr('data-rating-id')})
				}
			});
			// Das Bearbeiten einer Bewertung
			user_ratings.find(".edit_rating").click(function() {
				var comment = $(this).attr("data-rating-text");
				var id = $(this).attr("data-rating-id");
				var details = $(this).parent().parent().find(".details");
				details.empty().append('<textarea class="form-control comment_input" rows="3" placeholder="Kommentieren..." ></textarea><button class="btn btn-success post_comment btn-sm">Senden</button>');
				// Es wird überprüft, ob Textarea nicht leer ist.
                if (comment !== "None" ){
                    details.find(".comment_input").text(comment);
                }
				// Der Text wird an ajax.py übergeben, wenn man auf Button klickt.
                details.find(".post_comment").click(function() {
                    var comment = details.find(".comment_input").val();
                    Dajaxice.rating.profile_edit_rating(profile_edit_rating_callback, {'id': id, 'comment': comment});
                });
			});
		}
		// Aktualisierung der Ansicht von den User Bewertungen
		function refresh_user_ratings() {
			Dajaxice.rating.profile_get_data(refresh_user_ratings_callback, {'model': model, 'app_label': app_label});
		}
		// Die Daten werden abgefangen und an "user_ratings" angehengt
		function refresh_user_ratings_callback(data) {
			user_ratings.empty().append(data);
			init_actions();
		}
		// Wenn eine Bewertung gelöscht wird, aktuallisiert sich die Ansicht
		function profile_remove_rating_callback() {
			refresh_user_ratings();
		}
		// Wenn eine Bewertung bearbeitet wird, aktuallisiert sich die Ansicht
		function profile_edit_rating_callback(data) {
			// Meldung an User, wenn der Produkt nicht existiert.
            if (data.fehler) {
                alert(data.fehler);
            }
			refresh_user_ratings();
		}
		refresh_user_ratings();
	};
	// User_ratings Funktion wird ausgeführt beim aufrufen von der Profilseite
	$(function () {
		$(".user_ratings").user_ratings();
	});
}(jQuery));
