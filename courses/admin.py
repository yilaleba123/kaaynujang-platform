from django.contrib import admin

from .models import Category, Course, Document, Lesson, Module


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ["titre", "ordre", "video_url"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["nom", "created_at"]
    search_fields = ["nom"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["titre", "categorie", "instructeur", "is_published", "created_at"]
    list_filter = ["is_published", "categorie"]
    search_fields = ["titre", "description"]
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ["titre", "cours", "ordre"]
    list_filter = ["cours"]
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["titre", "module", "ordre"]
    list_filter = ["module__cours"]
    search_fields = ["titre"]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["titre", "cours", "lecon", "fichier"]
