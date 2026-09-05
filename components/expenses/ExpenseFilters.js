"use client";

export default function ExpenseFilters({ users, categories, userId, categoryId, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <FilterPill active={!userId} onClick={() => onChange({ userId: "" })}>
          Toutes
        </FilterPill>
        {users?.map((u) => (
          <FilterPill key={u.id} active={userId === u.id} onClick={() => onChange({ userId: u.id })}>
            {u.name}
          </FilterPill>
        ))}
      </div>

      <select
        value={categoryId || ""}
        onChange={(e) => onChange({ categoryId: e.target.value })}
        className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
      >
        <option value="">Toutes les catégories</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-neutral-900 text-white" : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}
