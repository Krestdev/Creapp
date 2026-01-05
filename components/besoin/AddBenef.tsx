"use client";

import { useEffect, useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Beneficiaire = {
  id: number;
  nom: string;
  montant: number;
};

interface BeneficiairesListProps {
  onBeneficiairesChange?: (beneficiaires: Beneficiaire[]) => void;
  initialBeneficiaires: Beneficiaire[];
}

export default function BeneficiairesList({
  onBeneficiairesChange,
  initialBeneficiaires,
}: BeneficiairesListProps) {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>(
    initialBeneficiaires ?? []
  );
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ nom?: string; montant?: string }>({});

  useEffect(() => {
    setBeneficiaires(initialBeneficiaires);
  }, [initialBeneficiaires]);

  const validateForm = () => {
    const newErrors: { nom?: string; montant?: string } = {};

    if (!nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!montant.trim()) {
      newErrors.montant = "Le montant est requis";
    } else {
      const montantValue = parseFloat(montant);
      if (isNaN(montantValue) || montantValue <= 0) {
        newErrors.montant = "Le montant doit être un nombre positif";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const montantValue = parseFloat(montant);

    if (editingId !== null) {
      // Mettre à jour un bénéficiaire existant
      const updatedBeneficiaires = beneficiaires.map((b) =>
        b.id === editingId ? { ...b, nom, montant: montantValue } : b
      );
      setBeneficiaires(updatedBeneficiaires);
      onBeneficiairesChange?.(updatedBeneficiaires);
      setEditingId(null);
    } else {
      // Ajouter un nouveau bénéficiaire
      const newBeneficiaire: Beneficiaire = {
        id: Date.now(),
        nom,
        montant: montantValue,
      };
      const newBeneficiaires = [...beneficiaires, newBeneficiaire];
      setBeneficiaires(newBeneficiaires);
      onBeneficiairesChange?.(newBeneficiaires);
    }

    // Réinitialiser le formulaire
    setNom("");
    setMontant("");
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (beneficiaire: Beneficiaire) => {
    setNom(beneficiaire.nom);
    setMontant(beneficiaire.montant.toString());
    setEditingId(beneficiaire.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (id: number) => {
    const newBeneficiaires = beneficiaires.filter((b) => b.id !== id);
    setBeneficiaires(newBeneficiaires);
    onBeneficiairesChange?.(newBeneficiaires);
  };

  const totalMontant = beneficiaires.reduce((sum, b) => sum + b.montant, 0);

  const handleCancel = () => {
    setShowForm(false);
    setNom("");
    setMontant("");
    setEditingId(null);
    setErrors({});
  };

  return (
    <div className="col-span-2">
      <div className="flex flex-col justify-between">
        <div>
          <Label className="text-base font-medium">
            {"Pour le compte de:"}
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        {/* Liste des bénéficiaires */}
        {beneficiaires.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {beneficiaires.map((beneficiaire) => (
                    <tr key={beneficiaire.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {beneficiaire.nom}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {beneficiaire.montant.toLocaleString()} FCFA
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(beneficiaire)}
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(beneficiaire.id)}
                            title="Supprimer"
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">
                      {totalMontant.toLocaleString()} FCFA
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : null}
        {/* Formulaire */}
        {showForm && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du bénéficiaire *</Label>
                  <Input
                    type="text"
                    id="nom"
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      if (errors.nom) setErrors({ ...errors, nom: undefined });
                    }}
                    placeholder="Entrez le nom"
                    className={errors.nom ? "border-red-500" : ""}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-500">{errors.nom}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="montant"
                      value={montant}
                      onChange={(e) => {
                        setMontant(e.target.value);
                        if (errors.montant)
                          setErrors({ ...errors, montant: undefined });
                      }}
                      placeholder="0"
                      min="0"
                      step="1"
                      className={`pr-10 ${
                        errors.montant ? "border-red-500" : ""
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      FCFA
                    </span>
                  </div>
                  {errors.montant && (
                    <p className="text-sm text-red-500">{errors.montant}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleSubmit} variant="default">
                  {editingId !== null ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 w-full"
        >
          <Plus size={16} />
          {showForm ? "Annuler" : "Ajouter un bénéficiaire"}
        </Button>
      </div>
    </div>
  );
}
