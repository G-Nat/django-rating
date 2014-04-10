(function ($) {

	$.fn.rating = function () {


//		Initialisiere Variablen
		var rating = $(".rating");
		var id = rating.attr("data-id");
		var model = rating.attr("data-model");
		var app_label = rating.attr("data-app-label");
        var starCount;

//      Rating setzen
		function set_rating(data){

            if (data.fehler) {
                alert(data.fehler);
                return false;
            }

//          Div mit der Klasse "menge" wird durch Danke-span für kurze Zeit ersetzt
			$(".menge").replaceWith("<span class='thanks'>Danke!</span>");
			$(".thanks").fadeIn("slow");
			setTimeout(function() {
				  $(".thanks").fadeOut("slow", function() {
						$(".thanks").replaceWith('<span class="menge">(' + data.menge + ')</span>');
				  });
			}, 1500);
		}

//      Sterndaten holen
		function refresh_stars() {
			Dajaxice.rating.get_rating(get_rating, {'id': id, 'model': model, 'app_label': app_label});
		}

		function get_rating(data) {
//          Menge von Ajax.py geholt und als Text zu .menge hinzugefügt
			$(".menge").text('(' + data.menge + ')');
                console.log(data.menge);
//              Aktuelle Bewertung
				starCount = data.sterne;
				paintValue($('.rating-input'), starCount);
                console.log(starCount);
		}

		// A private function to highlight a star corresponding to a given value
		function paintValue(ratingInput, value) {
//          Ein Stern, die den übergeben Value entspricht, wird in .rating-input gesucht
            console.log(ratingInput);
            min = 0;
			max = 5;
            if(min <= value <= max){
			    var selectedStar = ratingInput.find('[data-value=' + value + ']');
			    selectedStar.removeClass('fa-star-o').addClass('fa-star');
			    selectedStar.prevAll('[data-value]').removeClass('fa-star-o').addClass('fa-star');
			    selectedStar.nextAll('[data-value]').removeClass('fa-star').addClass('fa-star-o');
            }else{
                clearValue(ratingInput);
            }
		}

		// A private function to remove the selected rating
		function clearValue(ratingInput) {
			var self = $(ratingInput);
			self.find('[data-value]').removeClass('fa-star').addClass('fa-star-o');
			self.find('.rating-clear').hide();
			var input = self.find('input');
			input.val(input.data('empty-value')).trigger('change');
		}


//          Generierung von rating-input DIV und Sternen
			var starswrap, i;
				originalInput = $(this);
				max = 5;
				min = 0;
				stars = '';

			// HTML element construction
			for (i = min; i <= max; i++) {
				// Das Maximum vom Sterneanzahl wird als String generiert
				stars += ['<span class="fa fa-star-o" data-value="', i, '"></span>'].join('');
			}

			//Klonen vom RatingInput um Datenanbindungen mit Attributen zu bewahren
			var newInput = originalInput.clone()
				.attr('type', 'hidden')
				.data('max', max)
				.data('min', min);


//			Die Sterne und span.menge werden in ein DIV.rating-input gepackt
			starswrap = [
				'<div class="rating-input">',
				stars,
				'<span class="menge"></span></div>'].join('');

			// Replace original inputs HTML with the new one
			originalInput.replaceWith($(starswrap).append(newInput));




		$('.rating-input')

			// Highlight von Sternen bei drüberfahren
			.on('mouseenter', '[data-value]', function () {
				paintValue($('.rating-input'), $(this).data('value'));
			})

			// View current value while mouse is out
			.on('mouseleave', '[data-value]', function () {
            if (starCount !== "None" ){

                $('.rating-input').children('.fa-star').removeClass('fa-star').addClass('fa-star-o');
                }

				paintValue($('.rating-input'), starCount);

			})

			// Set the selected value to the hidden field
			.on('click', '[data-value]', function (e) {
				var self = $(this);
				starCount = self.data('value');
				Dajaxice.rating.set_rating(set_rating, {'id':id, 'model':model, 'app_label':app_label, 'sterne':starCount});
				self.siblings('input').val(starCount).trigger('change');
				self.siblings('.rating-clear').show();
				e.preventDefault();
				return false;
			})
//
//			// Remove value on clear
//			.on('click', '.rating-clear', function (e) {
//				clearValue($(this).closest('.rating-input'));
//				e.preventDefault();
//				return false;
//			})
//
//
//			// Initialize view with default value
//			.each(function () {
//				var input = $(this).find('input'),
//					val = input.val(),
//					min = input.data('min'),
//					max = input.data('max');
//				if (val !== "" && val >= min && val <= max) {
//					paintValue(this, val);
//					$(this).find('.rating-clear').show();
//				}
//				else {
//					clearValue(this);
//				}
//			});

		refresh_stars();
	};

	// Auto apply conversion of number fields with class 'rating' into rating-fields
	$(function () {
		// $("#django-stars").empty().append('<img src="/media/bilder/ajax-loader.gif">');
		$(".rating").rating();
		$(".rating").css("visibility", "visible");
	});

}(jQuery));
