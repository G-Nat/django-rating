import os
from setuptools import setup
from setuptools import find_packages

os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
	name='django-rating',
    version='1.0',
    author=u'Natalia Gerasimenko',
    author_email='natalia.gerasimenko@helmag.ch',
    url='https://github.com/G-Nat/django-rating',
    long_description=open('README.md').read(),
    zip_safe=False,
    include_package_data=True,
    packages=find_packages(),
    install_requires=[
        "django==1.6.2",
        "git+git://github.com/Wirzi/django-dajaxice.git",
        "django-ipware",
        "django-sekizai",
    ],
)
