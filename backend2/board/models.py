from django.db import models
    
class Board(models.Model):    # 게시판
    title = models.CharField(max_length=50)
    content = models.TextField()

    def __str__(self):
        return self.title


class Post(models.Model):    # 게시글
    title = models.CharField(max_length=200)
    board = models.ForeignKey(Board, on_delete=models.SET_NULL, null=True, blank=True, related_name="posts")
    content = models.TextField()
    user_id = models.IntegerField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


class Comment(models.Model):    # 댓글
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    content = models.TextField()
    user_id = models.IntegerField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.post.title} - {self.user_id}"


class Like(models.Model):    # 좋아요
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes", verbose_name="게시물")
    user_id = models.IntegerField(db_index=True)

    class Meta:
        unique_together = ('post', 'user_id')

    def __str__(self):
        return f"{self.post.title} - {self.user_id}"
    

class PostImage(models.Model):    # 게시글 이미지
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="images")
    image_file = models.ImageField(upload_to="")

    def __str__(self):
        return f"{self.post.title} - {self.image_file.name}"
