"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchCategories, deleteCategory } from "@/lib/api-client";
import { CategoryIcon } from "@/lib/icons";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CategoryFormModal from "@/components/categories/CategoryFormModal";
import { SkeletonBlock } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/States";

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Impossible de charger les catégories.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial au montage
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteCategory(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setDeleteError(err.message || "Impossible de supprimer cette catégorie.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Catégories</h1>
          <p className="text-sm text-neutral-500">Gérez les catégories de dépenses du foyer.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} />
          Ajouter
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <CategoryIcon name={cat.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900">{cat.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={() => {
                    setEditing(cat);
                    setFormOpen(true);
                  }}
                  aria-label="Modifier"
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    setDeleteError("");
                    setDeleting(cat);
                  }}
                  aria-label="Supprimer"
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        category={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer cette catégorie ?"
        message={
          deleteError ||
          "Cette action est irréversible. Une catégorie utilisée par des dépenses existantes ne peut pas être supprimée."
        }
        confirmLabel="Supprimer"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
