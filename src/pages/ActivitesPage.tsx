import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Filter, Plus, Eye, Calendar } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { Activite, TypeActivite } from '../types/models';

const ActivitesPage = () => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [typesActivite, setTypesActivite] = useState<TypeActivite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch activity types
      const { data: types } = await supabase
        .from('type_activite')
        .select('*')
        .order('libelle');
      
      if (types) {
        setTypesActivite(types);
      }
      
      // Build query for activities
      let query = supabase
        .from('activite')
        .select(`
          *,
          typeActivite:type_activite_id(*),
          parcelle:parcelle_id(nom, code)
        `);
      
      // Apply filters
      if (filterType) {
        query = query.eq('type_activite_id', filterType);
      }
      
      if (filterDateStart) {
        query = query.gte('date_activite', filterDateStart);
      }
      
      if (filterDateEnd) {
        query = query.lte('date_activite', filterDateEnd);
      }
      
      // Apply search
      if (searchTerm) {
        query = query.or(`parcelle.nom.ilike.%${searchTerm}%,parcelle.code.ilike.%${searchTerm}%,operateur.ilike.%${searchTerm}%`);
      }
      
      // Execute query
      const { data, error } = await query.order('date_activite', { ascending: false });
      
      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivites(data || []);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [searchTerm, filterType, filterDateStart, filterDateEnd]);
  
  const getActivityVariant = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (type.toUpperCase()) {
      case 'PLANTATION':
        return 'primary';
      case 'TAILLE':
        return 'secondary';
      case 'FERTILISATION':
        return 'success';
      case 'PHYTOSANITAIRE':
        return 'warning';
      case 'IRRIGATION':
        return 'primary';
      case 'DESHERBAGE':
        return 'secondary';
      case 'RECOLTE':
        return 'success';
      case 'OBSERVATION':
        return 'primary';
      default:
        return 'primary';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Activités</h2>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          iconPosition="left"
        >
          Nouvelle activité
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                label="Rechercher"
                placeholder="Parcelle, opérateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                icon={<Search size={18} />}
              />
            </div>
            <div className="md:col-span-1">
              <Select
                label="Type d'activité"
                options={[
                  { value: '', label: 'Tous les types' },
                  ...typesActivite.map(type => ({
                    value: type.type_activite_id.toString(),
                    label: type.libelle
                  }))
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                fullWidth
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Date début"
                type="date"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                fullWidth
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Date fin"
                type="date"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                fullWidth
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activities List */}
      <Card>
        <CardHeader title="Liste des activités" />
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            </div>
          ) : activites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opérateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activites.map((activite) => (
                    <tr key={activite.activite_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={getActivityVariant(activite.typeActivite?.code || '')}
                          size="sm"
                        >
                          {activite.typeActivite?.libelle}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(activite.date_activite), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activite.parcelle?.nom}</div>
                        <div className="text-xs text-gray-500">{activite.parcelle?.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activite.operateur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activite.zone_concernee || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {activite.commentaire_general || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="text"
                          size="sm"
                          icon={<Eye size={16} />}
                          iconPosition="left"
                          className="text-primary-600"
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune activité trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter une nouvelle activité ou modifiez vos filtres.
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  iconPosition="left"
                >
                  Nouvelle activité
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitesPage;