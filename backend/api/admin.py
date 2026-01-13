# backend/api/admin.py
from django.contrib import admin
from .models import Author, Book, UserBook, ReadingGoal, ReadingList


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'total_pages']
    list_filter = ['author']
    search_fields = ['title', 'author__name']


@admin.register(UserBook)
class UserBookAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'book', 'status', 'pages_read', 'progress', 'date_added']
    list_filter = ['status', 'user']
    search_fields = ['book__title', 'user__username']
    readonly_fields = ['progress']
    
    def progress(self, obj):
        return f"{obj.progress}%"
    progress.short_description = 'Progression'


@admin.register(ReadingGoal)
class ReadingGoalAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'goal_type', 'period', 'target', 'start_date', 'end_date']
    list_filter = ['goal_type', 'period', 'user']


@admin.register(ReadingList)
class ReadingListAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'created_at']
    list_filter = ['user']
    search_fields = ['name']