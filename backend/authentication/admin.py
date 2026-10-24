from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, AuditLog

@admin.action(description="Valider la sélection (Autoriser l'accès)")
def valider_utilisateurs(modeladmin, request, queryset):
    queryset.update(est_valide=True)

@admin.action(description="Invalider la sélection (Suspendre / En attente)")
def invalider_utilisateurs(modeladmin, request, queryset):
    queryset.update(est_valide=False)

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profil & Pièces Justificatives'
    fk_name = 'user'
    fields = ('specialite', 'centre_formation', 'diplome', 'cv', 'niveau_etude', 'telephone', 'adresse', 'photo', 'bio')

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'est_valide', 'is_staff')
    list_filter = ('role', 'est_valide', 'is_staff', 'is_active')
    actions = [valider_utilisateurs, invalider_utilisateurs]
    inlines = (ProfileInline,)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Validation & Rôle KAAYNUJÀNG', {'fields': ('role', 'est_valide')}),
    )

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialite', 'centre_formation', 'has_diplome', 'has_cv')
    search_fields = ('user__username', 'user__email', 'specialite', 'centre_formation')

    def has_diplome(self, obj):
        return bool(obj.diplome)
    has_diplome.boolean = True
    has_diplome.short_description = "Diplôme joint"

    def has_cv(self, obj):
        return bool(obj.cv)
    has_cv.boolean = True
    has_cv.short_description = "CV joint"

class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'user', 'action', 'ip_address')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'action', 'ip_address')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(AuditLog, AuditLogAdmin)