from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import serializers

from .models import Board, Post, Comment, Like, PostImage
from .serializers import (
    BoardSerializer, PostSerializer, CommentSerializer,
    LikeSerializer, PostImageSerializer
)
from .permissions import IsOwnerOrReadOnly, IsAuthenticatedByExternalJWT, IsPostImageOwner

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticatedByExternalJWT]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedByExternalJWT, IsOwnerOrReadOnly]
    
    def perform_create(self, serializer):
        user_id = self.request.auth  # authentication에서 반환한 user_id
        serializer.save(user_id=user_id)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])  # view_count 필드만 업데이트
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedByExternalJWT])
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
    permission_classes = [IsAuthenticatedByExternalJWT, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        user_id = self.request.auth
        serializer.save(user_id=user_id)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticatedByExternalJWT, IsOwnerOrReadOnly]

    def get_queryset(self):
        """ authenticated user의 좋아요만 반환 """
        user_id = self.request.auth
        if user_id is not None:
            return Like.objects.filter(user_id=user_id)
        return Like.objects.none()

    def perform_create(self, serializer):
        user_id = self.request.auth
        serializer.save(user_id=user_id)

class PostImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer
    permission_classes = [IsAuthenticatedByExternalJWT, IsPostImageOwner]

    def perform_create(self, serializer):
        post_instance = serializer.validated_data.get('post')
        if not post_instance:
            raise serializers.ValidationError({"post": "게시물 정보가 필요합니다."})

        if post_instance.user_id != self.request.auth:
            raise permissions.PermissionDenied("이 게시물에 이미지를 추가할 권한이 없습니다.")
        serializer.save()
