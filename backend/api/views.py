# backend/api/views.py
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum
from .models import Author, Book, UserBook, ReadingGoal, ReadingList
from .serializers import (
    UserSerializer, AuthorSerializer, BookSerializer,
    UserBookSerializer, ReadingGoalSerializer, ReadingListSerializer
)


class RegisterView(generics.CreateAPIView):
    """Inscription"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class AuthorViewSet(viewsets.ModelViewSet):
    """CRUD Auteurs"""
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


class BookViewSet(viewsets.ModelViewSet):
    """CRUD Livres"""
    queryset = Book.objects.select_related('author').all()
    serializer_class = BookSerializer


class UserBookViewSet(viewsets.ModelViewSet):
    """Bibliothèque personnelle"""
    serializer_class = UserBookSerializer
    
    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user).select_related('book__author')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Mettre à jour les pages lues"""
        user_book = self.get_object()
        pages = request.data.get('pages_read', 0)
        user_book.pages_read = pages
        user_book.save()
        return Response(UserBookSerializer(user_book).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques de lecture"""
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'lu': qs.filter(status='lu').count(),
            'en_cours': qs.filter(status='en_cours').count(),
            'non_lu': qs.filter(status='non_lu').count(),
            'pages_lues': qs.aggregate(total=Sum('pages_read'))['total'] or 0
        })


class ReadingGoalViewSet(viewsets.ModelViewSet):
    """Objectifs de lecture"""
    serializer_class = ReadingGoalSerializer
    
    def get_queryset(self):
        return ReadingGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingListViewSet(viewsets.ModelViewSet):
    """Listes de lecture"""
    serializer_class = ReadingListSerializer
    
    def get_queryset(self):
        return ReadingList.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_book(self, request, pk=None):
        """Ajouter un livre à la liste"""
        reading_list = self.get_object()
        book_id = request.data.get('book_id')
        try:
            user_book = UserBook.objects.get(id=book_id, user=request.user)
            reading_list.books.add(user_book)
            return Response({'message': 'Livre ajouté'})
        except UserBook.DoesNotExist:
            return Response({'error': 'Livre non trouvé'}, status=404)