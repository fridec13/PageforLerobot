from rest_framework import serializers
from .models import Board, Post, Comment, Like, PostImage

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'post', 'image_file']

class CommentSerializer(serializers.ModelSerializer):
    user_display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user_id', 'user_display_name', 'content', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

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
