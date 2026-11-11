"""Django REST Framework serializers for the course and review endpoints."""

from rest_framework import serializers


class ReviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    reviewer = serializers.CharField()
    rating = serializers.IntegerField()
    content = serializers.CharField(allow_null=True, allow_blank=True)
    created_at = serializers.DateTimeField(allow_null=True)


class CourseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    location = serializers.CharField()
    rating_avg = serializers.FloatField()
    conditions = serializers.CharField(allow_null=True, allow_blank=True)
    review_count = serializers.IntegerField(required=False)


class CourseDetailSerializer(CourseSerializer):
    reviews = ReviewSerializer(many=True)


class ReviewCreateSerializer(serializers.Serializer):
    """Validates POST /api/courses/<id>/reviews/ input."""

    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        error_messages={
            "required": "rating must be an integer between 1 and 5",
            "invalid": "rating must be an integer between 1 and 5",
            "min_value": "rating must be an integer between 1 and 5",
            "max_value": "rating must be an integer between 1 and 5",
        },
    )
    content = serializers.CharField(required=False, allow_blank=True, default="", max_length=5000)

    def validate_rating(self, value):
        # Reject booleans and floats that IntegerField would silently coerce.
        raw = self.initial_data.get("rating")
        if isinstance(raw, bool) or not isinstance(raw, int):
            raise serializers.ValidationError("rating must be an integer between 1 and 5")
        return value

    def validate_content(self, value):
        return value.strip()
