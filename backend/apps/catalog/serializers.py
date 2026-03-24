from rest_framework import serializers
from .models import Category, MedicalItem


class CategorySerializer(serializers.ModelSerializer):
    cat_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'cat_code', 'cat_name', 'cat_description', 'cat_image', 'cat_image_url']

    def get_cat_image_url(self, obj):
        request = self.context.get('request')
        if obj.cat_image and request:
            return request.build_absolute_uri(obj.cat_image.url)
        return None


class MedicalItemSerializer(serializers.ModelSerializer):
    img1_url = serializers.SerializerMethodField()
    img2_url = serializers.SerializerMethodField()
    img3_url = serializers.SerializerMethodField()
    img4_url = serializers.SerializerMethodField()
    sell_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalItem
        fields = [
            'id', 'mcode', 'sku_name', 'sku_code', 'catcode',
            'unit', 'unit_prefix', 'prefix_qty',
            'mrp', 'sell_discount', 'base_price', 'sell_price', 'discount_percent',
            'reorder_level', 'package_count',
            'storage_location1', 'storage_location2',
            'hsn_code', 'gst',
            'description', 'dosage', 'ingredients',
            'img1', 'img2', 'img3', 'img4',
            'img1_url', 'img2_url', 'img3_url', 'img4_url',
            'status', 'category', 'category_name',
            'created_at', 'updated_at',
        ]

    def get_img1_url(self, obj):
        request = self.context.get('request')
        if obj.img1 and request:
            return request.build_absolute_uri(obj.img1.url)
        return None

    def get_img2_url(self, obj):
        request = self.context.get('request')
        if obj.img2 and request:
            return request.build_absolute_uri(obj.img2.url)
        return None

    def get_img3_url(self, obj):
        request = self.context.get('request')
        if obj.img3 and request:
            return request.build_absolute_uri(obj.img3.url)
        return None

    def get_img4_url(self, obj):
        request = self.context.get('request')
        if obj.img4 and request:
            return request.build_absolute_uri(obj.img4.url)
        return None

    def get_category_name(self, obj):
        return obj.category.cat_name if obj.category else ''


class CategoryWithItemsSerializer(serializers.ModelSerializer):
    items = MedicalItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'cat_code', 'cat_name', 'cat_description', 'cat_image', 'items']
