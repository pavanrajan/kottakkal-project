from django.db import models


class Category(models.Model):
    cat_code = models.CharField(max_length=50, unique=True)
    cat_name = models.CharField(max_length=200)
    cat_description = models.TextField(blank=True)
    cat_image = models.ImageField(upload_to='categories/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['cat_name']

    def __str__(self):
        return f"{self.cat_code} - {self.cat_name}"


class MedicalItem(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('out_of_stock', 'Out of Stock')]

    mcode = models.CharField(max_length=50, unique=True)
    sku_name = models.CharField(max_length=300)
    sku_code = models.CharField(max_length=100, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    catcode = models.CharField(max_length=50, blank=True)

    unit = models.CharField(max_length=100, blank=True)
    unit_prefix = models.CharField(max_length=50, blank=True)
    prefix_qty = models.CharField(max_length=50, blank=True)

    mrp = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sell_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    reorder_level = models.IntegerField(default=0)
    package_count = models.IntegerField(default=1)
    storage_location1 = models.CharField(max_length=200, blank=True)
    storage_location2 = models.CharField(max_length=200, blank=True)

    hsn_code = models.CharField(max_length=50, blank=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    description = models.TextField(blank=True)
    dosage = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)

    img1 = models.ImageField(upload_to='products/', blank=True, null=True)
    img2 = models.ImageField(upload_to='products/', blank=True, null=True)
    img3 = models.ImageField(upload_to='products/', blank=True, null=True)
    img4 = models.ImageField(upload_to='products/', blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sku_name']

    def __str__(self):
        return f"{self.mcode} - {self.sku_name}"

    @property
    def sell_price(self):
        return max(0, float(self.mrp) - float(self.sell_discount))

    @property
    def discount_percent(self):
        if self.mrp > 0:
            return round((float(self.sell_discount) / float(self.mrp)) * 100)
        return 0
