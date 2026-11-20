import calendar
from datetime import datetime, time
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from inventory.models import Location
from orders.models import Customer, Order, OrderItem
from products.models import Product


class Command(BaseCommand):
    help = 'Add idempotent demo sales across the last ten calendar months'

    sales_patterns = (
        (('SKU-BEAN-ESP-01', 1), ('SKU-BAK-BIS-01', 2)),
        (('SKU-BEAN-ARA-02', 2), ('SKU-DRINK-OAT-01', 1)),
        (('SKU-DRINK-MATCHA-01', 1), ('SKU-SYR-CAR-01', 1)),
        (('SKU-BEAN-DEC-03', 1), ('SKU-EQP-FLTR-01', 1)),
        (('SKU-EQP-PRESS-01', 1), ('SKU-BEAN-ESP-01', 1)),
    )
    location_codes = ('STR-MUM-01', 'STR-DEL-01', 'STR-BLR-01')
    payment_methods = (Order.METHOD_UPI, Order.METHOD_CREDIT, Order.METHOD_DEBIT)

    @transaction.atomic
    def handle(self, *args, **options):
        skus = {sku for pattern in self.sales_patterns for sku, _ in pattern}
        products = {p.sku: p for p in Product.objects.filter(sku__in=skus)}
        customers = list(Customer.objects.order_by('id'))
        locations = {
            location.code: location
            for location in Location.objects.filter(code__in=self.location_codes)
        }

        missing_skus = skus - products.keys()
        missing_locations = set(self.location_codes) - locations.keys()
        if missing_skus or missing_locations or not customers:
            missing = []
            if missing_skus:
                missing.append(f'products: {", ".join(sorted(missing_skus))}')
            if missing_locations:
                missing.append(f'locations: {", ".join(sorted(missing_locations))}')
            if not customers:
                missing.append('customers')
            raise CommandError(f'Missing required seed data ({"; ".join(missing)}). Run seed_data first.')

        today = timezone.localdate()
        timezone_info = timezone.get_current_timezone()
        records_created = 0

        for months_ago in range(9, -1, -1):
            month_index = today.year * 12 + today.month - 1 - months_ago
            year, zero_based_month = divmod(month_index, 12)
            month = zero_based_month + 1

            for sequence, day in enumerate((8, 20), start=1):
                order_day = min(day, calendar.monthrange(year, month)[1])
                if year == today.year and month == today.month:
                    order_day = min(order_day, today.day)
                order_date = timezone.make_aware(
                    datetime.combine(datetime(year, month, order_day), time(hour=12)),
                    timezone_info,
                )
                order_number = f'DEMO-{year}{month:02d}-{sequence:02d}'
                customer = customers[(months_ago + sequence - 1) % len(customers)]
                location = locations[self.location_codes[(months_ago + sequence - 1) % len(self.location_codes)]]
                pattern = self.sales_patterns[(months_ago + sequence - 1) % len(self.sales_patterns)]

                order, created = Order.objects.get_or_create(
                    order_number=order_number,
                    defaults={
                        'customer': customer,
                        'location': location,
                        'status': Order.DELIVERED,
                        'payment_status': Order.PAYMENT_PAID,
                        'payment_method': self.payment_methods[(months_ago + sequence - 1) % len(self.payment_methods)],
                    },
                )
                if created:
                    total = Decimal('0.00')
                    for sku, quantity in pattern:
                        product = products[sku]
                        subtotal = product.selling_price * quantity
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            unit_price=product.selling_price,
                            subtotal=subtotal,
                        )
                        total += subtotal
                    order.total_amount = total
                    order.save(update_fields=['total_amount'])
                    records_created += 1

                Order.objects.filter(pk=order.pk).update(order_date=order_date)

        self.stdout.write(self.style.SUCCESS(
            f'Historical sales are ready for {today:%b %Y} and the preceding nine months '
            f'({records_created} new orders). All prices use INR.'
        ))
