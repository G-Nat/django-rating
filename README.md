Django-Rating
=========
---------
Eine 6-Sterne Bewertungsapplikation für Django Apps. Die Bewertung erfolgt durch anonyme und eingeloggte User. Als eingeloggter User hat man noch Möglichkeit Einträge/Produkte zu liken und ein Kommentar hinterlassen.

---------

## Installationanweisungen ##

- Im VirtualEnv installieren: 
```sh
pip install git+git://github.com/G-Nat/django-rating.git
```
- Fügen Sie `'rating',` bei den INSTALLED_APPS in settings.py hinzu.

- Anhand vom Tutorial, installieren Sie django-dajaxice
http://django-dajaxice.readthedocs.org/en/latest/installation.html

- Führen Sie `pythonX.Y manage.py collectstatic` in Ihrer Projektverzeichniss aus.

- Wenn Sie South installiert haben, führen Sie `pythonX.Y manage.py migrate` aus.

- Ohne South: `pythonX.X manage.py syncdb` um Rating App Tabellen zu erstellen.

## Anleitung zur Einbindung des Rating-App ##
Die Rating App benützt *django-sekizai* um Static Files beim Template zu laden.
- Fügen Sie `{% render_block "rating_css" %}` zwischen Head Tags hinzu.

- Fügen `{% render_block "rating_js" %}` unten im Body Bereich vom Ihrem *base.html* hinzu.
- Fügen Sie diesen include Tag in Ihr Template ein: 

```sh
{% include "rating/rating.html" with model="beispiel_model" app_label="beispiel_label" id=object.id %}
```
Vergessen Sie nicht **model** und **app_label** zu definieren.  Sie sind abhängig von Ihrer Applikation, deren Objekte schlussendlich bewertet werden.

## Vorraussetzungen und Abhängigkeiten ##
- django
- git+git://github.com/Wirzi/django-dajaxice.git
- django-ipware
- django-sekizai

## Datenbankvorraussetzungen ##
Keine Vorraussetzungen nötig. Es können alle Datenbanktypen verwendendet werden, welche das Django Framework unterstützt.

## Einstellungsmöglichkeiten ##
Keine. Ausbauvorschläge sind willkommen.

## Verwendete Tools ##
- Bootstrap
- Fontawesome Icons
- django
- git+git://github.com/Wirzi/django-dajaxice.git
- south
- django-ipware
- django-sekizai

## Ausbaumöglichkeiten ##
- Bootstrap unabhängig machen
- Mehrere Kommentare ermöglichen
- Anzahl Sterne definieren
- Einbindungsmäglichkeiten durch Custom Template Tag lösen

## Anbindungsmöglichkeiten ##
Das Rating App kann in jedem Django Projekt verwendet werden. GenericForeignKeys sorgen für die nötige Flexibilität.
