import { useState } from 'react';
import { User, Mail, Lock, Save, Building, TreePine } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'sonner';

const ParametresPage = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Paramètres enregistrés avec succès !');
    }, 1000);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav>
                <ul className="divide-y divide-gray-200">
                  <SettingsNavItem
                    icon={<User size={18} />}
                    label="Profil utilisateur"
                    active
                  />
                  <SettingsNavItem
                    icon={<Building size={18} />}
                    label="Entreprise"
                  />
                  <SettingsNavItem
                    icon={<TreePine size={18} />}
                    label="Paramètres d'exploitation"
                  />
                  <SettingsNavItem
                    icon={<Lock size={18} />}
                    label="Sécurité"
                  />
                </ul>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Profil utilisateur" subtitle="Gérez vos informations personnelles" />
            <form onSubmit={handleSaveSettings}>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Photo de profil</h3>
                    <div className="mt-2 flex space-x-2">
                      <Button variant="outline" size="sm">
                        Changer
                      </Button>
                      <Button variant="text" size="sm">
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Prénom"
                    defaultValue="Admin"
                    fullWidth
                  />
                  <Input
                    label="Nom"
                    defaultValue="Forestier"
                    fullWidth
                  />
                  <Input
                    label="Email"
                    type="email"
                    defaultValue="admin@forestnursery.com"
                    icon={<Mail size={18} />}
                    fullWidth
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    defaultValue="+33 6 12 34 56 78"
                    fullWidth
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
                      rows={3}
                      defaultValue="Gestionnaire de la pépinière de sapins de Noël"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Mot de passe actuel"
                      type="password"
                      icon={<Lock size={18} />}
                      fullWidth
                    />
                    <div className="hidden md:block" /> {/* Spacer */}
                    <Input
                      label="Nouveau mot de passe"
                      type="password"
                      fullWidth
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      type="password"
                      fullWidth
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-3 border-t border-gray-200">
                <Button
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save size={16} />}
                  isLoading={loading}
                >
                  Enregistrer
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface SettingsNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SettingsNavItem = ({ icon, label, active = false }: SettingsNavItemProps) => {
  return (
    <li>
      <a
        href="#"
        className={`flex items-center px-4 py-3 text-sm font-medium ${
          active
            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </a>
    </li>
  );
};

export default ParametresPage;