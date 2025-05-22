from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, LikeViewSet, BoardViewSet, PostImageViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'post-images', PostImageViewSet, basename='postimage')

urlpatterns = [
    path('', include(router.urls)),
]