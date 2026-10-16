// Spec puts the wishlist hook in `hooks/`; it re-exports the context hook so
// both import paths work.
export { useWishlistContext as useWishlist, WishlistProvider } from '../context/WishlistContext';
