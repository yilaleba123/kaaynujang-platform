from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle ADMIN."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsEnseignant(permissions.BasePermission):
    """Autorise uniquement les enseignants validés par l'admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ENSEIGNANT' and 
            request.user.est_valide
        )

class IsApprenant(permissions.BasePermission):
    """Autorise uniquement les apprenants validés par l'admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'APPRENANT' and 
            request.user.est_valide
        )

class IsAccountValidated(permissions.BasePermission):
    """Exige que le compte de l'utilisateur soit validé par l'administrateur."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.est_valide)