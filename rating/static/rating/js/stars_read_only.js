(function ($) {

	$.fn.rating = function () {


		// Init Variablen //
        var min = 0;
        var max = 5;
		var element;
		var ids = [];
		var model = this.attr("data-model");
		var app_label = this.attr("data-app-label");
//      Die Sterne werden entsprechend mit Farbe gefüllt
		function paintValue(ratingInput, value) {
			var selectedStar = $(ratingInput).find('[data-value=' + value + ']');
			selectedStar.removeClass('fa-star-o').addClass('fa-star');
			selectedStar.prevAll('[data-value]').removeClass('fa-star-o').addClass('fa-star');
			selectedStar.nextAll('[data-value]').removeClass('fa-star').addClass('fa-star-o');
		}
//
		function clearValue(ratingInput) {
			var self = $(ratingInput);
			self.find('[data-value]').removeClass('fa-star').addClass('fa-star-o');
			self.find('.rating-clear').hide();
			var input = self.find('input');
			input.val(input.data('empty-value')).trigger('change');
		}

		// Iterate and transform all selected inputs
		for (element = this.length - 1; element >= 0; element--) {

			var el, i;
				originalInput = $(this[element]);
				stars = '';
                id = originalInput.attr("data-id");
				ids.push(originalInput.attr("data-id"));

            // HTML element construction
            for (i = min; i <= max; i++) {
                // Das Maximum vom Sterneanzahl wird als String generiert
                stars += ['<span class="fa fa-star-o" data-value="', i, '"></span>'].join('');
            }

			// Rating widget is wrapped inside a div
			el = [
				'<div class="rating-input" data-id="'+ id +'">',
				stars,
				'<span class="menge_read_only"></span>' +
                '</div>'].join('');

			// Replace original inputs HTML with the new one
            originalInput.replaceWith(el);
            console.log(el);

		}
		// Sterndaten holen
		function refresh_stars() {
			Dajaxice.rating.get_rating_list(get_rating_list, {'ids': ids, 'model': model, 'app_label': app_label});
		}

		function get_rating_list(data) {

			$('.rating-input').each(function () {
				var span = $(this),
					id = span.attr("data-id");

				val = data.results[id];
				menge = data.mengen[id];

				$(this).find(".menge_read_only").text('(' + menge + ')');

				if (val >= 0) {
					if (min <= val <= max) {
						paintValue(span, val);
					}
					else {
						clearValue(span);
					}
				}
				else {
					span.remove();
				}
				i++;
			});
		}

        refresh_stars()
	};

	// Auto apply conversion of number fields with class 'rating' into rating-fields
	$(function () {
		// $("#django-stars").empty().append('<img src="/media/bilder/ajax-loader.gif">');
		$(".rating").rating();
	});

}(jQuery));
