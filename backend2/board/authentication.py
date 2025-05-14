import jwt
from rest_framework import authentication, exceptions
from django.conf import settings

class ExternalJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.DecodeError:
            raise exceptions.AuthenticationFailed('Error decoding token')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token contains no user_id')

        # (user, auth) 튜플을 반환합니다. user 객체가 없으므로 None을 사용하고,
        # 인증된 사용자의 식별자(user_id)를 auth로 전달합니다.
        # request.user는 None이 되고, request.auth는 user_id가 됩니다.
        return (None, user_id)
