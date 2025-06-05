import { useEffect, useState } from 'react';
import { ArrowRight, Plane as Plant, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Card, { CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { Activite, TypeActivite } from '../types/models';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParcelles: 0,
    parcellesARecolter: 0,
    activitesEnAttente: 0,
    parcellesEnAlerte: 0
  });
  
  const [activitesRecentes, setActivitesRecentes] = useState<Activite[]>([]);
  const [typesActivite, setTypesActivite] = useState<TypeActivite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch total parcelles
      const { count: totalParcelles } = await supabase
        .from('parcelle')
        .select('*', { count: 'exact', head: true });
      
      // Fetch parcelles à récolter (simplified example)
      const { count: parcellesARecolter } = await supabase
        .from('parcelle')
        .select('*', { count: 'exact', head: true })
        .gte('date_creation', new Date(new Date().setFullYear(new Date().getFullYear() - 6)).toISOString());
      
      // Fetch activités en attente (simplified example)
      const { count: activitesEnAttente } = await supabase
        .from('activite')
        .select('*', { count: 'exact', head: true })
        .gte('date_activite', new Date().toISOString());
      
      // Fetch parcelles en alerte (simplified example)
      const { count: parcellesEnAlerte } = await supabase
        .from('parcelle')
        .select('*', { count: 'exact', head: true })
        .eq('type_sol', 'sec');
      
      setStats({
        totalParcelles: totalParcelles || 0,
        parcellesARecolter: parcellesARecolter || 0,
        activitesEnAttente: activitesEnAttente || 0,
        parcellesEnAlerte: parcellesEnAlerte || 0
      });
      
      // Fetch activités récentes
      const { data: activites } = await supabase
        .from('activite')
        .select(`
          *,
          parcelle:parcelle_id(nom, code),
          typeActivite:type_activite_id(libelle, code)
        `)
        .order('date_activite', { ascending: false })
        .limit(5);
      
      if (activites) {
        setActivitesRecentes(activites);
      }
      
      // Fetch types d'activité
      const { data: types } = await supabase
        .from('type_activite')
        .select('*');
      
      if (types) {
        setTypesActivite(types);
      }
    };
    
    fetchData();
  }, []);

  // Chart data for activities by month
  const activitiesChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Activités',
        data: [12, 19, 3, 5, 2, 3, 20, 33, 18, 10, 7, 5],
        backgroundColor: '#3D8A55',
      },
    ],
  };

  // Chart data for activity types
  const typeChartData = {
    labels: typesActivite.map(type => type.libelle),
    datasets: [
      {
        data: [12, 19, 3, 5, 2, 3, 7, 4],
        backgroundColor: [
          '#3D8A55', // Primary
          '#8B5E34', // Secondary
          '#3B82F6', // Accent
          '#10B981', // Success
          '#F59E0B', // Warning
          '#EF4444', // Error
          '#8B5CF6', // Purple
          '#EC4899', // Pink
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Bienvenue dans votre gestion de pépinière</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Parcelles" 
          value={stats.totalParcelles.toString()} 
          icon={<Plant className="text-primary-500" />} 
          color="bg-primary-50"
        />
        <StatCard 
          title="À récolter" 
          value={stats.parcellesARecolter.toString()} 
          icon={<CheckCircle className="text-success-500" />} 
          color="bg-success-50"
        />
        <StatCard 
          title="Activités planifiées" 
          value={stats.activitesEnAttente.toString()} 
          icon={<Calendar className="text-accent-500" />} 
          color="bg-accent-50"
        />
        <StatCard 
          title="Parcelles en alerte" 
          value={stats.parcellesEnAlerte.toString()} 
          icon={<AlertTriangle className="text-warning-500" />} 
          color="bg-warning-50"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Activités par mois" />
          <CardContent className="h-64">
            <Bar 
              data={activitiesChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader title="Répartition des types d'activités" />
          <CardContent className="h-64 flex items-center justify-center">
            <div className="w-4/5 h-4/5">
              <Doughnut 
                data={typeChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activities */}
      <Card>
        <CardHeader 
          title="Activités récentes" 
          action={
            <Button 
              variant="text" 
              size="sm" 
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Voir tout
            </Button>
          }
        />
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {activitesRecentes.length > 0 ? (
              activitesRecentes.map((activite) => (
                <li key={activite.activite_id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <ActivityTypeIcon type={activite.typeActivite?.code || ''} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {activite.typeActivite?.libelle} - {activite.parcelle?.nom}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {activite.commentaire_general || 'Aucun commentaire'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="secondary" size="sm">
                        {activite.parcelle?.code}
                      </Badge>
                      <span className="text-xs text-gray-500 mt-1">
                        {format(new Date(activite.date_activite), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-5 text-center text-gray-500">
                Aucune activité récente
              </li>
            )}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" icon={<ArrowRight size={16} />} iconPosition="right">
            Voir toutes les activités
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Utility components
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card className="transition-transform hover:scale-105 duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityTypeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case 'PLANTATION':
      return <Plant size={20} className="text-primary-500" />;
    case 'TAILLE':
      return <div className="text-secondary-500">✂️</div>;
    case 'FERTILISATION':
      return <div className="text-success-500">🌱</div>;
    case 'PHYTOSANITAIRE':
      return <div className="text-warning-500">💊</div>;
    case 'IRRIGATION':
      return <div className="text-accent-500">💧</div>;
    case 'DESHERBAGE':
      return <div className="text-error-500">🌿</div>;
    case 'RECOLTE':
      return <div className="text-success-500">🌲</div>;
    case 'OBSERVATION':
      return <div className="text-gray-500">👁️</div>;
    default:
      return <div className="text-gray-500">❓</div>;
  }
};

export default Dashboard;