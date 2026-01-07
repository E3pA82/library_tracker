# backend/api/models.py
from django.db import models
from django.contrib.auth.models import User


class Author(models.Model):
    """Auteur"""
    name = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name


class Book(models.Model):
    """Livre (catalogue)"""
    title = models.CharField(max_length=255)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    total_pages = models.PositiveIntegerField()
    
    def __str__(self):
        return self.title


class UserBook(models.Model):
    """Livre dans la bibliothèque de l'utilisateur"""
    
    class Status(models.TextChoices):
        NON_LU = 'non_lu', 'Non lu'
        EN_COURS = 'en_cours', 'En cours'
        LU = 'lu', 'Lu'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NON_LU)
    pages_read = models.PositiveIntegerField(default=0)
    comment = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'book']
    
    def save(self, *args, **kwargs):
        # Mise à jour automatique du statut
        if self.pages_read >= self.book.total_pages:
            self.status = self.Status.LU
            self.pages_read = self.book.total_pages
        elif self.pages_read > 0:
            self.status = self.Status.EN_COURS
        super().save(*args, **kwargs)
    
    @property
    def progress(self):
        if self.book.total_pages > 0:
            return round((self.pages_read / self.book.total_pages) * 100)
        return 0


class ReadingGoal(models.Model):
    """Objectif de lecture"""
    
    class Period(models.TextChoices):
        DAILY = 'daily', 'Jour'
        WEEKLY = 'weekly', 'Semaine'
        MONTHLY = 'monthly', 'Mois'
        YEARLY = 'yearly', 'Année'
    
    class GoalType(models.TextChoices):
        PAGES = 'pages', 'Pages'
        BOOKS = 'books', 'Livres'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    goal_type = models.CharField(max_length=10, choices=GoalType.choices)
    period = models.CharField(max_length=10, choices=Period.choices)
    target = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    
    def __str__(self):
        return f"{self.user.username} - {self.target} {self.goal_type}/{self.period}"


class ReadingList(models.Model):
    """Liste de lecture personnalisée"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_lists')
    name = models.CharField(max_length=100)
    books = models.ManyToManyField(UserBook, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"