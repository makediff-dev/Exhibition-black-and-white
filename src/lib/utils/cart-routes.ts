export const CUSTOMER_CART_HREF = "/account/customer/cart";
export const CUSTOMER_CHECKOUT_HREF = "/account/customer/checkout";

export function getCartHref(role?: string | null) {
  return role === "customer" ? CUSTOMER_CART_HREF : "/cart";
}

export function getCheckoutHref(role?: string | null) {
  return role === "customer" ? CUSTOMER_CHECKOUT_HREF : "/checkout";
}
