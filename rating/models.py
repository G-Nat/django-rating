# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes import generic
from djangocms_text_ckeditor.fields import HTMLField
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.models import ContentType


# User IP Model
class UserIP(models.Model):
	ip = models.IPAddressField(unique=True)

	def __unicode__(self):
		return self.ip

	class Meta:
		verbose_name = _('IP Adresse')
		verbose_name_plural = _('IP Adressen')


# Bewertungs Model
class Eintrage(models.Model):
	content_type = models.ForeignKey(ContentType)
	object_id = models.PositiveIntegerField()
	content_object = generic.GenericForeignKey('content_type', 'object_id')

	user = models.ForeignKey(User, blank=True, null=True)
	ip = models.ForeignKey("UserIP", blank=True, null=True)
	kommentar = HTMLField('Kommentar', blank=True, null=True)
	sterne = models.IntegerField(blank=True, null=True)
	likes = models.BooleanField(default=False)
	# Name für Backendansicht
	class Meta:
		verbose_name = _('Bewertung')
		verbose_name_plural = _('Bewertungen')