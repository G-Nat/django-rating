(function ($) {

	$.fn.like_list = function () {

		// Init Variablen //
		var like_list = $(".like_list");
		var id = like_list.attr("data-id");
		var model = like_list.attr("data-model");
		var app_label = like_list.attr("data-app-label");

		function refresh_like_list() {
			Dajaxice.rating.get_like_list(get_like_list_callback, {'model': model, 'app_label': app_label});
		}

		function get_like_list_callback(data) {
			like_list.empty().append(data);
		}

		refresh_like_list();
	};

	$(function () {
		$(".like_list").like_list();
	});

}(jQuery));
