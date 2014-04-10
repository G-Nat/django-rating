# -*- coding: utf-8 -*-
import json

from dajaxice.decorators import dajaxice_register
from django.contrib.contenttypes.models import ContentType
from ipware.ip import get_ip
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from models import Eintrage as Rating, UserIP

from django.conf import settings


###Liste der möglichen Ausnahmen####
fehlerliste = {
	"1": "Fehler bei GetContent: App_label, Model oder Object ID stimmen nicht!",
	"2": "Du willst zu hoch hinaus!",
	"3": "Produkt nicht vorhanden!",
	"4": "Bitte ein Kommentar abgeben!",
	"5": "Anonyme User können keine Kommentare haben!",
	"6": "Fehler2",


}




### GENERAL ###

class GetContent(object):
	# Hier werden die Daten gespeichert, die bei Init rausgefunden werden
	# Name der App und des Models
	content_type = ""
	# ID des bewerteten Objektes
	content = ""
	# Das ganzes Model des bewerteten Objektes
	model_type = ""

	model_class=""


	# The class "constructor" - It's actually an initializer
	# self ist für automatische Zuweisung zuständig --> general = GetContent(id, model, app_label)
	def __init__(self, model, app_label, id=0):
		# NAME VOM MODEL
		self.content_type = ContentType.objects.get(app_label=app_label, model=model)
		print(self.content_type )

		# Python Model Class
		self.model_class = self.content_type.model_class()
		print(self.model_class )

		# Das ganze Model wird geholt.
		self.model_type = ContentType.objects.get_for_model(self.model_class)
		print(self.model_type )

		if id:
			# Inhalt vom Objekt = ganzes Row
			self.content = self.content_type.get_object_for_this_type(id=id)
			print(self.content )

		# # Das ganze Model wird geholt.
		# self.model_type = ContentType.objects.get_for_model(self.content)
		# print(self.model_type )


#### STARS ####


@dajaxice_register
# ID, Model und App_label des bewerteten Objekt werden vom Template abgefangen
def get_rating(request, id, model, app_label):
	result = ""
	counter = 0
	# GetContent wird aufgerufen und geholte Daten(id, model, app_label) in general Variable gespeichert.
	# try:
	general = GetContent(model, app_label, id)
	# except:
	# 	return json.dumps({'fehler':fehlerliste['1']})
	# Django Filter = SQL SELECT ... WHERE content_type__pk =
	ratings = Rating.objects.filter(content_type__pk=general.model_type.id,object_id=general.content.id,sterne__isnull=False)
	# Wenn ratings nicht null ist
	if ratings:
		# für jede Eintrag in ratings = loop
		for rating in ratings:
			# wenn counter null ist
			if counter == 0:
				# wird ein sterne value in result gespeichert
				result = int(rating.sterne)
			# wenn counter nicht 0 ist
			else:
				# wird vorhandene result mit dem result vom nächsten Eintrag multipliziert
				result = int(rating.sterne)+result
			# Counter wird um 1 grösser bei jedem Loop
			counter = counter+1
		# Durchschnitt wird berechnet
		result = result/counter
	# übergabe von resultaen an Template
	return json.dumps({'sterne':result,"menge":counter})


@dajaxice_register
def get_rating_list(request, ids, model, app_label):
	# Assozitives Array
	results = {}
	mengen = {}
	content_type = ContentType.objects.get(app_label=app_label, model=model)
	for id in ids:
		result = 0
		counter = 0
		content = content_type.get_object_for_this_type(id=id)
		model_type = ContentType.objects.get_for_model(content)
		ratings = Rating.objects.filter(content_type__pk=model_type.id,object_id=content.id,sterne__isnull=False)
		if ratings:
			for rating in ratings:
				if rating.sterne:
					if counter == 0:
						result = int(rating.sterne)
					else:
						result = int(rating.sterne)+result
				counter = counter+1
			if result and counter:
				result = result/counter
			results[id] = result
			mengen[id] = ratings.count()
	return json.dumps({'results':results,"mengen":mengen})


@dajaxice_register
def set_rating(request, id, model, app_label, sterne):
	ip_object = ""
	general = GetContent(model, app_label, id)
	if int(sterne)>5:
		return json.dumps({'fehler':fehlerliste['1']})
	try:
		content = general.content_type.get_object_for_this_type(id=id)
	except:
		return json.dumps({'fehler':fehlerliste['3']})

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
			rating = Rating.objects.get(content_type__pk=general.model_type.id,object_id=general.content.id, ip=ip_object)
		# Sonst die Bewertungen mit dem ID vom eingeloggten User.
		else:
			rating = Rating.objects.get(content_type__pk=general.model_type.id,object_id=general.content.id, user=request.user)
		# Die Sterne werden neu abgespeichert.
		rating.sterne = int(sterne)
	except:
		if ip_object:
			rating = Rating(content_object=content, sterne=sterne, ip=ip_object)
		else:
			rating = Rating(content_object=content, sterne=sterne, user=request.user)
	rating.save()
	menge = Rating.objects.filter(content_type__pk=general.model_type.id, object_id=content.id,sterne__isnull=False).count()
	return json.dumps({'message':sterne,'menge':menge})




######################## LIKES ########################


@login_required
@dajaxice_register
def get_like(request, id, model, app_label):
	general = GetContent(model, app_label, id)

	status = False
	try:
		rating = Rating.objects.get(content_type__pk=general.model_type.id,object_id=general.content.id, user=request.user)
		if rating.likes:
			status = True
	except:
		pass
	return json.dumps({'like':status})


@login_required
@dajaxice_register
def set_like(request, id, model, app_label):
	content_type = ContentType.objects.get(app_label=app_label, model=model)
	try:
		content = content_type.get_object_for_this_type(id=id)
	except:
		return json.dumps({'message':"Produkt nicht vorhanden!"})
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
	return json.dumps({'like':rating.likes})




######################## COMMENTS ########################

@login_required
@dajaxice_register
def get_comments(request, id, model, app_label):
	result = ""
	counter = 0
	# try:
	general = GetContent(model, app_label, id)
	# except:
	# 	return json.dumps({'fehler':fehlerliste['1']})

	ratings = Rating.objects.filter(content_type__pk=general.model_type.id,object_id=general.content.id, kommentar__isnull=False)
	user_comment = ""
	try:
		user_comment = Rating.objects.get(content_type__pk=general.model_type.id,object_id=general.content.id, kommentar__isnull=False, user=request.user)
	except:
		pass
	return render(request, 'rating/comments_box.html', {
		'ratings':ratings,
		'user_comment':user_comment,
	})

@login_required
@dajaxice_register
def set_comment(request, id, model, app_label, comment):
	try:
		general = GetContent(model, app_label, id)
	except:
		return json.dumps({'fehler':fehlerliste['1']})

	if not comment:
		return json.dumps({'fehler':fehlerliste['4']})

	try:
		user_comment = Rating.objects.get(content_type__pk=general.model_type.id,object_id=general.content.id, user=request.user)
		user_comment.kommentar=str(comment)
	except:
		user_comment = Rating(content_object=general.content, kommentar=comment, user=request.user)
	user_comment.save()
	ratings = Rating.objects.filter(content_type__pk=general.model_type.id,object_id=general.content.id, kommentar__isnull=False)
	try:
		user_comment = Rating.objects.get(content_type__pk=general.model_type.id,object_id=general.content.id, kommentar__isnull=False, user=request.user)
	except:
		pass

	return render(request, 'rating/comments_box.html', {
		'ratings':ratings,
		'user_comment':user_comment,
	})


from django.db.models import Q


@login_required
@dajaxice_register
def profile_get_data(request, app_label, model):
	general = GetContent(model, app_label)
	if not request.user.is_superuser:
		user_ratings = Rating.objects.filter(user=request.user, content_type__model=general.model_type)
	else:
		user_ratings = Rating.objects.filter(content_type__model=general.model_type)
	user_ratings = user_ratings.filter(Q(kommentar__isnull=False) | Q(sterne__isnull=False))
	products = general.model_class.objects.all()

	return render(request, 'rating/user_profile_items.html', {
		'model_type':general.model_type,
		'products':products,
		'user_ratings':user_ratings,
	})

# Löschen einer Bewertung
@login_required
@dajaxice_register
def profile_remove_rating(request, id):
	try:
		if not request.user.is_superuser:
			rating = Rating.objects.get(id=id, user=request.user)
		else:
			rating = Rating.objects.get(id=id)
		rating.delete()
	except:
		return json.dumps({'message':"No rating object with id: "+id})
	return json.dumps({'message':"Deleted rating-object with id: "+id})

# Bearbeitung einer Bewertung
@login_required
@dajaxice_register
def profile_edit_rating(request, id, comment):
	try:
		if not request.user.is_superuser:
			rating = Rating.objects.get(id=id, user=request.user)
		else:
			rating = Rating.objects.get(id=id)
		if not comment:
			rating.kommentar = None
		else:
			rating.kommentar = comment
		if not rating.user:
			return json.dumps({'fehler':fehlerliste['5']})
		rating.save()
	except:
		return json.dumps({'message':"No rating object with id: "+id})
	return json.dumps({'message':"Edited rating object with id: "+id})


@login_required
@dajaxice_register
def get_like_list(request, app_label, model):
	general = GetContent(model, app_label)
	user_like_ratings = Rating.objects.filter(user=request.user, content_type__model=general.model_type, likes=True)
	products = general.model_class.objects.all()

	return render(request, 'rating/like_list_items.html', {
		'model_type':general.model_type,
		'products':products,
		'user_like_ratings':user_like_ratings,
	})