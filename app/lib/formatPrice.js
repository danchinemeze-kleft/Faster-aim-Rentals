export function formatPrice(price) {
  return price ? `₦${Number(price).toLocaleString('en-NG')}` : '🔒 Log in to see price'
}