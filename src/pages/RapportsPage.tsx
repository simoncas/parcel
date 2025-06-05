import { useState } from 'react';
import { Download, Calendar, BarChart } from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';

const RapportsPage = () => {
  const [reportType, setReportType] = useState('activities');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const reportTypes = [
    { value: 'activities', label: 'Rapport d\'activités' },
    { value: 'parcelles', label: 'État des parcelles' },
    { value: 'harvest', label: 'Prévisions de récolte' },
    { value: 'fertilisation', label: 'Suivi de fertilisation' }
  ];
  
  const dateRanges = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' }
  ];
  
  const getReportDescription = () => {
    switch (reportType) {
      case 'activities':
        return 'Ce rapport fournit un résumé de toutes les activités effectuées sur vos parcelles pendant la période sélectionnée.';
      case 'parcelles':
        return 'Ce rapport donne un aperçu détaillé de l\'état actuel de toutes vos parcelles, avec des statistiques sur l\'âge, les espèces et les dernières activités.';
      case 'harvest':
        return 'Ce rapport présente les prévisions de récolte basées sur l\'âge des arbres et les dernières observations.';
      case 'fertilisation':
        return 'Ce rapport suit l\'historique des fertilisations effectuées et propose un calendrier optimal pour les prochaines interventions.';
      default:
        return '';
    }
  };
  
  const getReportIcon = () => {
    switch (reportType) {
      case 'activities':
        return <Calendar size={40} className="text-primary-500" />;
      case 'parcelles':
        return <div className="text-secondary-500 text-4xl">🌲</div>;
      case 'harvest':
        return <div className="text-success-500 text-4xl">🌲</div>;
      case 'fertilisation':
        return <div className="text-warning-500 text-4xl">🌱</div>;
      default:
        return <BarChart size={40} className="text-primary-500" />;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Rapports</h2>
      
      {/* Report Configuration */}
      <Card>
        <CardHeader title="Générer un rapport" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Type de rapport"
                options={reportTypes}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                fullWidth
              />
              <p className="mt-2 text-sm text-gray-500">{getReportDescription()}</p>
            </div>
            
            <div>
              <Select
                label="Période"
                options={dateRanges}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                fullWidth
              />
              
              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Date de début"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                  />
                  <Input
                    label="Date de fin"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              icon={<Download size={16} />}
              iconPosition="left"
            >
              Générer le rapport
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Rapport d'activités"
          description="Résumé des activités du mois dernier"
          date="01/04/2025"
          icon={<Calendar size={40} className="text-primary-500" />}
        />
        <ReportCard
          title="État des parcelles"
          description="Inventaire complet des parcelles"
          date="15/03/2025"
          icon={<div className="text-secondary-500 text-4xl">🌲</div>}
        />
        <ReportCard
          title="Prévisions de récolte"
          description="Estimation pour la saison 2025"
          date="01/03/2025"
          icon={<div className="text-success-500 text-4xl">🌲</div>}
        />
      </div>
      
      {/* Report Preview */}
      <Card>
        <CardHeader title={`Aperçu: ${reportTypes.find(r => r.value === reportType)?.label || ''}`} />
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          {getReportIcon()}
          <h3 className="text-xl font-semibold mt-4">
            {reportTypes.find(r => r.value === reportType)?.label || ''}
          </h3>
          <p className="text-gray-500 mt-2 max-w-md">
            Sélectionnez les paramètres et cliquez sur "Générer le rapport" pour créer un nouveau rapport.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

interface ReportCardProps {
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
}

const ReportCard = ({ title, description, date, icon }: ReportCardProps) => {
  return (
    <Card className="transition-transform hover:-translate-y-1 duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <Button
            variant="text"
            size="sm"
            icon={<Download size={16} />}
            className="text-primary-600"
          />
        </div>
        <h3 className="text-lg font-semibold mt-4">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Généré le {date}</span>
          <span className="text-xs font-medium text-primary-600">PDF</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapportsPage;