# -*- coding: utf-8 -*-
import json
from dajaxice.decorators import dajaxice_register
from django.contrib.contenttypes.models import ContentType
from ipware.ip import get_ip
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from models import Eintrage as Rating, UserIP
from django.db.models import Q
from django.conf import settings


###Liste der möglichen Ausnahmen####
fehlerliste = {
	"1": "Fehler bei GetContent: App_label, Model oder Object ID stimmen nicht!",
	"2": "Du willst zu hoch hinaus!",
	"3": "Produkt nicht vorhanden!",
	"4": "Bitte ein Kommentar abgeben!",
	"5": u"Anonyme User können keine Kommentare haben!",
	"6": "Fehler2",

}

### GENERAL ###
class GetContent(object):
	# Hier werden die Daten gespeichert, die bei __init__ rausgefunden werden
	# Name des Models
	content_type = ""
	# ID des bewerteten Objektes
	content = ""
	# Das ganze Model des bewerteten Objektes
	model_type = ""
	# Die Model Klasse
	model_class = ""

	# ein Initialisator
	# self ist für automatische Zuweisung zuständig --> general = GetContent(id, model, app_label)
	def __init__(self, model, app_label, id=0):
		self.content_type = ContentType.objects.get(app_label=app_label, model=model)
		# Python Model Class
		self.model_class = self.content_type.model_class()
		# Das ganze Model (COntent Type Model) wird geholt. Es ist nötig zuerst COntentTYpe abzufragen.
		self.model_type = ContentType.objects.get_for_model(self.model_class)
		if id:
			# Inhalt vom Objekt = ganzes Row
			self.content = self.content_type.get_object_for_this_type(id=id)


#### STARS ####
# Abfrage einer Bewertung
@dajaxice_register
# ID, Model und App_label des bewerteten Objekts werden übergeben
def get_rating(request, id, model, app_label):
	result = ""
	counter = 0
	# GetContent wird aufgerufen und geholte Daten(id, model, app_label) in general Variable gespeichert.
	# try:
	general = GetContent(model, app_label, id)
	# except:
	# 	return json.dumps({'fehler':fehlerliste['1']})
	# Django Filter = SQL SELECT ... WHERE content_type__pk =
	ratings = Rating.objects.filter(content_type__pk=general.model_type.id, object_id=general.content.id, sterne__isnull=False)
	if ratings:
		for rating in ratings:
			if counter == 0:
				result = int(rating.sterne)
			else:
				result = int(rating.sterne) + result
			counter = counter + 1
		result = result / counter
	return json.dumps({'sterne': result, "menge": counter})

# Abfrage aller Bewertungen für Produktenliste
@dajaxice_register
def get_rating_list(request, ids, model, app_label):
	results = {}
	mengen = {}
	content_type = ContentType.objects.get(app_label=app_label, model=model)
	for id in ids:
		result = 0
		counter = 0
		content = content_type.get_object_for_this_type(id=id)
		model_type = ContentType.objects.get_for_model(content)
		ratings = Rating.objects.filter(content_type__pk=model_type.id, object_id=content.id, sterne__isnull=False)
		if ratings:
			for rating in ratings:
				if rating.sterne:
					if counter == 0:
						result = int(rating.sterne)
					else:
						result = int(rating.sterne) + result
				counter = counter + 1
			if result and counter:
				result = result / counter
			results[id] = result
			mengen[id] = ratings.count()
	return json.dumps({'results': results, "mengen": mengen})


@dajaxice_register
def set_rating(request, id, model, app_label, sterne):
	ip_object = ""
	general = GetContent(model, app_label, id)
	# Wenn ein SternValue grösser ist.
	if int(sterne) > 5:
		return json.dumps({'fehler': fehlerliste['1']})
	try:
		content = general.content_type.get_object_for_this_type(id=id)
	except:
		return json.dumps({'fehler': fehlerliste['3']})

	# IP ermitteln
	if not request.user.is_authenticated():
		ip = get_ip(request)
		# UserIP Tabelle wird nach angefangene IP Adresse durchgesucht.
		try:
			ip_object = UserIP.objects.get(ip=ip)
		# IP wird neu gespeichert oder überschrieben, damit es keine doppelte Einträge mit gleichen IP-Adresse gibt
		except:
			ip_object = UserIP(ip=ip)
			ip_object.save()

	# Bewertungen speichern
	try:
		# Wenn IP vorhanden ist, wird die Bewertungen-Tabelle nach Einträge mit dieser Adresse durchgesucht.
		if ip_object:
			rating = Rating.objects.get(content_type__pk=general.model_type.id, object_id=general.content.id, ip=ip_object)
		# Sonst die Bewertungen mit dem ID vom eingeloggten User.
		else:
			rating = Rating.objects.get(content_type__pk=general.model_type.id, object_id=general.content.id, user=request.user)
		# Die Sterne werden neu abgespeichert.
		rating.sterne = int(sterne)
	except:
		if ip_object:
			rating = Rating(content_object=content, sterne=sterne, ip=ip_object)
		else:
			rating = Rating(content_object=content, sterne=sterne, user=request.user)
	rating.save()
	menge = Rating.objects.filter(content_type__pk=general.model_type.id, object_id=content.id,
	                              sterne__isnull=False).count()
	return json.dumps({'message': sterne, 'menge': menge})


######################## LIKES ########################

@login_required
@dajaxice_register
def get_like(request, id, model, app_label):
	general = GetContent(model, app_label, id)
	status = False
	try:
		rating = Rating.objects.get(content_type__pk=general.model_type.id, object_id=general.content.id, user=request.user)
		if rating.likes:
			status = True
	except:
		pass
	return json.dumps({'like': status})

# Like setzen
@login_required
@dajaxice_register
def set_like(request, id, model, app_label):
	content_type = ContentType.objects.get(app_label=app_label, model=model)
	try:
		content = content_type.get_object_for_this_type(id=id)
	except:
		return json.dumps({'message': "Produkt nicht vorhanden!"})
	model_type = ContentType.objects.get_for_model(content)

	try:
		rating = Rating.objects.get(content_type__pk=model_type.id, object_id=content.id, user=request.user)
		if rating.likes:
			rating.likes = False
		else:
			rating.likes = True
	except:
		rating = Rating(content_object=content, likes=True, user=request.user)
	rating.save()
	return json.dumps({'like': rating.likes})


######################## COMMENTS ########################
# Abfrage von Kommentaren
@login_required
@dajaxice_register
def get_comments(request, id, model, app_label):
	result = ""
	counter = 0
	try:
		general = GetContent(model, app_label, id)
	except:
		return json.dumps({'fehler':fehlerliste['1']})

	ratings = Rating.objects.filter(content_type__pk=general.model_type.id, object_id=general.content.id, kommentar__isnull=False)
	user_comment = ""
	try:
		user_comment = Rating.objects.get(content_type__pk=general.model_type.id, object_id=general.content.id, kommentar__isnull=False, user=request.user)
	except:
		pass
	return render(request, 'rating/comments_box.html', {
		'ratings': ratings,
		'user_comment': user_comment,
	})


# Kommentar setzen
@login_required
@dajaxice_register
def set_comment(request, id, model, app_label, comment):
	try:
		general = GetContent(model, app_label, id)
	except:
		return json.dumps({'fehler': fehlerliste['1']})
	# Wenn comment leer ist
	if not comment:
		return json.dumps({'fehler': fehlerliste['4']})
	# Überprüfung, ob eine Bewertung über ein Kommentar schon verfügt.
	try:
		user_comment = Rating.objects.get(content_type__pk=general.model_type.id, object_id=general.content.id, user=request.user)
		user_comment.kommentar = str(comment)
	except:
		user_comment = Rating(content_object=general.content, kommentar=comment, user=request.user)
	user_comment.save()
	ratings = Rating.objects.filter(content_type__pk=general.model_type.id, object_id=general.content.id, kommentar__isnull=False)
	try:
		user_comment = Rating.objects.get(content_type__pk=general.model_type.id, object_id=general.content.id,  kommentar__isnull=False, user=request.user)
	except:
		pass
	# Daten werden in Variablen gespeichert und an Template übergeben
	return render(request, 'rating/comments_box.html', {
		'ratings': ratings,
		'user_comment': user_comment,
	})

# Abfragen von Bewertungen
@login_required
@dajaxice_register
def profile_get_data(request, app_label, model):
	general = GetContent(model, app_label)
	# Überprüfung, ob User ein Administrator ist
	if not request.user.is_superuser:
		user_ratings = Rating.objects.filter(user=request.user, content_type__model=general.model_type)
	else:
		user_ratings = Rating.objects.filter(content_type__model=general.model_type)
	user_ratings = user_ratings.filter(Q(kommentar__isnull=False) | Q(sterne__isnull=False))
	products = general.model_class.objects.all()
	# Daten werden in Variablen gespeichert und an Template übergeben
	return render(request, 'rating/user_profile_items.html', {
		'model_type': general.model_type,
		'products': products,
		'user_ratings': user_ratings,
	})


# Löschen einer Bewertung
@login_required
@dajaxice_register
def profile_remove_rating(request, id):
	try:
		# Überprüfung, ob User ein Administrator ist.
		if not request.user.is_superuser:
			rating = Rating.objects.get(id=id, user=request.user)
		else:
			rating = Rating.objects.get(id=id)
		rating.delete()
	except:
		return json.dumps({'message': "Kein Bewertungsbjekt mit dem ID: " + id})
	return json.dumps({'message': u"Gelöschte Bewertunsobjekt mit dem ID : " + id})


# Bearbeitung einer Bewertung
@login_required
@dajaxice_register
def profile_edit_rating(request, id, comment):
	try:
		# Überprüfung, ob User ein Administrator ist.
		if not request.user.is_superuser:
			rating = Rating.objects.get(id=id, user=request.user)
		else:
			rating = Rating.objects.get(id=id)
		# Wenn Kommentar leer ist
		if not comment:
			rating.kommentar = None
		else:
			rating.kommentar = comment
		# Wenn Bewertung nicht vom eingeloggter User ist, wird der Kommentar nicht gespeichert
		if not rating.user:
			return json.dumps({'fehler': fehlerliste['5']})
		rating.save()
	except:
		return json.dumps({'message': "Kein Bewertungsbjekt mit dem ID: " + id})
	return json.dumps({'message': u"Veränderte Bewertunsobjekt mit dem ID : " + id})

# Abfragen von den Produkten mit einem Like
@login_required
@dajaxice_register
def get_like_list(request, app_label, model):
	general = GetContent(model, app_label)
	user_like_ratings = Rating.objects.filter(user=request.user, content_type__model=general.model_type, likes=True)
	products = general.model_class.objects.all()
	# Daten werden in Variablen gespeichert und an Template übergeben
	return render(request, 'rating/like_list_items.html', {
		'model_type':general.model_type,
		'products':products,
		'user_like_ratings':user_like_ratings,
	})
