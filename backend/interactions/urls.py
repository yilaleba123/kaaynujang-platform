from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumTopicViewSet, ForumPostViewSet, NotificationViewSet, CertificateViewSet

router = DefaultRouter()
router.register(r'forum/topics', ForumTopicViewSet, basename='forum-topics')
router.register(r'forum/posts', ForumPostViewSet, basename='forum-posts')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'certificates', CertificateViewSet, basename='certificates')

urlpatterns = [
    path('', include(router.urls)),
]