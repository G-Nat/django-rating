(function ($) {
	$.fn.like_list = function () {
		// Init Variablen //
		var like_list = $(".like_list");
		var model = like_list.attr("data-model");
		var app_label = like_list.attr("data-app-label");
		// Daten werden abgefangen und an get_like_list_callback übergeben
		function refresh_like_list() {
			Dajaxice.rating.get_like_list(get_like_list_callback, {'model': model, 'app_label': app_label});
		}
		// Callback Funktion, wo Daten angehengt werden
		function get_like_list_callback(data) {
			like_list.empty().append(data);
		}
		refresh_like_list();
	};
	// Funktion like_list wird beim Laden der Seite ausgeführt
	$(function () {
		$(".like_list").like_list();
	});
}(jQuery));
