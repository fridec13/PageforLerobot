from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Board, Post, Comment, Like, PostImage

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'post', 'image_file']

    def validate_image_file(self, image_file):
        # 1. 파일 크기 검증 (예: 최대 5MB로 제한)
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
        if image_file.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                _(f"이미지 파일 크기는 {MAX_FILE_SIZE // (1024 * 1024)}MB를 초과할 수 없습니다. 현재 파일 크기: {image_file.size / (1024 * 1024):.2f}MB")
            )

        # 2. 파일 형식 (Content Type) 검증
        # 허용할 이미지 MIME 타입 목록 (JPEG, PNG, GIF, WEBP)
        ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if image_file.content_type not in ALLOWED_CONTENT_TYPES:
            allowed_types_str = ", ".join([ct.split('/')[-1].upper() for ct in ALLOWED_CONTENT_TYPES])
            raise serializers.ValidationError(
                _(f"허용되지 않는 이미지 파일 형식입니다. ({image_file.content_type}). 허용되는 형식: {allowed_types_str}")
            )

        return image_file

class CommentSerializer(serializers.ModelSerializer):
    user_display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user_id', 'user_display_name', 'content', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'user_id')

    def get_user_display_name(self, obj):
        return str(obj.user_id)

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField(read_only=True)
    author_display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'board', 'title', 'content', 'user_id', 'author_display_name',
            'created_at', 'updated_at', 'view_count',
            'images',
            'comments',
            'likes_count'
        ]
        read_only_fields = ('created_at', 'updated_at', 'view_count', 'user_id')

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_author_display_name(self, obj):
        return str(obj.user_id)


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
