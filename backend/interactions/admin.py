from django.contrib import admin
from .models import ForumTopic, ForumPost, Notification, Certificate

class ForumPostInline(admin.TabularInline):
    model = ForumPost
    extra = 1

@admin.register(ForumTopic)
class ForumTopicAdmin(admin.ModelAdmin):
    list_display = ('titre', 'cours', 'auteur', 'date_creation')
    list_filter = ('cours',)
    inlines = [ForumPostInline]

@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ('sujet', 'auteur', 'date_creation')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('destinataire', 'titre', 'lu', 'date_creation')
    list_filter = ('lu', 'destinataire')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('apprenant', 'cours', 'code_unique', 'date_emission')
    list_filter = ('cours',)
    readonly_fields = ('code_unique', 'date_emission')