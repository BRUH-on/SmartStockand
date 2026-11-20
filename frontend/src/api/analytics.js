const asArray = (value) => {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.results) ? value.results : [];
};

export const normalizeAnalyticsKpis = (data = {}) => {
  const values = data ?? {};
  return {
    ...values,
    total_products: values.total_products ?? values.total_skus ?? 0,
    total_stock_units: values.total_stock_units ?? 0,
    total_inventory_value: values.total_inventory_value ?? values.total_inventory_valuation ?? 0,
    total_revenue: values.total_revenue ?? 0,
    low_stock_items: values.low_stock_items ?? values.low_stock_count ?? 0,
    out_of_stock_items: values.out_of_stock_items ?? values.out_of_stock_count ?? 0
  };
};

export const normalizeSalesTrend = (data) => {
  const rows = asArray(data);
  if (rows.length === 0 && !Array.isArray(data)) {
    return {
      dates: Array.isArray(data?.dates) ? data.dates : [],
      totals: Array.isArray(data?.totals) ? data.totals : []
    };
  }

  return {
    dates: rows.map((item) => item.period ?? item.date ?? ''),
    totals: rows.map((item) => Number(item.total_revenue ?? item.total ?? 0))
  };
};

export const normalizeCategoryBreakdown = (data) => {
  const rows = asArray(data);
  if (rows.length === 0 && !Array.isArray(data)) {
    return {
      categories: Array.isArray(data?.categories) ? data.categories : [],
      counts: Array.isArray(data?.counts) ? data.counts : []
    };
  }

  return {
    categories: rows.map((item) => item.category_name ?? item.name ?? ''),
    counts: rows.map((item) => Number(item.total_quantity ?? item.count ?? item.product_count ?? 0))
  };
};

export const normalizeTopProducts = (data) => asArray(data).map((item) => ({
  ...item,
  name: item.name ?? item.product__name ?? item.product_name ?? '',
  sku: item.sku ?? item.product__sku ?? '',
  sold: Number(item.sold ?? item.total_units_sold ?? item.total_quantity ?? 0),
  revenue: Number(item.revenue ?? item.total_revenue_generated ?? item.total_sales ?? 0)
}));

export const normalizeReorderRecommendations = (data) => asArray(data).map((item) => ({
  ...item,
  suggested_order_qty: item.suggested_order_qty ?? item.recommended_order_quantity ?? 0
}));
