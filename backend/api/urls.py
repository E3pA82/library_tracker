# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    RegisterView, AuthorViewSet, BookViewSet,
    UserBookViewSet, ReadingGoalViewSet, ReadingListViewSet,
    ProfileView, ReadingSessionViewSet
)

router = DefaultRouter()
router.register('authors', AuthorViewSet)
router.register('books', BookViewSet)
router.register('my-books', UserBookViewSet, basename='userbook')
router.register('goals', ReadingGoalViewSet, basename='goal')
router.register('lists', ReadingListViewSet, basename='list')
router.register('reading-sessions', ReadingSessionViewSet, basename='reading-session')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)