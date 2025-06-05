import { Link } from 'react-router-dom';
import { Home, TreePine } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <TreePine size={80} className="text-primary-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Page non trouvée</h1>
      <p className="text-xl text-gray-600 mb-8">
        La page que vous cherchez semble avoir été déplacée ou n'existe pas.
      </p>
      <Link to="/">
        <Button 
          variant="primary"
          size="lg"
          icon={<Home size={18} />}
          iconPosition="left"
        >
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;