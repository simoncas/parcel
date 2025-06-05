import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Plus, MapPin, 
  Maximize, Layers, Calendar, User 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { Parcelle, Activite, Espece } from '../types/models';
import ActivityForm from '../components/activities/ActivityForm';

const ParcelleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [parcelle, setParcelle] = useState<Parcelle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [especes, setEspeces] = useState<Espece[]>([]);
  
  useEffect(() => {
    // Check if we should show the activity form based on URL param
    const addActivity = searchParams.get('addActivity');
    if (addActivity === 'true') {
      setShowActivityForm(true);
    }
    
    const fetchParcelleDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      // Fetch parcelle details
      const { data: parcelleData, error: parcelleError } = await supabase
        .from('parcelle')
        .select('*')
        .eq('parcelle_id', id)
        .single();
      
      if (parcelleError) {
        console.error('Error fetching parcelle:', parcelleError);
        return;
      }
      
      // Fetch activités for this parcelle
      const { data: activitesData, error: activitesError } = await supabase
        .from('activite')
        .select(`
          *,
          typeActivite:type_activite_id(*)
        `)
        .eq('parcelle_id', id)
        .order('date_activite', { ascending: false });
      
      if (activitesError) {
        console.error('Error fetching activities:', activitesError);
      } else {
        setActivites(activitesData || []);
      }
      
      // Fetch espèces for this parcelle
      const { data: especesData, error: especesError } = await supabase
        .from('parcelle_espece')
        .select(`
          quantite,
          date_plantation,
          espece:espece_id(*)
        `)
        .eq('parcelle_id', id);
      
      if (especesError) {
        console.error('Error fetching especes:', especesError);
      } else {
        const processedEspeces = especesData?.map(item => ({
          ...item.espece,
          quantite: item.quantite,
          date_plantation: item.date_plantation
        })) || [];
        setEspeces(processedEspeces);
      }
      
      setParcelle(parcelleData);
      setLoading(false);
    };
    
    fetchParcelleDetails();
  }, [id, searchParams]);
  
  const handleAddActivity = (newActivity: Activite) => {
    setActivites([newActivity, ...activites]);
    setShowActivityForm(false);
    // Refresh URL to remove addActivity param
    navigate(`/parcelles/${id}`);
  };
  
  const toggleFullscreenMap = () => {
    setIsFullscreenMap(!isFullscreenMap);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }
  
  if (!parcelle) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <p className="text-gray-500">Parcelle non trouvée.</p>
        <Button 
          variant="primary" 
          icon={<ArrowLeft size={16} />}
          iconPosition="left"
          className="mt-4"
          onClick={() => navigate('/parcelles')}
        >
          Retour aux parcelles
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {showActivityForm ? (
        <ActivityForm 
          parcelleId={Number(id)} 
          onSave={handleAddActivity}
          onCancel={() => {
            setShowActivityForm(false);
            navigate(`/parcelles/${id}`);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate('/parcelles')}
              />
              <h2 className="text-2xl font-bold text-gray-800">{parcelle.nom}</h2>
              <Badge variant="secondary" size="md">{parcelle.code}</Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                icon={<Edit size={16} />}
                iconPosition="left"
              >
                Modifier
              </Button>
              <Button 
                variant="primary" 
                icon={<Plus size={16} />}
                iconPosition="left"
                onClick={() => setShowActivityForm(true)}
              >
                Ajouter activité
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info and Map */}
            <div className="lg:col-span-2 space-y-6">
              {/* Information générale */}
              <Card>
                <CardHeader title="Informations générales" />
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm text-gray-500">Code</dt>
                      <dd className="mt-1 text-lg font-medium text-gray-900">{parcelle.code}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Surface</dt>
                      <dd className="mt-1 text-lg font-medium text-gray-900">{parcelle.surface_m2} m²</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Type de sol</dt>
                      <dd className="mt-1 text-lg font-medium text-gray-900 capitalize">{parcelle.type_sol}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Exposition</dt>
                      <dd className="mt-1 text-lg font-medium text-gray-900 capitalize">{parcelle.exposition}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Pente</dt>
                      <dd className="mt-1 text-lg font-medium text-gray-900">{parcelle.pente_deg}°</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Date de création</dt>
                      <dd className="mt-1 text-lg font-medium text-gray-900">
                        {new Date(parcelle.date_creation).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                  </dl>
                  
                  <h4 className="font-medium text-gray-700 mt-6 mb-3">Espèces plantées</h4>
                  {especes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {especes.map((espece, index) => (
                        <Badge key={index} variant="primary" className="py-1">
                          {espece.variete} ({espece.quantite})
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune espèce renseignée</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Map */}
              <Card>
                <CardHeader 
                  title="Carte de la parcelle" 
                  action={
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={isFullscreenMap ? <Layers size={16} /> : <Maximize size={16} />}
                      onClick={toggleFullscreenMap}
                    >
                      {isFullscreenMap ? 'Réduire' : 'Agrandir'}
                    </Button>
                  }
                />
                <CardContent className={isFullscreenMap ? 'h-[600px]' : 'h-[300px]'}>
                  <ParcelleMap parcelle={parcelle} />
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Activities */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader title="Historique des activités" />
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      className={`py-3 px-4 text-sm font-medium border-b-2 ${
                        activeTab === 'timeline'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('timeline')}
                    >
                      Timeline
                    </button>
                    <button
                      className={`py-3 px-4 text-sm font-medium border-b-2 ${
                        activeTab === 'table'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('table')}
                    >
                      Tableau
                    </button>
                  </nav>
                </div>
                <CardContent className={`p-0 ${activites.length === 0 ? 'flex items-center justify-center h-64' : ''}`}>
                  {activites.length === 0 ? (
                    <div className="text-center p-6">
                      <p className="text-gray-500 mb-4">Aucune activité enregistrée</p>
                      <Button 
                        variant="primary" 
                        size="sm"
                        icon={<Plus size={16} />}
                        onClick={() => setShowActivityForm(true)}
                      >
                        Ajouter une activité
                      </Button>
                    </div>
                  ) : activeTab === 'timeline' ? (
                    <div className="p-4">
                      <Timeline activites={activites} />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opérateur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
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
                                {new Date(activite.date_activite).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {activite.operateur}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {activite.zone_concernee || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Timeline = ({ activites }: { activites: Activite[] }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200"></div>
      
      <ul className="space-y-6">
        {activites.map((activite) => {
          const activityDate = new Date(activite.date_activite);
          
          return (
            <li key={activite.activite_id} className="relative pl-10">
              {/* Dot */}
              <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${getActivityBgColor(activite.typeActivite?.code || '')}`}>
                <ActivityIcon type={activite.typeActivite?.code || ''} size={14} color="white" />
              </div>
              
              {/* Content */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">
                    {format(activityDate, 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <Badge variant={getActivityVariant(activite.typeActivite?.code || '')}>
                    {activite.typeActivite?.libelle}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-gray-800 mt-2 flex items-center">
                  <User size={14} className="mr-1" />
                  {activite.operateur}
                </h4>
                
                {activite.commentaire_general && (
                  <p className="text-sm text-gray-600 mt-2">{activite.commentaire_general}</p>
                )}
                
                {activite.zone_concernee && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <MapPin size={12} className="mr-1" />
                    {activite.zone_concernee}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ParcelleMap = ({ parcelle }: { parcelle: Parcelle }) => {
  // Default coordinates if none available
  const defaultCoords = [
    [48.8566, 2.3522],
    [48.8566, 2.3622],
    [48.8666, 2.3622],
    [48.8666, 2.3522],
  ];
  
  // Extract coordinates from the parcelle geometry
  const coordinates = parcelle.geom_coordonnee?.coordinates?.[0] || defaultCoords;
  
  // Format coordinates for Leaflet (Leaflet uses [lat, lng] while GeoJSON uses [lng, lat])
  const positions = coordinates.map(coord => 
    Array.isArray(coord) ? [coord[1], coord[0]] : coord
  );
  
  // Calculate center of polygon
  const center = positions.reduce(
    (acc, val) => [acc[0] + val[0] / positions.length, acc[1] + val[1] / positions.length],
    [0, 0]
  );
  
  return (
    <MapContainer 
      center={center} 
      zoom={16} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polygon 
        positions={positions} 
        pathOptions={{ color: '#2D6A4F', weight: 3, fillOpacity: 0.3 }}
      />
      <MapCenterController center={center} />
    </MapContainer>
  );
};

// Helper component to control map center
const MapCenterController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  
  return null;
};

const ActivityIcon = ({ type, size = 18, color = 'currentColor' }: { type: string, size?: number, color?: string }) => {
  switch (type.toUpperCase()) {
    case 'PLANTATION':
      return <Plus size={size} color={color} />;
    case 'TAILLE':
      return <span style={{ color }}>✂️</span>;
    case 'FERTILISATION':
      return <span style={{ color }}>🌱</span>;
    case 'PHYTOSANITAIRE':
      return <span style={{ color }}>💊</span>;
    case 'IRRIGATION':
      return <span style={{ color }}>💧</span>;
    case 'DESHERBAGE':
      return <span style={{ color }}>🌿</span>;
    case 'RECOLTE':
      return <span style={{ color }}>🌲</span>;
    case 'OBSERVATION':
      return <span style={{ color }}>👁️</span>;
    default:
      return <Calendar size={size} color={color} />;
  }
};

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

const getActivityBgColor = (type: string): string => {
  switch (type.toUpperCase()) {
    case 'PLANTATION':
      return 'bg-primary-600';
    case 'TAILLE':
      return 'bg-secondary-600';
    case 'FERTILISATION':
      return 'bg-success-500';
    case 'PHYTOSANITAIRE':
      return 'bg-warning-500';
    case 'IRRIGATION':
      return 'bg-accent-500';
    case 'DESHERBAGE':
      return 'bg-secondary-600';
    case 'RECOLTE':
      return 'bg-success-500';
    case 'OBSERVATION':
      return 'bg-gray-500';
    default:
      return 'bg-primary-600';
  }
};

export default ParcelleDetailPage;