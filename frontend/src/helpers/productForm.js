const EMPTY_OPTION_PRICING = { sizes: [], fabrics: [], foams: [], materials: [] };

const idText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id?.toString?.() || value.id?.toString?.() || '';
};

const splitList = (value) =>
  String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const numberOrUndefined = (value) => {
  if (value === '' || value == null) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const optionArray = (items = []) =>
  items
    .filter((item) => item.value || item.label)
    .map((item) => ({
      ...(item._id ? { _id: item._id } : {}),
      value: item.value?.trim() || slugify(item.label),
      label: item.label?.trim() || item.value?.trim(),
      description: item.description?.trim() || '',
      priceDelta: numberOrZero(item.priceDelta),
      priceOverride: item.priceOverride === '' || item.priceOverride == null ? null : numberOrZero(item.priceOverride),
      images: Array.isArray(item.images) ? item.images : [],
      swatch: {
        color: item.swatch?.color?.trim() || '',
        image: item.swatch?.image?.trim() || '',
      },
      isDefault: Boolean(item.isDefault),
      isActive: item.isActive !== false,
    }));

const cleanOptionPricing = (optionPricing = EMPTY_OPTION_PRICING) => ({
  sizes: optionArray(optionPricing.sizes),
  fabrics: optionArray(optionPricing.fabrics),
  foams: optionArray(optionPricing.foams),
  materials: optionArray(optionPricing.materials),
});

const cleanCustomizationGroups = (groups = []) =>
  groups
    .map((group) => ({
      ...(group._id ? { _id: group._id } : {}),
      key: slugify(group.key || group.label),
      label: group.label?.trim() || group.key?.trim(),
      description: group.description?.trim() || '',
      inputType: group.inputType || 'buttons',
      isRequired: group.isRequired !== false,
      displayOrder: numberOrZero(group.displayOrder),
      isActive: group.isActive !== false,
      options: optionArray(group.options),
    }))
    .filter((group) => group.key && group.label && group.options.length);

export const getProductFormDefaults = (product = {}) => ({
  title: product.title || product.productName || '',
  slug: product.slug || product.productCodeSlug || product.productCode || '',
  description: product.description || '',
  basePrice: product.basePrice ?? '',
  currency: product.currency || 'INR',
  stock: product.stock ?? 0,
  isActive: product.isActive ?? true,
  category: idText(product.category),
  subcategories: Array.isArray(product.subcategories)
    ? product.subcategories.map(idText).filter(Boolean).join(', ')
    : '',
  dimensions: {
    length: product.dimensions?.length ?? '',
    width: product.dimensions?.width ?? '',
    height: product.dimensions?.height ?? '',
    unit: product.dimensions?.unit || 'cm',
  },
  weight: {
    value: product.weight?.value ?? '',
    unit: product.weight?.unit || 'kg',
  },
  assemblyRequired: product.assemblyRequired ?? false,
  warranty: product.warranty || '',
  careInstructions: Array.isArray(product.careInstructions) ? product.careInstructions.join('\n') : '',
  tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
  optionPricing: product.optionPricing || EMPTY_OPTION_PRICING,
  customizationGroups: product.customizationGroups || [],
});

export const buildProductPayload = (values, images, optionPricing, customizationGroups) => ({
  title: values.title?.trim(),
  slug: values.slug?.trim() || slugify(values.title),
  description: values.description?.trim(),
  basePrice: numberOrZero(values.basePrice),
  currency: values.currency || 'INR',
  stock: numberOrZero(values.stock),
  images,
  category: values.category?.trim(),
  subcategories: splitList(values.subcategories),
  optionPricing: cleanOptionPricing(optionPricing),
  customizationGroups: cleanCustomizationGroups(customizationGroups),
  dimensions: {
    length: numberOrUndefined(values.dimensions?.length),
    width: numberOrUndefined(values.dimensions?.width),
    height: numberOrUndefined(values.dimensions?.height),
    unit: values.dimensions?.unit || 'cm',
  },
  weight: {
    value: numberOrUndefined(values.weight?.value),
    unit: values.weight?.unit || 'kg',
  },
  assemblyRequired: Boolean(values.assemblyRequired),
  warranty: values.warranty?.trim() || '',
  careInstructions: splitList(values.careInstructions),
  tags: splitList(values.tags),
  isActive: values.isActive !== false,
});
