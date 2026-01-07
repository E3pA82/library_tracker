# backend/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Author, Book, UserBook, ReadingGoal, ReadingList


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name']


class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(), source='author', write_only=True
    )
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'author_id', 'total_pages']


class UserBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )
    progress = serializers.ReadOnlyField()
    
    class Meta:
        model = UserBook
        fields = ['id', 'book', 'book_id', 'status', 'pages_read', 'comment', 'progress', 'date_added']
        read_only_fields = ['status']


class ReadingGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingGoal
        fields = ['id', 'goal_type', 'period', 'target', 'start_date', 'end_date']


class ReadingListSerializer(serializers.ModelSerializer):
    books = UserBookSerializer(many=True, read_only=True)
    
    class Meta:
        model = ReadingList
        fields = ['id', 'name', 'books', 'created_at']