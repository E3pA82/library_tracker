# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, AuthorViewSet, BookViewSet,
    UserBookViewSet, ReadingGoalViewSet, ReadingListViewSet
)

router = DefaultRouter()
router.register('authors', AuthorViewSet)
router.register('books', BookViewSet)
router.register('my-books', UserBookViewSet, basename='userbook')
router.register('goals', ReadingGoalViewSet, basename='goal')
router.register('lists', ReadingListViewSet, basename='list')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]