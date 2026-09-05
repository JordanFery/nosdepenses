"use client";

async function handle(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // pas de corps JSON (ex: 204)
  }

  if (!response.ok) {
    const error = new Error(body?.error || "Une erreur est survenue.");
    error.status = response.status;
    error.errors = body?.errors || {};
    throw error;
  }

  return body?.data;
}

export function fetchStats(month) {
  return fetch(`/api/stats?month=${month}`, { cache: "no-store" }).then(handle);
}

export function fetchExpenses({ month, userId, categoryId }) {
  const params = new URLSearchParams({ month });
  if (userId) params.set("userId", userId);
  if (categoryId) params.set("categoryId", categoryId);
  return fetch(`/api/expenses?${params.toString()}`, { cache: "no-store" }).then(async (res) => {
    const body = await res.json();
    if (!res.ok) {
      const error = new Error(body?.error || "Une erreur est survenue.");
      error.status = res.status;
      throw error;
    }
    return body;
  });
}

export function fetchUsers() {
  return fetch("/api/users", { cache: "no-store" }).then(handle);
}

export function fetchCategories() {
  return fetch("/api/categories", { cache: "no-store" }).then(handle);
}

export function createExpense(data) {
  return fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateExpense(id, data) {
  return fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteExpense(id) {
  return fetch(`/api/expenses/${id}`, { method: "DELETE" }).then(handle);
}

export function createCategory(data) {
  return fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateCategory(id, data) {
  return fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteCategory(id) {
  return fetch(`/api/categories/${id}`, { method: "DELETE" }).then(handle);
}
