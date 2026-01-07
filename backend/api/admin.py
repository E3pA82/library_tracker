# backend/api/admin.py
from django.contrib import admin
from .models import Author, Book, UserBook, ReadingGoal, ReadingList

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(UserBook)
admin.site.register(ReadingGoal)
admin.site.register(ReadingList)