from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Category, MedicalItem
from .serializers import CategorySerializer, MedicalItemSerializer, CategoryWithItemsSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @action(detail=False, methods=['get'], url_path='catcodes')
    def catcodes(self, request):
        cats = Category.objects.values('cat_code', 'cat_name')
        return Response(list(cats))

    @action(detail=False, methods=['get'], url_path='with-medicalitems')
    def with_medicalitems(self, request):
        cats = Category.objects.prefetch_related('items')
        serializer = CategoryWithItemsSerializer(cats, many=True, context={'request': request})
        return Response(serializer.data)


class MedicalItemViewSet(viewsets.ModelViewSet):
    queryset = MedicalItem.objects.filter(status='active')
    serializer_class = MedicalItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = MedicalItem.objects.all()
        catcode = self.request.query_params.get('catcode')
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status', 'active')
        if status:
            qs = qs.filter(status=status)
        if catcode and catcode != 'All':
            qs = qs.filter(catcode=catcode)
        if search:
            qs = qs.filter(sku_name__icontains=search)
        return qs
