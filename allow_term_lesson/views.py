from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AllowTermLesson
from .serializers import AllowTermLessonSerializer


class AllowTermLessonViewSet(viewsets.ModelViewSet):
    queryset = AllowTermLesson.objects.all()
    serializer_class = AllowTermLessonSerializer

    @action(detail=True, methods=["patch"], url_path="accept")
    def accept(self, request, pk=None):
        obj = self.get_object()
        obj.is_accepted = True
        obj.save()

        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)