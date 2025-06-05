import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, Save, MapPin } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { supabase } from '../../lib/supabase';
import { Parcelle } from '../../types/models';

interface ParcelleFormProps {
  onSave: (parcelle: Parcelle) => void;
  onCancel: () => void;
  existingParcelle?: Parcelle;
}

const ParcelleForm = ({ onSave, onCancel, existingParcelle }: ParcelleFormProps) => {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: existingParcelle || {
      code: '',
      nom: '',
      surface_m2: 0,
      type_sol: '',
      pente_deg: 0,
      exposition: '',
      date_creation: new Date().toISOString().split('T')[0],
      geom_coordonnee: {
        type: 'Polygon',
        coordinates: [[]]
      }
    }
  });
  
  const expositionOptions = [
    { value: 'nord', label: 'Nord' },
    { value: 'sud', label: 'Sud' },
    { value: 'est', label: 'Est' },
    { value: 'ouest', label: 'Ouest' },
    { value: 'nord-est', label: 'Nord-Est' },
    { value: 'nord-ouest', label: 'Nord-Ouest' },
    { value: 'sud-est', label: 'Sud-Est' },
    { value: 'sud-ouest', label: 'Sud-Ouest' }
  ];
  
  const typeSolOptions = [
    { value: 'argileux', label: 'Argileux' },
    { value: 'sableux', label: 'Sableux' },
    { value: 'limoneux', label: 'Limoneux' },
    { value: 'calcaire', label: 'Calcaire' },
    { value: 'humifere', label: 'Humifère' }
  ];
  
  const onSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      // Prepare the data
      const parcelleData = {
        ...data,
        geom_coordonnee: {
          type: 'Polygon',
          coordinates: [[
            // Example polygon - this should be replaced with actual coordinates from a map interface
            [2.3522, 48.8566],
            [2.3622, 48.8566],
            [2.3622, 48.8666],
            [2.3522, 48.8666],
            [2.3522, 48.8566]
          ]]
        }
      };
      
      let result;
      
      if (existingParcelle) {
        // Update existing parcelle
        const { data: updatedParcelle, error } = await supabase
          .from('parcelle')
          .update(parcelleData)
          .eq('parcelle_id', existingParcelle.parcelle_id)
          .select()
          .single();
          
        if (error) throw error;
        result = updatedParcelle;
        toast.success('Parcelle mise à jour avec succès !');
      } else {
        // Insert new parcelle
        const { data: newParcelle, error } = await supabase
          .from('parcelle')
          .insert(parcelleData)
          .select()
          .single();
          
        if (error) throw error;
        result = newParcelle;
        toast.success('Parcelle créée avec succès !');
      }
      
      onSave(result as Parcelle);
    } catch (error) {
      console.error('Error saving parcelle:', error);
      toast.error('Erreur lors de l\'enregistrement de la parcelle');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader 
          title={existingParcelle ? "Modifier la parcelle" : "Créer une nouvelle parcelle"} 
          subtitle="Remplissez les informations ci-dessous pour enregistrer la parcelle"
        />
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Code de la parcelle"
              {...register('code', { 
                required: 'Le code est requis',
                pattern: {
                  value: /^[A-Z0-9-]+$/,
                  message: 'Le code doit contenir uniquement des lettres majuscules, chiffres et tirets'
                }
              })}
              error={errors.code?.message}
              fullWidth
            />
            <Input
              label="Nom de la parcelle"
              {...register('nom', { required: 'Le nom est requis' })}
              error={errors.nom?.message}
              fullWidth
            />
          </div>
          
          {/* Physical Characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Surface (m²)"
              type="number"
              step="0.01"
              {...register('surface_m2', { 
                required: 'La surface est requise',
                min: { value: 0, message: 'La surface doit être positive' }
              })}
              error={errors.surface_m2?.message}
              fullWidth
            />
            <Select
              label="Type de sol"
              options={typeSolOptions}
              {...register('type_sol', { required: 'Le type de sol est requis' })}
              error={errors.type_sol?.message}
              fullWidth
            />
            <Input
              label="Pente (degrés)"
              type="number"
              step="0.1"
              {...register('pente_deg', { 
                required: 'La pente est requise',
                min: { value: 0, message: 'La pente doit être positive' },
                max: { value: 90, message: 'La pente ne peut pas dépasser 90°' }
              })}
              error={errors.pente_deg?.message}
              fullWidth
            />
          </div>
          
          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Exposition"
              options={expositionOptions}
              {...register('exposition', { required: 'L\'exposition est requise' })}
              error={errors.exposition?.message}
              fullWidth
            />
            <Input
              label="Date de création"
              type="date"
              {...register('date_creation', { required: 'La date de création est requise' })}
              error={errors.date_creation?.message}
              fullWidth
            />
          </div>
          
          {/* Map Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-primary-600" />
              <h3 className="text-lg font-medium text-gray-800">Coordonnées géographiques</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Utilisez la carte pour définir les limites de la parcelle. Cliquez pour ajouter des points et former un polygone.
            </p>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Carte interactive à implémenter</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            icon={<ChevronLeft size={16} />}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="success" 
            isLoading={loading}
            icon={<Save size={16} />}
          >
            Enregistrer
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ParcelleForm;