from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Board, Post, Comment, Like, PostImage
from .serializers import (
    BoardSerializer, PostSerializer, CommentSerializer,
    LikeSerializer, PostImageSerializer
)

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user_id = self.request.auth  # authentication에서 반환한 user_id
        serializer.save(user_id=user_id)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_like(self, request, pk=None):
        post = self.get_object()
        user_id = request.auth  # JWT에서 추출
        try:
            like = Like.objects.get(post=post, user_id=user_id)
            like.delete()
            return Response({"status": "unliked"}, status=status.HTTP_200_OK)
        except Like.DoesNotExist:
            Like.objects.create(post=post, user_id=user_id)
            return Response({"status": "liked"}, status=status.HTTP_201_CREATED)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user_id = self.request.auth
        serializer.save(user_id=user_id)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_id = self.request.auth
        serializer.save(user_id=user_id)

class PostImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # PostImage는 post와 image_file만 받으면 됨
        serializer.save()
