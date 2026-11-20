from decimal import Decimal
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from users.models import Role
from products.models import Category, Product
from suppliers.models import Supplier, PurchaseOrder, PurchaseOrderItem
from inventory.models import Location, InventoryItem, StockTransfer, StockTransferItem, StockAdjustment
from orders.models import Customer, Order, OrderItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds StockSmart with coffee shop inventory demo data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--if-needed',
            action='store_true',
            help='Only seed if database has not yet been seeded'
        )
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Clear application records before seeding the coffee shop demo data'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options.get('replace'):
            call_command('flush', interactive=False, verbosity=0)

        if options.get('if_needed'):
            if User.objects.filter(username="admin").exists() and Product.objects.exists():
                self.stdout.write(self.style.SUCCESS("StockSmart database already contains seed data. Ready to launch!"))
                return

        self.stdout.write("Starting StockSmart database seeding...")

        # 1. Roles
        roles_data = [
            (Role.ADMIN, "Superuser with full administrative access"),
            (Role.WAREHOUSE_MANAGER, "Manages warehouse inventory levels and PO receipts"),
            (Role.STORE_ASSOCIATE, "Retail store staff handling sales orders and requests"),
            (Role.INVENTORY_AUDITOR, "Auditor role with stock adjustment and verification rights"),
        ]
        roles_dict = {}
        for name, desc in roles_data:
            role, _ = Role.objects.get_or_create(name=name, defaults={'description': desc})
            roles_dict[name] = role

        # 2. Users
        default_pwd = "StockSmart@2026"
        users_data = [
            ("admin", "admin@stocksmart.in", "Rajesh", "Sharma", "+91 98201 11223", Role.ADMIN, True, True),
            ("warehouse_mgr", "priya.deshmukh@stocksmart.in", "Priya", "Deshmukh", "+91 98202 22334", Role.WAREHOUSE_MANAGER, False, False),
            ("store_associate", "vikram.mehta@stocksmart.in", "Vikram", "Mehta", "+91 98203 55667", Role.STORE_ASSOCIATE, False, False),
            ("auditor_sunil", "sunil.joshi@stocksmart.in", "Sunil", "Joshi", "+91 98205 10203", Role.INVENTORY_AUDITOR, False, False),
        ]
        for uname, email, fname, lname, phone, role_name, is_staff, is_super in users_data:
            if not User.objects.filter(username=uname).exists():
                u = User.objects.create_user(
                    username=uname,
                    email=email,
                    password=default_pwd,
                    first_name=fname,
                    last_name=lname,
                    phone=phone,
                    role=roles_dict[role_name],
                    is_staff=is_staff,
                    is_superuser=is_super
                )
                self.stdout.write(f"Created user: {uname} (password: {default_pwd})")

        admin_user = User.objects.get(username="admin")

        # 3. Categories
        cats_data = [
            ("Coffee Beans", "CAT-BEANS", "Whole bean and ground coffee products", None),
            ("Coffee Drinks", "CAT-DRINKS", "Ready-to-serve coffee and alternative drinks", None),
            ("Syrups & Flavorings", "CAT-SYRUPS", "Drink syrups and flavor additions", None),
            ("Bakery", "CAT-BAKERY", "Baked goods and cafe snacks", None),
            ("Equipment & Drinkware", "CAT-EQUIPMENT", "Coffee preparation equipment and drinkware", None),
        ]
        cat_map = {}
        for name, code, desc, parent_code in cats_data:
            parent = cat_map.get(parent_code) if parent_code else None
            cat, _ = Category.objects.get_or_create(
                code=code,
                defaults={'name': name, 'description': desc, 'parent_category': parent}
            )
            cat_map[code] = cat

        # 4. Suppliers
        suppliers_data = [
            ("Highland Coffee Supply", "Ananya Rao", "orders@highlandcoffee.example", "+91 22 4000 1001", "18 Market Road", "Mumbai", "Maharashtra", "400001", "27AAACH1234F1Z5", 5, Decimal('4.80')),
            ("Origin Bean Traders", "Rohan Mehta", "sales@originbeans.example", "+91 80 4000 2002", "42 Central Avenue", "Bengaluru", "Karnataka", "560001", "29AAACT0012E1ZQ", 7, Decimal('4.70')),
            ("Daily Brew Ingredients", "Mira Shah", "supply@dailybrew.example", "+91 11 4000 3003", "7 Trade Centre", "New Delhi", "Delhi", "110001", "07AAACR1122D1ZV", 4, Decimal('4.60')),
            ("Cafe Goods & Equipment", "Dev Patel", "wholesale@cafegoods.example", "+91 33 4000 4004", "25 Station Road", "Kolkata", "West Bengal", "700001", "19AAACB9988G1ZX", 8, Decimal('4.75')),
        ]
        sup_map = {}
        for sname, contact, email, phone, addr, city, state, pin, gstin, lead, rating in suppliers_data:
            sup, _ = Supplier.objects.get_or_create(
                email=email,
                defaults={
                    'name': sname, 'contact_person': contact, 'phone': phone,
                    'address': addr, 'city': city, 'state': state, 'pincode': pin,
                    'gstin': gstin, 'lead_time_days': lead, 'rating': rating
                }
            )
            sup_map[sname] = sup

        # 5. Locations
        locations_data = [
            ("Central Warehouse Mumbai", "WH-BHIW-01", Location.WAREHOUSE, "Building B-4, Logistic Park", "Bhiwandi", "Maharashtra", "421302", "+91 2522 660100", "Priya Deshmukh"),
            ("North Warehouse Gurugram", "WH-GUR-01", Location.WAREHOUSE, "Shed 12, Pataudi Road Cluster", "Gurugram", "Haryana", "122503", "+91 124 4902000", "Amit Verma"),
            ("South Warehouse Bengaluru", "WH-BLR-01", Location.WAREHOUSE, "EPIP Zone, Phase II", "Bengaluru", "Karnataka", "560066", "+91 80 41235500", "Sneha Rao"),
            ("Mumbai City Store", "STR-MUM-01", Location.STORE, "Hill Road, Bandra West", "Mumbai", "Maharashtra", "400050", "+91 22 26401122", "Vikram Mehta"),
            ("Delhi City Store", "STR-DEL-01", Location.STORE, "Block B Inner Circle CP", "New Delhi", "Delhi", "110001", "+91 11 23415566", "Ananya Gupta"),
            ("Bengaluru City Store", "STR-BLR-01", Location.STORE, "100ft Road Indiranagar", "Bengaluru", "Karnataka", "560038", "+91 80 25219988", "Karthik Iyer"),
        ]
        loc_map = {}
        for lname, lcode, ltype, addr, city, state, pin, phone, mgr in locations_data:
            loc, _ = Location.objects.get_or_create(
                code=lcode,
                defaults={
                    'name': lname, 'location_type': ltype, 'address': addr,
                    'city': city, 'state': state, 'pincode': pin, 'contact_phone': phone,
                    'manager_name': mgr
                }
            )
            loc_map[lcode] = loc

        # 6. Products
        products_data = [
            ("SKU-BEAN-ESP-01", "House Espresso Beans 1kg", "CAT-BEANS", "Highland Coffee Supply", "Medium-dark roasted whole beans for espresso service.", "bag", Decimal('720.00'), Decimal('1150.00'), 30, 10, None, Product.ACTIVE),
            ("SKU-BEAN-ARA-02", "Single-Origin Arabica Beans 500g", "CAT-BEANS", "Origin Bean Traders", "Washed Arabica whole beans with a balanced flavor profile.", "bag", Decimal('410.00'), Decimal('690.00'), 20, 8, None, Product.ACTIVE),
            ("SKU-BEAN-DEC-03", "Decaffeinated Ground Coffee 500g", "CAT-BEANS", "Origin Bean Traders", "Ground decaffeinated coffee for filter and drip preparation.", "bag", Decimal('360.00'), Decimal('620.00'), 15, 6, None, Product.ACTIVE),
            ("SKU-DRINK-OAT-01", "Barista Oat Drink 1L", "CAT-DRINKS", "Daily Brew Ingredients", "Oat-based drink for hot and cold coffee beverages.", "carton", Decimal('120.00'), Decimal('195.00'), 35, 12, None, Product.ACTIVE),
            ("SKU-SYR-CAR-01", "Caramel Syrup 750ml", "CAT-SYRUPS", "Daily Brew Ingredients", "Caramel-flavored syrup for use in cafe beverages.", "bottle", Decimal('190.00'), Decimal('325.00'), 18, 7, None, Product.ACTIVE),
            ("SKU-BAK-BIS-01", "Almond Biscotti 6 Pack", "CAT-BAKERY", "Daily Brew Ingredients", "Six individually wrapped almond biscotti.", "pack", Decimal('145.00'), Decimal('240.00'), 20, 8, None, Product.ACTIVE),
            ("SKU-EQP-MUG-01", "Ceramic Cafe Mug 350ml", "CAT-EQUIPMENT", "Cafe Goods & Equipment", "Reusable ceramic mug with a 350ml capacity.", "piece", Decimal('210.00'), Decimal('390.00'), 12, 5, None, Product.ACTIVE),
            ("SKU-EQP-FLTR-01", "Paper Coffee Filters 100 Pack", "CAT-EQUIPMENT", "Cafe Goods & Equipment", "Unbleached paper filters for pour-over coffee service.", "pack", Decimal('95.00'), Decimal('160.00'), 25, 10, None, Product.ACTIVE),
            ("SKU-EQP-PRESS-01", "French Press 1L", "CAT-EQUIPMENT", "Cafe Goods & Equipment", "Glass coffee press with a stainless-steel filter.", "piece", Decimal('540.00'), Decimal('890.00'), 8, 3, None, Product.ACTIVE),
            ("SKU-DRINK-MATCHA-01", "Matcha Powder 250g", "CAT-DRINKS", "Daily Brew Ingredients", "Fine matcha powder for cafe beverage preparation.", "tin", Decimal('460.00'), Decimal('760.00'), 10, 4, None, Product.ACTIVE),
        ]
        prod_map = {}
        for sku, pname, cat_code, sname, desc, uom, cost, price, reorder, safety, img, status in products_data:
            p, _ = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': pname, 'category': cat_map[cat_code], 'supplier': sup_map.get(sname),
                    'description': desc, 'unit_of_measure': uom, 'cost_price': cost,
                    'selling_price': price, 'reorder_point': reorder, 'safety_stock': safety,
                    'image_url': img, 'status': status
                }
            )
            prod_map[sku] = p

        # 7. Inventory Items (Stock levels across locations)
        stock_configs = [
            (loc_map["WH-BHIW-01"], "SKU-BEAN-ESP-01", 220, 15, "Aisle-A1-S01"),
            (loc_map["WH-BHIW-01"], "SKU-BEAN-ARA-02", 180, 12, "Aisle-A1-S02"),
            (loc_map["WH-BHIW-01"], "SKU-BEAN-DEC-03", 90, 8, "Aisle-A1-S03"),
            (loc_map["WH-BHIW-01"], "SKU-DRINK-OAT-01", 300, 20, "Aisle-B2-S01"),
            (loc_map["WH-BHIW-01"], "SKU-SYR-CAR-01", 75, 5, "Aisle-B2-S02"),
            (loc_map["WH-BHIW-01"], "SKU-BAK-BIS-01", 120, 10, "Aisle-C3-S01"),
            (loc_map["WH-BHIW-01"], "SKU-EQP-MUG-01", 60, 5, "Aisle-D4-S01"),
            (loc_map["WH-BHIW-01"], "SKU-EQP-FLTR-01", 110, 10, "Aisle-D4-S02"),
            (loc_map["WH-BHIW-01"], "SKU-EQP-PRESS-01", 30, 3, "Aisle-E5-S01"),
            (loc_map["WH-BHIW-01"], "SKU-DRINK-MATCHA-01", 40, 4, "Aisle-B2-S03"),
            (loc_map["WH-GUR-01"], "SKU-BEAN-ESP-01", 140, 10, "Aisle-G1-01"),
            (loc_map["WH-GUR-01"], "SKU-BEAN-ARA-02", 100, 8, "Aisle-G1-02"),
            (loc_map["WH-GUR-01"], "SKU-DRINK-OAT-01", 180, 15, "Aisle-G2-01"),
            (loc_map["WH-GUR-01"], "SKU-SYR-CAR-01", 45, 4, "Aisle-G2-02"),
            (loc_map["WH-BLR-01"], "SKU-BEAN-ESP-01", 160, 12, "Rack-W1-01"),
            (loc_map["WH-BLR-01"], "SKU-BAK-BIS-01", 80, 8, "Rack-W2-01"),
            (loc_map["STR-MUM-01"], "SKU-BEAN-ESP-01", 24, 3, "Shelf-A01"),
            (loc_map["STR-MUM-01"], "SKU-BEAN-ARA-02", 18, 3, "Shelf-A02"),
            (loc_map["STR-MUM-01"], "SKU-DRINK-OAT-01", 36, 4, "Chiller-B01"),
            (loc_map["STR-MUM-01"], "SKU-SYR-CAR-01", 8, 2, "Shelf-B02"),
            (loc_map["STR-MUM-01"], "SKU-BAK-BIS-01", 15, 3, "Shelf-C01"),
            (loc_map["STR-DEL-01"], "SKU-BEAN-ESP-01", 20, 3, "Shelf-A01"),
            (loc_map["STR-DEL-01"], "SKU-EQP-MUG-01", 12, 2, "Shelf-D01"),
            (loc_map["STR-DEL-01"], "SKU-EQP-FLTR-01", 20, 3, "Shelf-D02"),
            (loc_map["STR-BLR-01"], "SKU-BEAN-ARA-02", 16, 3, "Shelf-A01"),
            (loc_map["STR-BLR-01"], "SKU-DRINK-MATCHA-01", 7, 2, "Shelf-B01"),
        ]
        for loc, sku, q_on_hand, q_res, aisle in stock_configs:
            InventoryItem.objects.update_or_create(
                location=loc,
                product=prod_map[sku],
                defaults={
                    'quantity_on_hand': q_on_hand,
                    'quantity_reserved': q_res,
                    'aisle_shelf': aisle,
                    'last_stock_take_at': timezone.now()
                }
            )

        # 8. Customers
        customers_data = [
            ("Aarav Singhania", "aarav.singhania@gmail.com", "+91 98200 44332", "Flat 402, Sea Green Apts", "Mumbai", "Maharashtra", "400018"),
            ("Ishaan Sengupta", "ishaan.s@yahoo.com", "+91 98301 55443", "12 Lake Gardens", "Kolkata", "West Bengal", "700045"),
            ("Tanvi Ramanathan", "tanvi.raman@gmail.com", "+91 98402 66554", "B-103 Shanti Niketan", "Chennai", "Tamil Nadu", "600040"),
            ("Aditya Choudhury", "aditya.ch@outlook.com", "+91 98103 77665", "House 54 Golf Links", "New Delhi", "Delhi", "110003"),
            ("Meera Nambiar", "meera.nambiar@hotmail.com", "+91 98454 88776", "42 Palm Meadows", "Bengaluru", "Karnataka", "560066"),
            ("Kabir Aggarwal", "kabir.aggarwal@gmail.com", "+91 98115 99887", "Penthouse 14, DLF Phase 5", "Gurugram", "Haryana", "122002"),
            ("Riya Khandelwal", "riya.k@rediffmail.com", "+91 94140 11229", "7 Civil Lines", "Jaipur", "Rajasthan", "302006"),
        ]
        cust_list = []
        for cname, cemail, cphone, caddr, ccity, cstate, cpin in customers_data:
            c, _ = Customer.objects.get_or_create(
                phone=cphone,
                defaults={'name': cname, 'email': cemail, 'address': caddr, 'city': ccity, 'state': cstate, 'pincode': cpin}
            )
            cust_list.append(c)

        # 9. Orders & Order Items
        orders_data = [
            ("ORD-2026-001", cust_list[0], loc_map["STR-MUM-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-BEAN-ESP-01", 1, Decimal('1150.00')), ("SKU-BAK-BIS-01", 1, Decimal('240.00'))]),
            ("ORD-2026-002", cust_list[3], loc_map["STR-DEL-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_CREDIT, [("SKU-BEAN-ARA-02", 2, Decimal('690.00')), ("SKU-EQP-MUG-01", 1, Decimal('390.00'))]),
            ("ORD-2026-003", cust_list[4], loc_map["STR-BLR-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-DRINK-MATCHA-01", 1, Decimal('760.00'))]),
            ("ORD-2026-004", cust_list[2], loc_map["STR-MUM-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_DEBIT, [("SKU-DRINK-OAT-01", 2, Decimal('195.00')), ("SKU-SYR-CAR-01", 1, Decimal('325.00'))]),
            ("ORD-2026-005", cust_list[5], loc_map["STR-DEL-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_CREDIT, [("SKU-BEAN-ESP-01", 2, Decimal('1150.00')), ("SKU-EQP-FLTR-01", 1, Decimal('160.00'))]),
            ("ORD-2026-006", cust_list[1], loc_map["STR-MUM-01"], Order.SHIPPED, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-BEAN-DEC-03", 1, Decimal('620.00'))]),
            ("ORD-2026-007", cust_list[6], loc_map["STR-BLR-01"], Order.PROCESSING, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-EQP-PRESS-01", 1, Decimal('890.00'))]),
            ("ORD-2026-008", cust_list[0], loc_map["STR-DEL-01"], Order.PENDING, Order.PAYMENT_PENDING, Order.METHOD_UPI, [("SKU-BAK-BIS-01", 2, Decimal('240.00'))]),
        ]
        for onum, cust, loc, status, pay_status, pay_method, items in orders_data:
            ord_obj, created = Order.objects.get_or_create(
                order_number=onum,
                defaults={
                    'customer': cust, 'location': loc, 'status': status,
                    'payment_status': pay_status, 'payment_method': pay_method,
                }
            )
            if created:
                total = Decimal('0.00')
                for p_sku, qty, price in items:
                    sub = Decimal(qty) * price
                    OrderItem.objects.create(
                        order=ord_obj, product=prod_map[p_sku],
                        quantity=qty, unit_price=price, subtotal=sub
                    )
                    total += sub
                ord_obj.total_amount = total
                ord_obj.save(update_fields=['total_amount'])

        call_command('seed_historical_sales')

        # 10. Purchase Orders
        po_data = [
            ("PO-2026-001", sup_map["Highland Coffee Supply"], loc_map["WH-BHIW-01"], PurchaseOrder.RECEIVED, [("SKU-BEAN-ESP-01", 200, Decimal('720.00'))]),
            ("PO-2026-002", sup_map["Origin Bean Traders"], loc_map["WH-BHIW-01"], PurchaseOrder.RECEIVED, [("SKU-BEAN-ARA-02", 150, Decimal('410.00'))]),
            ("PO-2026-003", sup_map["Daily Brew Ingredients"], loc_map["WH-GUR-01"], PurchaseOrder.RECEIVED, [("SKU-DRINK-OAT-01", 200, Decimal('120.00'))]),
            ("PO-2026-004", sup_map["Cafe Goods & Equipment"], loc_map["WH-BLR-01"], PurchaseOrder.ORDERED, [("SKU-EQP-MUG-01", 80, Decimal('210.00'))]),
            ("PO-2026-005", sup_map["Daily Brew Ingredients"], loc_map["WH-BHIW-01"], PurchaseOrder.DRAFT, [("SKU-SYR-CAR-01", 100, Decimal('190.00'))]),
        ]
        for ponum, sup, dest, status, items in po_data:
            po, created = PurchaseOrder.objects.get_or_create(
                po_number=ponum,
                defaults={
                    'supplier': sup, 'destination_location': dest, 'status': status,
                    'created_by': admin_user,
                    'actual_delivery_date': timezone.now() if status == PurchaseOrder.RECEIVED else None
                }
            )
            if created:
                total = Decimal('0.00')
                for p_sku, qty, cost in items:
                    sub = Decimal(qty) * cost
                    PurchaseOrderItem.objects.create(
                        purchase_order=po, product=prod_map[p_sku],
                        quantity_ordered=qty, quantity_received=qty if status == PurchaseOrder.RECEIVED else 0,
                        unit_cost=cost, subtotal=sub
                    )
                    total += sub
                po.total_amount = total
                po.save(update_fields=['total_amount'])

        # 11. Stock Transfers
        trf, created = StockTransfer.objects.get_or_create(
            transfer_number="TRF-2024-001",
            defaults={
                'from_location': loc_map["WH-BHIW-01"],
                'to_location': loc_map["STR-MUM-01"],
                'status': StockTransfer.COMPLETED,
                'initiated_by': admin_user,
                'completed_date': timezone.now(),
                'notes': "Replenishment for Mumbai City Store"
            }
        )
        if created:
            StockTransferItem.objects.create(transfer=trf, product=prod_map["SKU-BEAN-ESP-01"], quantity=20, received_quantity=20)

        # 12. Stock Adjustments
        StockAdjustment.objects.get_or_create(
            adjustment_number="ADJ-2024-001",
            defaults={
                'location': loc_map["WH-BHIW-01"],
                'product': prod_map["SKU-BEAN-ESP-01"],
                'previous_quantity': 222,
                'adjusted_quantity': 220,
                'difference': -2,
                'reason': StockAdjustment.REASON_DAMAGE,
                'adjusted_by': admin_user,
                'notes': "Stock count adjustment after package damage"
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded StockSmart database!"))
