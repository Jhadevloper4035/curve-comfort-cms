const text = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.title || value.name || value.label || value.slug || value._id) {
    return value.title || value.name || value.label || value.slug || value._id.toString();
  }
  return value.toString && value.toString !== Object.prototype.toString ? value.toString() : '';
};

const money = (amount, currency = 'INR') => {
  if (amount == null || amount === '') return '';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const productImage = (product = {}) => product.image || product.images?.[0] || '';

export const productDisplay = (product = {}) => {
  const category = text(product.category) || 'Uncategorized';
  const subcategories = Array.isArray(product.subcategories)
    ? product.subcategories.map(text).filter(Boolean)
    : [];
  const subtitle = product.slug || product.productCode || '';
  const title = product.title || product.productName || subtitle || 'Untitled product';
  const price = money(product.basePrice, product.currency);
  const stock = product.stock ?? '';
  const inStock = product.inStock ?? (stock === '' ? true : Number(stock) > 0);
  const subcategoryText = subcategories.join(', ') || product.subCategory || '';

  return {
    id: product._id,
    title,
    subtitle,
    image: productImage(product),
    category,
    subcategoryText,
    price,
    stockText: stock === '' ? (inStock ? 'In stock' : 'Out of stock') : `${stock} ${inStock ? 'in stock' : 'out of stock'}`,
    isActive: product.isActive !== false && product.isDeleted !== true,
    searchText: [title, subtitle, category, subcategoryText, price, product.description].filter(Boolean).join(' ').toLowerCase(),
  };
};
