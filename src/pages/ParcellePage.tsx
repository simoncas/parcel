import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Eye, ClipboardList } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import ParcelleForm from '../components/parcelles/ParcelleForm';
import { supabase } from '../lib/supabase';
import { Parcelle } from '../types/models';

const ParcellePage = () => {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExposition, setFilterExposition] = useState('');
  const [filterTypeSol, setFilterTypeSol] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Options for filters
  const expositionOptions = [
    { value: '', label: 'Toutes expositions' },
    { value: 'nord', label: 'Nord' },
    { value: 'sud', label: 'Sud' },
    { value: 'est', label: 'Est' },
    { value: 'ouest', label: 'Ouest' },
    { value: 'nord-est', label: 'Nord-Est' },
    { value: 'nord-ouest', label: 'Nord-Ouest' },
    { value: 'sud-est', label: 'Sud-Est' },
    { value: 'sud-ouest', label: 'Sud-Ouest' },
  ];
  
  const typeSolOptions = [
    { value: '', label: 'Tous types de sol' },
    { value: 'argileux', label: 'Argileux' },
    { value: 'sableux', label: 'Sableux' },
    { value: 'limoneux', label: 'Limoneux' },
    { value: 'calcaire', label: 'Calcaire' },
    { value: 'humifere', label: 'Humifère' },
  ];
  
  useEffect(() => {
    const fetchParcelles = async () => {
      setLoading(true);
      let query = supabase
        .from('parcelle')
        .select('*, especes:parcelle_espece(espece_id(*), quantite, date_plantation)');
      
      // Apply filters if set
      if (filterExposition) {
        query = query.eq('exposition', filterExposition);
      }
      
      if (filterTypeSol) {
        query = query.eq('type_sol', filterTypeSol);
      }
      
      // Apply search if set
      if (searchTerm) {
        query = query.or(`nom.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('nom');
      
      if (error) {
        console.error('Error fetching parcelles:', error);
      } else {
        setParcelles(data || []);
      }
      
      setLoading(false);
    };
    
    fetchParcelles();
  }, [searchTerm, filterExposition, filterTypeSol]);
  
  // Get status of a parcel based on creation date
  const getParcelleStatus = (dateCreation: string) => {
    const ageInYears = (new Date().getTime() - new Date(dateCreation).getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageInYears < 3) {
      return { label: 'Jeune', variant: 'primary' as const };
    } else if (ageInYears >= 3 && ageInYears < 6) {
      return { label: 'Mature', variant: 'success' as const };
    } else {
      return { label: 'À récolter', variant: 'warning' as const };
    }
  };
  
  const handleSaveParcelle = (parcelle: Parcelle) => {
    setParcelles([...parcelles, parcelle]);
    setShowForm(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {showForm ? (
        <ParcelleForm 
          onSave={handleSaveParcelle}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Parcelles</h2>
            <Button 
              variant="primary" 
              icon={<Plus size={16} />}
              iconPosition="left"
              onClick={() => setShowForm(true)}
            >
              Nouvelle parcelle
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                fullWidth
                placeholder="Rechercher par nom ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                options={expositionOptions}
                value={filterExposition}
                onChange={(e) => setFilterExposition(e.target.value)}
                fullWidth
                icon={<Filter size={18} />}
              />
              <Select
                options={typeSolOptions}
                value={filterTypeSol}
                onChange={(e) => setFilterTypeSol(e.target.value)}
                fullWidth
                icon={<Filter size={18} />}
              />
            </div>
          </div>
          
          {/* Parcelles Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            </div>
          ) : parcelles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parcelles.map((parcelle) => {
                const status = getParcelleStatus(parcelle.date_creation);
                
                return (
                  <Card 
                    key={parcelle.parcelle_id} 
                    className="transition-transform hover:translate-y-[-4px] duration-200"
                  >
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">{parcelle.nom}</h3>
                            <p className="text-sm text-gray-500">Code: {parcelle.code}</p>
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Surface</p>
                            <p className="text-sm font-medium">{parcelle.surface_m2} m²</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Type de sol</p>
                            <p className="text-sm font-medium capitalize">{parcelle.type_sol}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Exposition</p>
                            <p className="text-sm font-medium capitalize">{parcelle.exposition}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date création</p>
                            <p className="text-sm font-medium">
                              {new Date(parcelle.date_creation).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 grid grid-cols-2 divide-x divide-gray-200">
                        <Link 
                          to={`/parcelles/${parcelle.parcelle_id}`}
                          className="py-3 text-center text-sm font-medium text-primary-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <Eye size={16} className="mr-2" />
                          Voir détails
                        </Link>
                        <Link 
                          to={`/parcelles/${parcelle.parcelle_id}?addActivity=true`}
                          className="py-3 text-center text-sm font-medium text-secondary-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <ClipboardList size={16} className="mr-2" />
                          Nouvelle activité
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card p-8 text-center">
              <p className="text-gray-500">Aucune parcelle trouvée.</p>
              <Button 
                variant="primary" 
                icon={<Plus size={16} />}
                iconPosition="left"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Créer une parcelle
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParcellePage;