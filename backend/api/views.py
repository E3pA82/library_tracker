# backend/api/views.py
"""
Views pour l'API Library Tracker
"""

from rest_framework import viewsets, generics, status, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum

from .models import Author, Book, UserBook, ReadingGoal, ReadingList
from .serializers import (
    UserSerializer,
    AuthorSerializer,
    BookSerializer,
    UserBookSerializer,
    ReadingGoalSerializer,
    ReadingListSerializer
)


# =============================================================================
# 4.1 AUTHENTIFICATION
# =============================================================================

class RegisterView(generics.CreateAPIView):
    """
    Inscription d'un nouvel utilisateur
    
    POST /api/register/
    Body: { "username": "...", "email": "...", "password": "..." }
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Accessible sans connexion


# =============================================================================
# 4.2 AUTHOR VIEWSET
# =============================================================================

class AuthorViewSet(viewsets.ModelViewSet):
    """
    CRUD pour les auteurs
    
    GET    /api/authors/      → Liste tous les auteurs
    POST   /api/authors/      → Créer un auteur
    GET    /api/authors/{id}/ → Détail d'un auteur
    PUT    /api/authors/{id}/ → Modifier un auteur
    DELETE /api/authors/{id}/ → Supprimer un auteur
    """
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


# =============================================================================
# 4.3 BOOK VIEWSET (Catalogue)
# =============================================================================

class BookViewSet(viewsets.ModelViewSet):
    """
    CRUD pour les livres (catalogue)
    
    GET    /api/books/      → Liste tous les livres
    POST   /api/books/      → Créer un livre
    GET    /api/books/{id}/ → Détail d'un livre
    PUT    /api/books/{id}/ → Modifier un livre
    DELETE /api/books/{id}/ → Supprimer un livre
    """
    queryset = Book.objects.select_related('author').all()
    serializer_class = BookSerializer

    # Filtres et recherche
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['author']        # ?author=1
    search_fields = ['title']            # ?search=titre

# =============================================================================
# 4.4 USERBOOK VIEWSET (Bibliothèque personnelle)
# =============================================================================

class UserBookViewSet(viewsets.ModelViewSet):
    """
    Gestion de la bibliothèque personnelle de l'utilisateur
    
    GET    /api/my-books/      → Liste mes livres
    POST   /api/my-books/      → Ajouter un livre à ma bibliothèque
    GET    /api/my-books/{id}/ → Détail d'un de mes livres
    PUT    /api/my-books/{id}/ → Modifier (commentaire, etc.)
    DELETE /api/my-books/{id}/ → Retirer de ma bibliothèque
    
    Actions personnalisées :
    POST   /api/my-books/{id}/update_progress/ → Mettre à jour les pages lues
    GET    /api/my-books/stats/                → Statistiques de lecture
    """
    serializer_class = UserBookSerializer

    # Filtres et recherche
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']  # ?status=lu
    search_fields = ['book__title', 'book__author__name']  # ?search=mot
    
    def get_queryset(self):
        """Retourne uniquement les livres de l'utilisateur connecté"""
        return UserBook.objects.filter(
            user=self.request.user
        ).select_related('book', 'book__author')
    
    def perform_create(self, serializer):
        """Assigne automatiquement l'utilisateur connecté lors de la création"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """
        Mettre à jour le nombre de pages lues
        
        POST /api/my-books/{id}/update_progress/
        Body: { "pages_read": 150 }
        """
        user_book = self.get_object()
        pages_read = request.data.get('pages_read')
        
        # Validation
        if pages_read is None:
            return Response(
                {"error": "Le champ 'pages_read' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pages_read = int(pages_read)
        except ValueError:
            return Response(
                {"error": "'pages_read' doit être un nombre entier."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if pages_read < 0:
            return Response(
                {"error": "'pages_read' ne peut pas être négatif."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if pages_read > user_book.book.total_pages:
            return Response(
                {"error": f"'pages_read' ne peut pas dépasser {user_book.book.total_pages}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mise à jour
        user_book.pages_read = pages_read
        user_book.save()  # Le save() met à jour automatiquement le statut
        
        return Response(UserBookSerializer(user_book).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Statistiques de lecture de l'utilisateur
        
        GET /api/my-books/stats/
        Retourne: { total, lu, en_cours, non_lu, pages_lues }
        """
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'lu': queryset.filter(status='lu').count(),
            'en_cours': queryset.filter(status='en_cours').count(),
            'non_lu': queryset.filter(status='non_lu').count(),
            'pages_lues': queryset.aggregate(
                total=Sum('pages_read')
            )['total'] or 0
        }
        
        return Response(stats)


# =============================================================================
# 4.5 READING GOAL VIEWSET (Objectifs)
# =============================================================================

class ReadingGoalViewSet(viewsets.ModelViewSet):
    """
    Gestion des objectifs de lecture
    
    GET    /api/goals/      → Liste mes objectifs
    POST   /api/goals/      → Créer un objectif
    GET    /api/goals/{id}/ → Détail d'un objectif
    PUT    /api/goals/{id}/ → Modifier un objectif
    DELETE /api/goals/{id}/ → Supprimer un objectif

    GET    /api/goals/{id}/progress/ → Progression d'un objectif
    """
    serializer_class = ReadingGoalSerializer

    # Filtres
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['period', 'goal_type']  # ?period=monthly&goal_type=pages
    
    def get_queryset(self):
        """Retourne uniquement les objectifs de l'utilisateur connecté"""
        return ReadingGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Assigne automatiquement l'utilisateur connecté"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Retourne la progression pour un objectif donné.

        GET /api/goals/{id}/progress/
        """
        goal = self.get_object()
        data = {
            'id': goal.id,
            'goal_type': goal.goal_type,
            'period': goal.period,
            'target': goal.target,
            'current_value': goal.current_value,
            'progress_percentage': goal.progress_percentage,
            'start_date': goal.start_date,
            'end_date': goal.end_date,
        }
        return Response(data)


# =============================================================================
# 4.6 READING LIST VIEWSET (Listes de lecture)
# =============================================================================

class ReadingListViewSet(viewsets.ModelViewSet):
    """
    Gestion des listes de lecture personnalisées
    
    GET    /api/lists/      → Liste mes listes
    POST   /api/lists/      → Créer une liste
    GET    /api/lists/{id}/ → Détail d'une liste
    PUT    /api/lists/{id}/ → Modifier une liste
    DELETE /api/lists/{id}/ → Supprimer une liste
    
    Actions personnalisées :
    POST   /api/lists/{id}/add_book/    → Ajouter un livre
    POST   /api/lists/{id}/remove_book/ → Retirer un livre
    """
    serializer_class = ReadingListSerializer
    
    def get_queryset(self):
        """Retourne uniquement les listes de l'utilisateur connecté"""
        return ReadingList.objects.filter(
            user=self.request.user
        ).prefetch_related('books', 'books__book', 'books__book__author')
    
    def perform_create(self, serializer):
        """Assigne automatiquement l'utilisateur connecté"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_book(self, request, pk=None):
        """
        Ajouter un livre à la liste
        
        POST /api/lists/{id}/add_book/
        Body: { "book_id": 5 }
        """
        reading_list = self.get_object()
        book_id = request.data.get('book_id')
        
        # Validation
        if book_id is None:
            return Response(
                {"error": "Le champ 'book_id' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que le livre appartient à l'utilisateur
        try:
            user_book = UserBook.objects.get(id=book_id, user=request.user)
        except UserBook.DoesNotExist:
            return Response(
                {"error": "Livre non trouvé dans votre bibliothèque."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si le livre est déjà dans la liste
        if reading_list.books.filter(id=book_id).exists():
            return Response(
                {"error": "Ce livre est déjà dans la liste."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ajouter le livre
        reading_list.books.add(user_book)
        
        return Response({
            "message": f"Livre '{user_book.book.title}' ajouté à la liste '{reading_list.name}'."
        })
    
    @action(detail=True, methods=['post'])
    def remove_book(self, request, pk=None):
        """
        Retirer un livre de la liste
        
        POST /api/lists/{id}/remove_book/
        Body: { "book_id": 5 }
        """
        reading_list = self.get_object()
        book_id = request.data.get('book_id')
        
        # Validation
        if book_id is None:
            return Response(
                {"error": "Le champ 'book_id' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que le livre est dans la liste
        try:
            user_book = reading_list.books.get(id=book_id)
        except UserBook.DoesNotExist:
            return Response(
                {"error": "Ce livre n'est pas dans la liste."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Retirer le livre
        reading_list.books.remove(user_book)
        
        return Response({
            "message": f"Livre '{user_book.book.title}' retiré de la liste '{reading_list.name}'."
        })