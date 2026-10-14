import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import ProductShowcase from '../components/home/ProductShowcase';
import Lookbook from '../components/home/Lookbook';
import ShippingBanner from '../components/home/ShippingBanner';
import NewArrivals from '../components/home/NewArrivals';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <ProductShowcase />
      <Lookbook />
      <ShippingBanner />
      <NewArrivals />
    </>
  );
}