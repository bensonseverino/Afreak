import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBar from './PromoBar';

export default function Layout() {
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PromoBar />
      <Navbar />
      <main className="flex-1 pt-[80px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}