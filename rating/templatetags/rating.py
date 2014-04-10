from django import template
from django.http import Http404
from django.contrib.contenttypes.models import ContentType

register = template.Library()

def get_stars(stars):
	i = -1
	star_list = ""
	for star in range(6):
		if stars > i:
			star_list += '<span class="glyphicon glyphicon-star"></span>'
		else:
			star_list += '<span class="glyphicon glyphicon-star-empty"></span>'
		i=i+1
	return {
		'star_list':star_list,
	}

register.inclusion_tag('rating/templatetags/get_stars.html')(get_stars)