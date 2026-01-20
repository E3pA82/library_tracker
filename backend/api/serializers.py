# backend/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Author, Book, UserBook,
    ReadingGoal, ReadingList,
    Profile, ReadingSession
)

# =========================
# Utilisateur
# =========================

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# =========================
# Auteur & Livre
# =========================

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


# =========================
# UserBook (Bibliothèque perso)
# =========================

class UserBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )
    progress = serializers.ReadOnlyField()

    class Meta:
        model = UserBook
        fields = [
            'id',
            'book',
            'book_id',
            'status',
            'pages_read',
            'comment',
            'progress',
            'date_added',
            'is_favorite',     # Favori
            'rating',          # Note 1-5
        ]
        read_only_fields = ['status', 'progress', 'date_added']

    def validate(self, attrs):
        """
        - Valider que pages_read <= total_pages
        - Valider l'unicité user + book à un niveau lisible
        - Valider rating entre 1 et 5 si présent
        """
        # Récupérer le Book concerné
        if self.instance:
            book = self.instance.book
        else:
            book = attrs.get('book')

        pages_read = attrs.get('pages_read', self.instance.pages_read if self.instance else 0)
        rating = attrs.get('rating', self.instance.rating if self.instance else None)

        # 1) Valider pages_read <= total_pages
        if book and pages_read is not None:
            if pages_read < 0:
                raise serializers.ValidationError({
                    'pages_read': "Le nombre de pages lues ne peut pas être négatif."
                })
            if pages_read > book.total_pages:
                raise serializers.ValidationError({
                    'pages_read': f"Le nombre de pages lues ne peut pas dépasser {book.total_pages}."
                })

        # 2) Valider l'unicité user + book à la création
        if not self.instance and book is not None:
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                user = request.user
                if UserBook.objects.filter(user=user, book=book).exists():
                    raise serializers.ValidationError({
                        'book_id': "Ce livre est déjà dans votre bibliothèque."
                    })

        # 3) Valider rating entre 1 et 5
        if rating is not None:
            if rating < 1 or rating > 5:
                raise serializers.ValidationError({
                    'rating': "La note doit être comprise entre 1 et 5."
                })

        return attrs


# =========================
# Objectifs de lecture
# =========================

class ReadingGoalSerializer(serializers.ModelSerializer):
    current_value = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = ReadingGoal
        fields = [
            'id',
            'goal_type',
            'period',
            'target',
            'start_date',
            'end_date',
            'current_value',
            'progress_percentage',
        ]

    def validate(self, attrs):
        # start_date / end_date cohérentes
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure ou égale à la date de début."
            })

        # target > 0
        target = attrs.get('target', getattr(self.instance, 'target', None))
        if target is not None and target <= 0:
            raise serializers.ValidationError({
                'target': "L'objectif doit être strictement positif."
            })

        return attrs


# =========================
# Listes de lecture
# =========================

class ReadingListSerializer(serializers.ModelSerializer):
    books = UserBookSerializer(many=True, read_only=True)
    
    class Meta:
        model = ReadingList
        fields = ['id', 'name', 'books', 'created_at']


# =========================
# Profil utilisateur
# =========================

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar', 'bio', 'favorite_genre']


# =========================
# Sessions de lecture
# =========================

class ReadingSessionSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(
        source='user_book.book.title',
        read_only=True
    )

    class Meta:
        model = ReadingSession
        fields = [
            'id',
            'user_book',
            'book_title',
            'date',
            'pages_read',
            'duration_minutes',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'book_title']

    def validate(self, attrs):
        request = self.context.get('request')
        user_book = attrs.get('user_book') or (self.instance.user_book if self.instance else None)
        pages_read = attrs.get('pages_read', self.instance.pages_read if self.instance else None)

        if user_book and request:
            if user_book.user != request.user:
                raise serializers.ValidationError(
                    "Vous ne pouvez ajouter des sessions que pour vos propres livres."
                )

        if pages_read is not None and pages_read <= 0:
            raise serializers.ValidationError({
                'pages_read': "Le nombre de pages doit être supérieur à 0."
            })

        return attrs