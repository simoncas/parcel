import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import { Layers, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { supabase } from '../lib/supabase';
import { Parcelle } from '../types/models';
import 'leaflet/dist/leaflet.css';

const CartePage = () => {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'street'>('terrain');
  const [center, setCenter] = useState<[number, number]>([46.603354, 1.888334]); // Default center of France
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchParcelles = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('parcelle')
        .select('*');
      
      if (error) {
        console.error('Error fetching parcelles:', error);
      } else {
        setParcelles(data || []);
        
        // If we have parcelles, center the map on the first one
        if (data && data.length > 0 && data[0].geom_coordonnee) {
          const coords = data[0].geom_coordonnee.coordinates[0][0];
          setCenter([coords[1], coords[0]]);
        }
      }
      
      setLoading(false);
    };
    
    fetchParcelles();
  }, []);
  
  // Get map tile layer based on selected view
  const getMapTileLayer = () => {
    switch (mapView) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'street':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };
  
  // Get map attribution based on selected view
  const getMapAttribution = () => {
    switch (mapView) {
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'terrain':
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
      case 'street':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };
  
  // Color parcelles based on soil type
  const getParcelleColor = (typeSol: string) => {
    switch (typeSol.toLowerCase()) {
      case 'argileux':
        return '#8B5E34'; // Brown
      case 'sableux':
        return '#F7EAD8'; // Light brown
      case 'limoneux':
        return '#AB8348'; // Darker brown
      case 'calcaire':
        return '#E2B673'; // Tan
      case 'humifere':
        return '#3D8A55'; // Green
      default:
        return '#2D6A4F'; // Default green
    }
  };
  
  // Get parcelle age in years
  const getParcelleAge = (dateCreation: string) => {
    const ageInYears = (new Date().getTime() - new Date(dateCreation).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(ageInYears);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Carte des parcelles</h2>
        <div className="w-full md:w-48">
          <Select
            options={[
              { value: 'terrain', label: 'Terrain' },
              { value: 'satellite', label: 'Satellite' },
              { value: 'street', label: 'Route' },
            ]}
            value={mapView}
            onChange={(e) => setMapView(e.target.value as any)}
            fullWidth
            icon={<Layers size={18} />}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : parcelles.length > 0 ? (
        <Card>
          <CardHeader title="Vue d'ensemble des parcelles" />
          <CardContent className="p-0 h-[calc(100vh-250px)]">
            <MapContainer 
              center={center} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url={getMapTileLayer()}
                attribution={getMapAttribution()}
              />
              {parcelles.map((parcelle) => {
                if (!parcelle.geom_coordonnee?.coordinates?.[0]) return null;
                
                // Format coordinates for Leaflet (Leaflet uses [lat, lng] while GeoJSON uses [lng, lat])
                const positions = parcelle.geom_coordonnee.coordinates[0].map(coord => 
                  [coord[1], coord[0]] as [number, number]
                );
                
                return (
                  <Polygon 
                    key={parcelle.parcelle_id}
                    positions={positions}
                    pathOptions={{ 
                      color: getParcelleColor(parcelle.type_sol),
                      weight: 3,
                      fillOpacity: 0.5
                    }}
                    eventHandlers={{
                      click: () => navigate(`/parcelles/${parcelle.parcelle_id}`)
                    }}
                  >
                    <Tooltip sticky>
                      <div className="p-2">
                        <h3 className="font-bold">{parcelle.nom}</h3>
                        <p className="text-xs">Code: {parcelle.code}</p>
                        <p className="text-xs">Surface: {parcelle.surface_m2} m²</p>
                        <p className="text-xs">Type de sol: {parcelle.type_sol}</p>
                        <p className="text-xs">Âge: {getParcelleAge(parcelle.date_creation)} ans</p>
                      </div>
                    </Tooltip>
                  </Polygon>
                );
              })}
              <MapCenterController center={center} />
            </MapContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-card p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-warning-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune parcelle disponible</h3>
          <p className="mt-1 text-sm text-gray-500">
            Il n'y a pas de parcelles avec des coordonnées géographiques.
          </p>
          <Button 
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/parcelles')}
          >
            Voir les parcelles
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper component to control map center
const MapCenterController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
};

export default CartePage;