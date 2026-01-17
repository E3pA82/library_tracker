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
        # On récupère les dates soit dans attrs (création / update),
        # soit sur l'instance (update partielle)
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure ou égale à la date de début."
            })

        # Vérifier que target est positif
        target = attrs.get('target', getattr(self.instance, 'target', None))
        if target is not None and target <= 0:
            raise serializers.ValidationError({
                'target': "L'objectif doit être strictement positif."
            })

        return attrs

class UserBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )
    progress = serializers.ReadOnlyField()

    class Meta:
        model = UserBook
        fields = ['id', 'book', 'book_id', 'status', 'pages_read', 'comment', 'progress', 'date_added']
        read_only_fields = ['status', 'progress', 'date_added']

    def validate(self, attrs):
        """
        - Valider que pages_read <= total_pages
        - Valider l'unicité user + book à un niveau lisible
        """
        # Récupérer l'objet Book concerné
        if self.instance:
            # Mise à jour : le livre est déjà connu
            book = self.instance.book
        else:
            # Création : le livre vient de attrs['book']
            book = attrs.get('book')

        pages_read = attrs.get('pages_read', self.instance.pages_read if self.instance else 0)

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

        return attrs