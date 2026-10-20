from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    CourseViewSet,
    DocumentViewSet,
    LessonViewSet,
    ModuleViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("courses", CourseViewSet, basename="course")
router.register("modules", ModuleViewSet, basename="module")
router.register("lessons", LessonViewSet, basename="lesson")
router.register("documents", DocumentViewSet, basename="document")

urlpatterns = [
    path("", include(router.urls)),
]
