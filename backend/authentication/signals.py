from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile._default_manager.get_or_create(user=instance)
    else:
        profile, _ = Profile._default_manager.get_or_create(user=instance)
        profile.save()