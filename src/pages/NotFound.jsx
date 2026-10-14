import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-display font-black uppercase text-6xl lg:text-8xl tracking-tight text-ink mb-4">
          404
        </h1>
        <h2 className="font-display font-extrabold uppercase text-xl lg:text-2xl tracking-tight text-ink mb-6">
          PAGE NOT FOUND
        </h2>
        <p className="text-graphite mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="solid">BACK TO HOME</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline">BROWSE SHOP</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}