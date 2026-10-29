export function hasProduct(entitlements, productId) {
  return Array.isArray(entitlements) && entitlements.some(e => e.product_id === productId && e.status === 'active');
}
