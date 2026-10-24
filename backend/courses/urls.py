from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, CourseViewSet, ModuleViewSet, LessonViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'modules', ModuleViewSet, basename='modules')
router.register(r'lessons', LessonViewSet, basename='lessons')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')

urlpatterns = [
    path('', include(router.urls)),
]