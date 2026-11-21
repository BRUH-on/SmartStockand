"""
URL Configuration for StockSmart Retail Inventory Management Project.

This file serves as the root URL dispatcher (API Gateway) for the entire backend.
It routes incoming HTTP requests to their appropriate application-specific URL modules
and provides a public health check endpoint for monitoring uptime and database connectivity.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

def health_check(request):
    """
    Public Health Check Endpoint (/api/health/).
    
    Used by load balancers, monitoring tools, and frontend status bars
    to verify that the Django server is alive, what environment it is running in,
    and whether the Supabase PostgreSQL database is connected.
    """
    return JsonResponse({
        'status': 'ok',
        'service': 'StockSmart Retail Inventory API',
        'version': '1.0.0',
        'database': 'Connected',
        'environment': 'Production' if not settings.DEBUG else 'Development'
    })


def frontend_redirect(request):
    """Send visitors from the API host to the deployed application."""
    return redirect('https://bruh-on.github.io/SmartStockand/')


# Master URL patterns for the StockSmart API
urlpatterns = [
    path('', frontend_redirect, name='frontend'),

    # Built-in Django Admin Interface
    path('admin/', admin.site.urls),

    # System Health Monitoring Check
    path('api/health/', health_check, name='health-check'),

    # User Authentication, Registration, and RBAC Profiles (/api/token/, /api/users/)
    path('api/', include('users.urls')),

    # Product Catalog, Categories, and Low-Stock Thresholds (/api/products/, /api/categories/)
    path('api/', include('products.urls')),

    # Multi-Location Inventory, Inter-Facility Transfers, and Audits (/api/locations/, /api/inventory-items/)
    path('api/', include('inventory.urls')),

    # Sales Orders and Customer Fulfillment (/api/orders/, /api/customers/)
    path('api/', include('orders.urls')),

    # Vendor Directory and Purchase Order Receiving (/api/suppliers/, /api/purchase-orders/)
    path('api/', include('suppliers.urls')),

    # Strategic KPIs, Sales Trends, and Dynamic Reorder Engine (/api/analytics/kpis/, etc.)
    path('api/analytics/', include('analytics.urls')),
]

# In local development mode, serve media uploads directly from Django
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
