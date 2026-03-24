"""
Run: python manage.py shell < seed_data.py
Creates sample categories, products, and admin user.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kottakkal_project.settings')

import django
django.setup()

from django.contrib.auth.models import User
from apps.catalog.models import Category, MedicalItem

# Admin user
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@kottakkal.com', 'admin123')
    print("Created admin user: admin / admin123")

# Categories
cats = [
    ('KAS', 'Kashayam', 'Herbal decoctions and liquid preparations'),
    ('ARY', 'Arishtam', 'Fermented herbal preparations'),
    ('GHR', 'Ghritham', 'Medicated ghee preparations'),
    ('CHR', 'Choornam', 'Herbal powders'),
    ('GUL', 'Gulika', 'Tablets and pills'),
    ('TAI', 'Thailam', 'Medicated oils'),
    ('LEH', 'Lehyam', 'Herbal jams and confections'),
]

cat_objs = {}
for code, name, desc in cats:
    obj, created = Category.objects.get_or_create(cat_code=code, defaults={'cat_name': name, 'cat_description': desc})
    cat_objs[code] = obj
    if created:
        print(f"  Created category: {code} - {name}")

# Sample products
products = [
    ('KAS001', 'Dasamoolakaduthrayam Kashayam', 'KAS001', 'KAS', '200ml', 'bottle', '1', 135.00, 0, 'Dasamoolakaduthrayam Kashayam is used for the treatment of fever, cough and cold.', 'Take 15-20ml twice daily before food mixed with equal quantity of warm water.'),
    ('KAS002', 'Dhanwantaram Kashayam', 'KAS002', 'KAS', '200ml', 'bottle', '1', 120.00, 0, 'Used for rheumatic conditions and nervous disorders.', 'Take 15ml twice daily mixed with warm water.'),
    ('ARY001', 'Ashokarishta', 'ARY001', 'ARY', '450ml', 'bottle', '1', 160.00, 10, 'Ashokarishta is a classical Ayurvedic formulation used for uterine disorders.', 'Take 15-20ml twice daily after food mixed with equal quantity of water.'),
    ('ARY002', 'Abhayarishtam', 'ARY002', 'ARY', '450ml', 'bottle', '1', 140.00, 5, 'Used for digestive disorders and constipation.', 'Take 15-20ml twice daily after food.'),
    ('GHR001', 'Kalyanakam Ghritham', 'GHR001', 'GHR', '150g', 'bottle', '1', 320.00, 20, 'Used for psychiatric conditions and improving memory and intellect.', 'Take 5-10g once or twice daily on empty stomach.'),
    ('CHR001', 'Triphala Choornam', 'CHR001', 'CHR', '50g', 'packet', '1', 60.00, 0, 'Classical herbal powder for digestive health and detoxification.', 'Take 5g once daily at bedtime with warm water.'),
    ('CHR002', 'Rasnadi Choornam', 'CHR002', 'CHR', '50g', 'packet', '1', 75.00, 5, 'Used externally for headache and sinusitis.', 'Apply gently at the crown of head after bath.'),
    ('GUL001', 'Mahalaxmi Vilas Ras', 'GUL001', 'GUL', '10 Tablets', 'box', '10', 180.00, 15, 'Used for respiratory conditions including asthma and chronic cough.', 'Take 1-2 tablets twice daily with honey or warm water.'),
    ('GUL002', 'Kanchanara Guggulu', 'GUL002', 'GUL', '100 Tablets', 'box', '100', 220.00, 10, 'Used for thyroid conditions and lymphatic disorders.', 'Take 2 tablets twice daily with warm water.'),
    ('TAI001', 'Dhanwantaram Thailam', 'TAI001', 'TAI', '200ml', 'bottle', '1', 290.00, 0, 'Classical medicated oil for vata disorders and rheumatic conditions.', 'Apply and massage gently on affected area. Leave for 30 minutes before bath.'),
    ('TAI002', 'Ksheerabala Thailam', 'TAI002', 'TAI', '200ml', 'bottle', '1', 260.00, 5, 'Used for neurological conditions, paralysis and muscular disorders.', 'Apply externally or use for Nasya as directed by physician.'),
    ('LEH001', 'Chyavanaprasham', 'LEH001', 'LEH', '500g', 'bottle', '1', 350.00, 0, 'Classical Ayurvedic tonic for immunity and respiratory health.', 'Take 1-2 teaspoons twice daily with warm milk.'),
    ('LEH002', 'Indukantham Ghritham', 'LEH002', 'GHR', '150g', 'bottle', '1', 340.00, 15, 'Used for digestive disorders and fever.', 'Take 5-10g once daily on empty stomach.'),
]

for data in products:
    mcode, sku_name, sku_code, catcode, unit, unit_prefix, prefix_qty, mrp, sell_discount, description, dosage = data
    cat = cat_objs.get(catcode)
    obj, created = MedicalItem.objects.get_or_create(mcode=mcode, defaults={
        'sku_name': sku_name, 'sku_code': sku_code, 'catcode': catcode,
        'category': cat, 'unit': unit, 'unit_prefix': unit_prefix, 'prefix_qty': prefix_qty,
        'mrp': mrp, 'sell_discount': sell_discount, 'description': description, 'dosage': dosage,
        'status': 'active',
    })
    if created:
        print(f"  Created item: {mcode} - {sku_name}")

print("\nSeed data complete!")
print("Admin login: admin / admin123")
