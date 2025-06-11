
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React, { useState } from 'react'
import { Button } from "../ui/button"
import { Plus, X } from "lucide-react"
import { Input } from "../ui/input"

// Interface pour les pièces jointes
interface PieceJointe {
  id: string
  nom: string
  fichier: File | null
}

export const PieceJointeDialog = ({ 
  piecesJointes, 
  onPiecesJointesChange 
}: { 
  piecesJointes: PieceJointe[]
  onPiecesJointesChange: (pieces: PieceJointe[]) => void 
}) => {
  const [open, setOpen] = useState(false)
  const [newPiece, setNewPiece] = useState<{ nom: string; fichier: File | null }>({
    nom: "",
    fichier: null
  })

  const handleAddPiece = () => {
    if (newPiece.nom && newPiece.fichier) {
      const nouvellePiece: PieceJointe = {
        id: Date.now().toString(),
        nom: newPiece.nom,
        fichier: newPiece.fichier
      }
      onPiecesJointesChange([...piecesJointes, nouvellePiece])
      setNewPiece({ nom: "", fichier: null })
      setOpen(false)
    }
  }

  const handleRemovePiece = (id: string) => {
    onPiecesJointesChange(piecesJointes.filter(piece => piece.id !== id))
  }

  const resetForm = () => {
    setNewPiece({ nom: "", fichier: null })
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            className="h-12 w-full border-dashed border-2 border-gray-300 hover:border-gray-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une pièce jointe
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une pièce jointe</DialogTitle>
            <DialogDescription>
              Renseignez le nom et sélectionnez le fichier à joindre.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom de la pièce jointe <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="ex. Certificat d'entreprise"
                value={newPiece.nom}
                onChange={(e) => setNewPiece(prev => ({ ...prev, nom: e.target.value }))}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fichier <span className="text-red-500">*</span>
              </label>
              <Input
                type="file"
                onChange={(e) => setNewPiece(prev => ({ 
                  ...prev, 
                  fichier: e.target.files?.[0] || null 
                }))}
                className="h-12"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleAddPiece}
              disabled={!newPiece.nom || !newPiece.fichier}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {piecesJointes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            {piecesJointes.length} pièce{piecesJointes.length > 1 ? 's' : ''} jointe{piecesJointes.length > 1 ? 's' : ''}
          </p>
          {piecesJointes.map((piece) => (
            <div key={piece.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{piece.nom}</span>
                <span className="text-xs text-gray-500">{piece.fichier?.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemovePiece(piece.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}