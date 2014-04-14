(function ($) {
	$.fn.rating = function () {
		// Initialisiere Variablen
		var rating = $(".rating");
		var id = rating.attr("data-id");
		var model = rating.attr("data-model");
		var app_label = rating.attr("data-app-label");
		var	max = 5;
		var	min = 0;
		var starCount;
		// Rating setzen
		function set_rating(data){
			// Feedback an User, wenn Produkt nicht existiert.
			if (data.fehler) {
				alert(data.fehler);
				return false;
			}
			// Div mit der Klasse "menge" wird durch Danke-span für kurze Zeit ersetzt
			$(".menge").replaceWith("<span class='thanks'>Danke!</span>");
			$(".thanks").fadeIn("slow");
			setTimeout(function() {
				$(".thanks").fadeOut("slow", function() {
					$(".thanks").replaceWith('<span class="menge">(' + data.menge + ')</span>');
				});
			}, 1500);
		}
		// Sterndaten holen
		function refresh_stars() {
			Dajaxice.rating.get_rating(get_rating, {'id': id, 'model': model, 'app_label': app_label});
		}
		// Funktion für Bewertungsanzeige
		function get_rating(data) {
			// Anzahl der Bewertungen wird bei .menge hinzugefügt
			$(".menge").text('(' + data.menge + ')');
			// Aktuelle Bewertung
			starCount = data.sterne;
			paintValue($('.rating-input'), starCount);
		}

		// Funktion zum Sterne highlighten auf übergebene Value bezogen.
		function paintValue(ratingInput, value) {
			if(min <= value <= max){
				var selectedStar = ratingInput.find('[data-value=' + value + ']');
				selectedStar.removeClass('fa-star-o').addClass('fa-star');
				selectedStar.prevAll('[data-value]').removeClass('fa-star-o').addClass('fa-star');
				selectedStar.nextAll('[data-value]').removeClass('fa-star').addClass('fa-star-o');
			}else{
				clearValue(ratingInput);
			}
		}
		// Löschen vom gewählten Bewertungsvolume
		function clearValue(ratingInput) {
			var self = $(ratingInput);
			self.find('[data-value]').removeClass('fa-star').addClass('fa-star-o');
			var input = self.find('input');
			input.val(input.data('empty-value')).trigger('change');
		}
		// Generierung von rating-input DIV und Sternen
		var starswrap, i;
			originalInput = $(this);
			stars = '';
		// Die Sterne werden erzeugt
		for (i = min; i <= max; i++) {
			// Das Maximum vom Sterneanzahl wird als String generiert
			stars += ['<span class="fa fa-star-o" data-value="', i, '"></span>'].join('');
		}
		// Die Sterne und span.menge werden in ein DIV.rating-input gepackt
		starswrap = [
			'<div class="rating-input">',
			stars,
			'<span class="menge"></span></div>'].join('');
		// Input wird durch starswrap ersetzt.
		originalInput.replaceWith($(starswrap));
		$('.rating-input')
			// Highlight von Sternen bei drüberfahren
			.on('mouseenter', '[data-value]', function () {
				paintValue($('.rating-input'), $(this).data('value'));
			})
			// Anzeige vomn der aktuellen Bewertung
			.on('mouseleave', '[data-value]', function () {
				if (starCount !== "None" ){
					$('.rating-input').children('.fa-star').removeClass('fa-star').addClass('fa-star-o');
				}
				paintValue($('.rating-input'), starCount);
			})
            // Entsprechnde Value von angeklickten Stern wird zum hidden Field gesetzt.
			.on('click', '[data-value]', function () {
				var self = $(this);
				starCount = self.data('value');
				Dajaxice.rating.set_rating(set_rating, {'id':id,'model':model,'app_label':app_label,'sterne':starCount});
			})
		refresh_stars();
	};
	// Rating Funktion wird beim Seitenladen ausgeführt.
	$(function () {
		$(".rating").rating();
	});
}(jQuery));
