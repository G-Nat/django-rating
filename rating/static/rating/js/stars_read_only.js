(function ($) {

	$.fn.rating = function () {


		// Init Variablen //
		var element;
		var ids = [];
		model = this.attr("data-model");
		app_label = this.attr("data-app-label");

		// A private function to highlight a star corresponding to a given value
		function _paintValue(ratingInput, value) {
			var selectedStar = $(ratingInput).find('[data-value=' + value + ']');
			selectedStar.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
			selectedStar.prevAll('[data-value]').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
			selectedStar.nextAll('[data-value]').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
		}

		// A private function to remove the selected rating
		function _clearValue(ratingInput) {
			var self = $(ratingInput);
			self.find('[data-value]').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
			self.find('.rating-clear').hide();
			var input = self.find('input');
			input.val(input.data('empty-value')).trigger('change');
		}

		// Iterate and transform all selected inputs
		for (element = this.length - 1; element >= 0; element--) {


			var el, i,
				originalInput = $(this[element]),
				max = originalInput.data('max') || 5,
				min = originalInput.data('min') || 0,
				clearable = originalInput.data('clearable') || null,
				stars = '';
				ids.push(originalInput.attr("data-id"));

			// HTML element construction
			for (i = min; i <= max; i++) {
				// Create <max> empty stars
				stars += ['<span class="glyphicon glyphicon-star-empty" data-value="', i, '"></span>'].join('');
			}
			// Add a clear link if clearable option is set
			if (clearable) {
				stars += [
					' <a class="rating-clear" style="display:none;" href="javascript:void">',
					'<span class="glyphicon glyphicon-remove"></span> ',
					clearable,
					'</a>'].join('');
			}

			// Clone the original input to preserve any additional data bindings using attributes.
			var newInput = originalInput.clone()
				.attr('type', 'hidden')
				.data('max', max)
				.data('min', min);

			// Rating widget is wrapped inside a div
			el = [
				'<div class="rating-input">',
				stars,
				'<span class="menge_read_only"></span></div>'].join('');

			// Replace original inputs HTML with the new one
			originalInput.replaceWith($(el).append(newInput));
		}

		Dajaxice.rating.get_rating_list(function (data) {
			$('.rating-input').each(function () {
				var span = $(this),
				 	input = $(this).find('input'),
					min = input.data('min'),
					max = input.data('max');
					id = input.data("id")

				val = data.results[id]
				menge = data.mengen[id]
				$(this).find(".menge_read_only").text('(' + menge + ')');
				if (val >= 0) {
					if (val !== "" && +val >= min && +val <= max) {
						_paintValue(span, val);
					}
					else {
						_clearValue(span);
					}
				}
				else {
					span.remove();
				}
				i++;
			});
		}, {'ids': ids, 'model': model, 'app_label': app_label});

	};

	// Auto apply conversion of number fields with class 'rating' into rating-fields
	$(function () {
		// $("#django-stars").empty().append('<img src="/media/bilder/ajax-loader.gif">');
		$(".rating").rating();
		$(".rating").css("visibility", "visible");
	});

}(jQuery));
