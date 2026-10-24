from django.contrib import admin
from .models import Category, Course, Module, Lesson, Enrollment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('nom', 'slug')
    prepopulated_fields = {'slug': ('nom',)}

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('titre', 'categorie', 'enseignant', 'niveau', 'statut', 'date_creation')
    list_filter = ('statut', 'niveau', 'categorie')
    search_fields = ('titre', 'description')
    prepopulated_fields = {'slug': ('titre',)}
    inlines = [ModuleInline]

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('titre', 'cours', 'ordre')
    list_filter = ('cours',)
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('titre', 'module', 'type_contenu', 'ordre')
    list_filter = ('type_contenu', 'module__cours')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('apprenant', 'cours', 'statut', 'taux_progression', 'date_inscription')
    list_filter = ('statut', 'cours')