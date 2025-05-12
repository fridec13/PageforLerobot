import jwt
from rest_framework import authentication, exceptions
from django.conf import settings

class ExternalJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None  # 인증 정보가 없으면 인증하지 않음

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('No user_id in token')

        # user 객체 대신 user_id만 반환 (user, auth)
        return (None, user_id)
