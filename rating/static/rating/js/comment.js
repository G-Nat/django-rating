(function ($) {
	$.fn.comment = function () {
        // Init Variablen //
		var comments = $(".comments");
		var id = comments.attr("data-id");
		var model = comments.attr("data-model");
		var app_label = comments.attr("data-app-label");
        // Auflistung von den Kommentaren //
		function init_comments(){
			comments.empty().append('<i class="fa fa-spinner fa-spin" style="font-size:50px;"></i>');
			Dajaxice.rating.get_comments(fill_content, {'id': id, 'model': model, 'app_label': app_label});
		}
        // Das Speichern vom Kommentar //
		function init_form() {
			var comment_form = $(".comment_form");
			comment_form.submit(function () {
				var comment = comment_form.find("textarea").val()
				Dajaxice.rating.set_comment(fill_content, {'id': id, 'model': model, 'app_label': app_label, 'comment': comment});
				comments.empty().append('<i class="fa fa-spinner fa-spin" style="font-size:50px;"></i>');
				return false;
			});
		}
        // Abgegebene Kommentar direkt anzeigen lassen //
		function fill_content(data){
        // Alert an User, wenn Kommentar leer ist //
			if (data.fehler) {
				alert(data.fehler);
				init_comments();
			}
			else {
				comments.empty().append(data);
				init_form();
			}
		}
		init_comments();
	};
	$(function () {
		$(".comment_form").comment();
	});
}(jQuery));
