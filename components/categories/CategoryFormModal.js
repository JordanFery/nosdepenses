"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CategoryIcon, ICON_NAMES } from "@/lib/icons";
import { createCategory, updateCategory } from "@/lib/api-client";

export default function CategoryFormModal({ open, onClose, onSaved, category }) {
  const isEditing = Boolean(category);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- réinitialise le formulaire à l'ouverture
    setName(category?.name || "");
    setIcon(category?.icon || "Tag");
    setError("");
  }, [open, category]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEditing) {
        await updateCategory(category.id, { name: name.trim(), icon });
      } else {
        await createCategory({ name: name.trim(), icon });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.errors?.name || err.message || "Impossible d'enregistrer la catégorie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Modifier la catégorie" : "Nouvelle catégorie"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEditing ? "Enregistrer" : "Ajouter"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nom</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Icône</label>
          <div className="grid grid-cols-5 gap-2">
            {ICON_NAMES.map((iconName) => (
              <button
                type="button"
                key={iconName}
                onClick={() => setIcon(iconName)}
                className={`flex items-center justify-center rounded-xl border py-2.5 transition-colors ${
                  icon === iconName
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                }`}
              >
                <CategoryIcon name={iconName} size={18} />
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
