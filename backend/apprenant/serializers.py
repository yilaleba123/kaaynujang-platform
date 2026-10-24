from rest_framework import serializers


class LearnerProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True, allow_blank=True)
    last_name = serializers.CharField(read_only=True, allow_blank=True)
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
