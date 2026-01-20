# backend/api/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum
from django.db.models.signals import post_save
from django.dispatch import receiver


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

    # NOUVEAU : favoris + note
    is_favorite = models.BooleanField(default=False)
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Note de 1 à 5"
    )
    
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

    @property
    def current_value(self):
        """
        Valeur actuelle de l'objectif.

        - Si goal_type == 'pages' : somme des pages lues sur la période
        - Si goal_type == 'books' : nb de livres 'lu' sur la période

        Ici on approxime "sur la période" avec date_added de UserBook,
        faute d'avoir des dates de lecture détaillées.
        """
        from .models import UserBook  # référence au modèle défini plus haut

        qs = UserBook.objects.filter(
            user=self.user,
            date_added__gte=self.start_date,
            date_added__lte=self.end_date,
        )

        if self.goal_type == self.GoalType.PAGES:
            return qs.aggregate(total=Sum('pages_read'))['total'] or 0
        else:  # BOOKS
            return qs.filter(status=UserBook.Status.LU).count()

    @property
    def progress_percentage(self):
        """
        Pourcentage de progression de l'objectif (0 à 100).
        """
        if self.target > 0:
            return min(100, round((self.current_value / self.target) * 100))
        return 0


class ReadingList(models.Model):
    """Liste de lecture personnalisée"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_lists')
    name = models.CharField(max_length=100)
    books = models.ManyToManyField(UserBook, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
class Profile(models.Model):
    """Profil étendu de l'utilisateur"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    avatar = models.ImageField(          
        upload_to='avatars/',
        null=True,
        blank=True
    )
    bio = models.TextField(
        blank=True,
        help_text="Courte description / biographie"
    )
    favorite_genre = models.CharField(
        max_length=100,
        blank=True,
        help_text="Genre littéraire favori"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profil de {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Créer automatiquement un profil lors de la création d'un utilisateur"""
    if created:
        Profile.objects.create(user=instance)

class ReadingSession(models.Model):
    """Session de lecture (détail par jour)"""
    user_book = models.ForeignKey(
        UserBook,
        on_delete=models.CASCADE,
        related_name='reading_sessions'
    )
    date = models.DateField()
    pages_read = models.PositiveIntegerField(
        verbose_name="Pages lues pendant cette session"
    )
    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Durée (minutes)"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user_book.book.title} - {self.date} - {self.pages_read} pages"

    def save(self, *args, **kwargs):
        """Après chaque save, recalcule le total pages_read sur le UserBook."""
        super().save(*args, **kwargs)
        total = self.user_book.reading_sessions.aggregate(
            total=Sum('pages_read')
        )['total'] or 0
        self.user_book.pages_read = total
        self.user_book.save()

    def delete(self, *args, **kwargs):
        """Après suppression, recalcule le total pages_read sur le UserBook."""
        user_book = self.user_book
        super().delete(*args, **kwargs)
        total = user_book.reading_sessions.aggregate(
            total=Sum('pages_read')
        )['total'] or 0
        user_book.pages_read = total
        user_book.save()