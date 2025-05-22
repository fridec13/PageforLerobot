from rest_framework import permissions

class IsAuthenticatedByExternalJWT(permissions.BasePermission):
    """
    Custom permission to check if request.auth (user_id from JWT) exists.
    """
    def has_permission(self, request, view):
        return request.auth is not None

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the object has a 'user_id' attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        # request.auth should hold the user_id from the JWT
        return obj.user_id == request.auth 

class IsPostImageOwner(permissions.BasePermission):
    """
    Custom permission to only allow the owner of the related post to modify the post image.
    Assumes the PostImage object has a 'post' attribute, which in turn has a 'user_id'.
    """
    def has_object_permission(self, request, view, obj): # obj is PostImage instance
        # SAFE_METHODS (GET, HEAD, OPTIONS)는 인증된 사용자라면 누구나 접근 가능하도록
        # IsAuthenticatedByExternalJWT 에서 이미 처리했다고 가정하고, 여기서는 True를 반환하거나
        # 혹은 이미지 자체에 대한 더 세부적인 읽기 권한이 필요하다면 여기서 구현합니다.
        # 여기서는 우선 수정/삭제 권한에 집중합니다.
        if request.method in permissions.SAFE_METHODS:
            # 만약 이미지 상세 조회도 게시물 소유자만 가능하게 하려면 아래 주석 해제
            # return obj.post.user_id == request.auth
            return True

        # Write permissions are only allowed to the owner of the post to which the image belongs.
        return obj.post.user_id == request.auth 