import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, Save } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { supabase } from '../../lib/supabase';
import { Activite, TypeActivite } from '../../types/models';

interface NewActivityFormProps {
  parcelleId: number;
  onSave: (activity: Activite) => void;
  onCancel: () => void;
  existingActivity?: Activite;
}

const NewActivityForm = ({ parcelleId, onSave, onCancel, existingActivity }: NewActivityFormProps) => {
  const [loading, setLoading] = useState(false);
  const [activityTypes, setActivityTypes] = useState<TypeActivite[]>([]);
  const [selectedType, setSelectedType] = useState<string>(existingActivity?.type_activite_id.toString() || '');
  
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: existingActivity || {
      parcelle_id: parcelleId,
      date_activite: new Date().toISOString().split('T')[0],
      operateur: '',
      commentaire_general: '',
      zone_concernee: '',
      details: {}
    }
  });
  
  // Fetch activity types on mount
  useState(() => {
    const fetchActivityTypes = async () => {
      const { data } = await supabase
        .from('type_activite')
        .select('*')
        .order('libelle');
      
      if (data) {
        setActivityTypes(data);
        if (existingActivity) {
          setSelectedType(existingActivity.type_activite_id.toString());
        }
      }
    };
    
    fetchActivityTypes();
  });
  
  const onSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      const details = prepareDetailsObject(selectedType, data.details || {});
      
      const activityData = {
        parcelle_id: parcelleId,
        type_activite_id: parseInt(selectedType),
        date_activite: data.date_activite,
        operateur: data.operateur,
        commentaire_general: data.commentaire_general,
        zone_concernee: data.zone_concernee,
        details
      };
      
      let result;
      
      if (existingActivity) {
        const { data: updatedActivity, error } = await supabase
          .from('activite')
          .update(activityData)
          .eq('activite_id', existingActivity.activite_id)
          .select(`
            *,
            typeActivite:type_activite_id(*)
          `)
          .single();
          
        if (error) throw error;
        result = updatedActivity;
        toast.success('Activité mise à jour avec succès !');
      } else {
        const { data: newActivity, error } = await supabase
          .from('activite')
          .insert(activityData)
          .select(`
            *,
            typeActivite:type_activite_id(*)
          `)
          .single();
          
        if (error) throw error;
        result = newActivity;
        toast.success('Activité ajoutée avec succès !');
      }
      
      onSave(result as Activite);
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'activité');
    } finally {
      setLoading(false);
    }
  };
  
  const prepareDetailsObject = (typeId: string, formData: any) => {
    switch (getActivityTypeCode(typeId)) {
      case 'PLANTATION':
        return {
          fournisseur: formData.fournisseur || '',
          nbr_plants: parseInt(formData.nbr_plants) || 0,
          variete: formData.variete || '',
          prix_unitaire: parseFloat(formData.prix_unitaire) || 0,
          zone_precise: formData.zone_precise || ''
        };
      case 'FERTILISATION':
        return {
          type_engrais: formData.type_engrais || '',
          dose_kg_ha: parseFloat(formData.dose_kg_ha) || 0,
          quantite_totale_kg: parseFloat(formData.quantite_totale_kg) || 0,
          commentaire_fertil: formData.commentaire_fertil || ''
        };
      case 'PHYTOSANITAIRE':
        return {
          produit_utilise: formData.produit_utilise || '',
          dosage_l_ha: parseFloat(formData.dosage_l_ha) || 0,
          zone_ciblee: formData.zone_ciblee || '',
          commentaire_phytosan: formData.commentaire_phytosan || ''
        };
      case 'IRRIGATION':
        return {
          type_irrigation: formData.type_irrigation || '',
          duree_minutes: parseInt(formData.duree_minutes) || 0,
          frequence_semaine: parseInt(formData.frequence_semaine) || 0
        };
      case 'DESHERBAGE':
        return {
          methode: formData.methode || '',
          frequence_mois: parseInt(formData.frequence_mois) || 0,
          operateur_detail: formData.operateur_detail || ''
        };
      case 'RECOLTE':
        return {
          nbr_arbres: parseInt(formData.nbr_arbres) || 0,
          taille_moy_cm: parseInt(formData.taille_moy_cm) || 0,
          destination: formData.destination || '',
          qualite: formData.qualite || ''
        };
      case 'OBSERVATION':
        return {
          texte_observation: formData.texte_observation || '',
          photo_url: formData.photo_url || ''
        };
      default:
        return {};
    }
  };
  
  const getActivityTypeCode = (typeId: string): string => {
    const type = activityTypes.find(t => t.type_activite_id.toString() === typeId);
    return type?.code || '';
  };
  
  const renderDynamicFields = () => {
    if (!selectedType) return null;
    
    const typeCode = getActivityTypeCode(selectedType);
    
    switch (typeCode) {
      case 'PLANTATION':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails de la plantation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fournisseur"
                {...register('details.fournisseur', { required: 'Ce champ est requis' })}
                error={errors.details?.fournisseur?.message}
                fullWidth
              />
              <Input
                label="Nombre de plants"
                type="number"
                {...register('details.nbr_plants', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Doit être supérieur à 0' }
                })}
                error={errors.details?.nbr_plants?.message}
                fullWidth
              />
              <Input
                label="Variété"
                {...register('details.variete', { required: 'Ce champ est requis' })}
                error={errors.details?.variete?.message}
                fullWidth
              />
              <Input
                label="Prix unitaire (€)"
                type="number"
                step="0.01"
                {...register('details.prix_unitaire', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.prix_unitaire?.message}
                fullWidth
              />
              <div className="md:col-span-2">
                <Input
                  label="Zone précise"
                  {...register('details.zone_precise')}
                  fullWidth
                />
              </div>
            </div>
          </>
        );
      case 'FERTILISATION':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails de la fertilisation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Type d'engrais"
                {...register('details.type_engrais', { required: 'Ce champ est requis' })}
                error={errors.details?.type_engrais?.message}
                fullWidth
              />
              <Input
                label="Dose (kg/ha)"
                type="number"
                step="0.01"
                {...register('details.dose_kg_ha', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.dose_kg_ha?.message}
                fullWidth
              />
              <Input
                label="Quantité totale (kg)"
                type="number"
                step="0.01"
                {...register('details.quantite_totale_kg', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.quantite_totale_kg?.message}
                fullWidth
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  {...register('details.commentaire_fertil')}
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
                  rows={3}
                />
              </div>
            </div>
          </>
        );
      case 'PHYTOSANITAIRE':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails du traitement phytosanitaire</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Produit utilisé"
                {...register('details.produit_utilise', { required: 'Ce champ est requis' })}
                error={errors.details?.produit_utilise?.message}
                fullWidth
              />
              <Input
                label="Dosage (L/ha)"
                type="number"
                step="0.01"
                {...register('details.dosage_l_ha', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.dosage_l_ha?.message}
                fullWidth
              />
              <Input
                label="Zone ciblée"
                {...register('details.zone_ciblee')}
                fullWidth
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  {...register('details.commentaire_phytosan')}
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
                  rows={3}
                />
              </div>
            </div>
          </>
        );
      case 'IRRIGATION':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails de l'irrigation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Type d'irrigation"
                {...register('details.type_irrigation', { required: 'Ce champ est requis' })}
                error={errors.details?.type_irrigation?.message}
                fullWidth
              />
              <Input
                label="Durée (minutes)"
                type="number"
                {...register('details.duree_minutes', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.duree_minutes?.message}
                fullWidth
              />
              <Input
                label="Fréquence (par semaine)"
                type="number"
                {...register('details.frequence_semaine', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.frequence_semaine?.message}
                fullWidth
              />
            </div>
          </>
        );
      case 'DESHERBAGE':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails du désherbage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Méthode"
                {...register('details.methode', { required: 'Ce champ est requis' })}
                error={errors.details?.methode?.message}
                fullWidth
              />
              <Input
                label="Fréquence (par mois)"
                type="number"
                {...register('details.frequence_mois', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.frequence_mois?.message}
                fullWidth
              />
              <Input
                label="Opérateur détaillé"
                {...register('details.operateur_detail')}
                fullWidth
              />
            </div>
          </>
        );
      case 'RECOLTE':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails de la récolte</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre d'arbres"
                type="number"
                {...register('details.nbr_arbres', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Doit être supérieur à 0' }
                })}
                error={errors.details?.nbr_arbres?.message}
                fullWidth
              />
              <Input
                label="Taille moyenne (cm)"
                type="number"
                {...register('details.taille_moy_cm', { 
                  required: 'Ce champ est requis',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ne peut pas être négatif' }
                })}
                error={errors.details?.taille_moy_cm?.message}
                fullWidth
              />
              <Input
                label="Destination"
                {...register('details.destination', { required: 'Ce champ est requis' })}
                error={errors.details?.destination?.message}
                fullWidth
              />
              <Input
                label="Qualité"
                {...register('details.qualite', { required: 'Ce champ est requis' })}
                error={errors.details?.qualite?.message}
                fullWidth
              />
            </div>
          </>
        );
      case 'OBSERVATION':
        return (
          <>
            <h4 className="font-medium text-gray-700 mb-3">Détails de l'observation</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observation
                </label>
                <textarea
                  {...register('details.texte_observation', { required: 'Ce champ est requis' })}
                  className={`w-full rounded-md border ${errors.details?.texte_observation ? 'border-error-500' : 'border-gray-300'} shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500`}
                  rows={4}
                />
                {errors.details?.texte_observation && (
                  <p className="mt-1 text-sm text-error-500">{errors.details?.texte_observation.message}</p>
                )}
              </div>
              <Input
                label="URL de la photo"
                {...register('details.photo_url')}
                fullWidth
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader 
          title={existingActivity ? "Modifier l'activité" : "Ajouter une activité"} 
          subtitle="Remplissez les champs ci-dessous pour enregistrer l'activité"
        />
        <CardContent className="space-y-6">
          {/* Activity Type Selection */}
          <div>
            <Controller
              name="type_activite_id"
              control={control}
              rules={{ required: 'Veuillez sélectionner un type d\'activité' }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Type d'activité"
                  options={activityTypes.map(type => ({ value: type.type_activite_id.toString(), label: type.libelle }))}
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    field.onChange(e);
                  }}
                  error={error?.message}
                  fullWidth
                  placeholder="Sélectionnez un type d'activité"
                />
              )}
            />
          </div>
          
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date de l'activité"
              type="date"
              {...register('date_activite', { required: 'Ce champ est requis' })}
              error={errors.date_activite?.message}
              fullWidth
            />
            <Input
              label="Opérateur"
              {...register('operateur', { required: 'Ce champ est requis' })}
              error={errors.operateur?.message}
              fullWidth
            />
            <Input
              label="Zone concernée"
              {...register('zone_concernee')}
              fullWidth
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire général
              </label>
              <textarea
                {...register('commentaire_general')}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
                rows={3}
              />
            </div>
          </div>
          
          {/* Dynamic Fields based on activity type */}
          {selectedType && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              {renderDynamicFields()}
            </div>
          )}
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

export default NewActivityForm;