import React, { useEffect, useState } from "react";
import { Search, BookOpen, Plus } from "lucide-react";
import {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deactivateMealPlan,
} from "../api/mealPlans.js";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Input from "../components/Input.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatCurrency } from "../lib/format.js";

const BTN =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SM = `${BTN} h-8 px-3 text-xs`;
const BTN_MD = `${BTN} h-10 px-4 text-sm`;
const BTN_PRIMARY = "bg-primary text-white hover:bg-primary-dark";
const BTN_OUTLINE = "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
const BTN_DANGER = "border border-red-200 bg-white text-red-600 hover:bg-red-50";
const TEXTAREA =
  "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-50 disabled:text-slate-400";
const LABEL = "block text-sm font-medium text-slate-700";

const Spinner = () => (
  <span
    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
    aria-hidden="true"
  />
);

const MealPlanForm = ({ initial, onSave, onCancel }) => {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [credits, setCredits] = useState(initial?.credits !== undefined ? String(initial.credits) : "");
  const [pricePerCredit, setPricePerCredit] = useState(
    initial?.pricePerCredit !== undefined && initial?.pricePerCredit !== null
      ? String(initial.pricePerCredit)
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const creditsNum = Number(credits);
    if (credits === "" || Number.isNaN(creditsNum) || creditsNum <= 0) {
      setError("Credits must be a number greater than 0");
      return;
    }
    const priceNum = Number(pricePerCredit);
    if (pricePerCredit === "" || Number.isNaN(priceNum) || priceNum < 0) {
      setError("Price per credit must be a valid number");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        credits: creditsNum,
        pricePerCredit: priceNum,
      };
      if (initial?.id) {
        await updateMealPlan(initial.id, payload);
      } else {
        await createMealPlan(payload);
      }
      onSave();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save meal plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="meal-plan-name" className={LABEL}>Name</label>
        <Input
          id="meal-plan-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekly Plan"
          disabled={saving}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="meal-plan-description" className={LABEL}>Description</label>
        <textarea
          id="meal-plan-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          disabled={saving}
          rows={3}
          className={TEXTAREA}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="meal-plan-credits" className={LABEL}>Credits</label>
          <Input
            id="meal-plan-credits"
            type="number"
            min="1"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="10"
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="meal-plan-price" className={LABEL}>Price per credit (FCFA)</label>
          <Input
            id="meal-plan-price"
            type="number"
            min="0"
            step="0.01"
            value={pricePerCredit}
            onChange={(e) => setPricePerCredit(e.target.value)}
            placeholder="100"
            disabled={saving}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} disabled={saving} className={`${BTN_MD} ${BTN_OUTLINE}`}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={`${BTN_MD} ${BTN_PRIMARY}`}>
          {saving && <Spinner />}
          {initial?.id ? "Save changes" : "Create plan"}
        </button>
      </div>
    </form>
  );
};

const MealPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMealPlans();
      setPlans(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load meal plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deactivateMealPlan(deleteTarget.id);
      setDeleteTarget(null);
      setConfirmingDelete(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to deactivate meal plan.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = plans.filter((plan) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      plan.name?.toLowerCase().includes(q) || (plan.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <PageHeader
        title="Meal Plans"
        subtitle="Define the meal-credit plans students can subscribe to."
        action={
          <button type="button" onClick={openCreate} className={`${BTN_MD} ${BTN_PRIMARY}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New plan
          </button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {loading ? "Loading…" : `${filtered.length} active plans`}
        </span>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search plans…"
            aria-label="Search meal plans"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading meal plans…" />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="info"
            title="No meal plans"
            message={query ? "No plans match your search." : "Create your first meal plan so students can subscribe."}
            action={
              !query ? (
                <button type="button" onClick={openCreate} className={`${BTN_MD} ${BTN_PRIMARY}`}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create plan
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Plan</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Credits</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Price / credit</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Total</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((plan) => {
                  const credits = Number(plan.credits) || 0;
                  const price = Number(plan.pricePerCredit) || 0;
                  return (
                    <tr key={plan.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{plan.name}</p>
                            <p className="max-w-[280px] truncate text-[11px] text-slate-400">
                              {plan.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabular-nums">
                          {credits}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 tabular-nums">{formatCurrency(price)}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(credits * price)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={plan.isActive ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => openEdit(plan)} className={`${BTN_SM} ${BTN_OUTLINE}`}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(plan);
                              setConfirmingDelete(true);
                            }}
                            className={`${BTN_SM} ${BTN_DANGER}`}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit meal plan" : "Create meal plan"}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <MealPlanForm
          initial={editing}
          onSave={handleSaved}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmingDelete}
        title="Deactivate this plan?"
        message="The plan will be hidden from new subscriptions. Existing subscriptions are not affected."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmingDelete(false);
          setDeleteTarget(null);
        }}
        confirmVariant="danger"
        disabled={deleting}
      />
    </div>
  );
};

export default MealPlans;