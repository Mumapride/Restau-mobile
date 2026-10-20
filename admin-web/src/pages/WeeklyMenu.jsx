import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Plus, Edit2, Trash2, X, CalendarDays } from "lucide-react";
import {
  createMenuSchedule,
  deleteMenuSchedule,
  getMenuSchedules,
  updateMenuSchedule,
} from "../api/menuSchedules.js";
import { getActiveSemester } from "../api/semesters.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Input from "../components/Input.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { getErrorMessage } from "../lib/error.js";
import { toDateInputValue } from "../lib/format.js";

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

const DAY_LABELS = {
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};
const DAY_INDEX_OF = { 2: "TUESDAY", 3: "WEDNESDAY", 4: "THURSDAY", 5: "FRIDAY" };

/** Tuesday of the Monday-start week containing `date`, computed in local time (no TZ shift). */
function getWeekTuesday(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0); // local noon, avoids timezone off-by-one
  const day = d.getDay(); // Sun=0, Mon=1, ..., Sat=6
  const daysBackToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysBackToMonday); // Monday of this week
  d.setDate(d.getDate() + 1); // Tuesday of this week
  return d;
}

/** Format a stored "YYYY-MM-DD" date without any timezone shift. */
function formatLocalDate(isoDate) {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getWeekDates(selectedDate) {
  const tuesday = getWeekTuesday(selectedDate || new Date());
  return [0, 1, 2, 3].map((offset) => {
    const d = new Date(tuesday);
    d.setDate(tuesday.getDate() + offset);
    const dayOfWeek = DAY_INDEX_OF[d.getDay()];
    return {
      dayOfWeek,
      date: toDateInputValue(d),
      label: DAY_LABELS[dayOfWeek],
    };
  });
}

export default function WeeklyMenu() {
  const [schedules, setSchedules] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(toDateInputValue(new Date()));

  const weekDates = useMemo(() => getWeekDates(selectedWeek), [selectedWeek]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mealName, setMealName] = useState("");
  const [mealDate, setMealDate] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormError("");
  };

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    let semester = null;
    try {
      semester = await getActiveSemester().catch(() => null);
      const data = await getMenuSchedules();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setSchedules([]);
      setError(getErrorMessage(err));
    } finally {
      setActiveSemester(semester);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const scheduleFor = (dayOfWeek) => schedules.find((s) => s.day === dayOfWeek);

  const openAdd = (presetDate = weekDates[0]?.date || "") => {
    setEditing(null);
    setMealName("");
    setMealDate(presetDate);
    setDescription("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    const weekDay = weekDates.find((wd) => wd.dayOfWeek === item.day);
    setEditing(item);
    setMealName(item.mealName);
    setMealDate(weekDay ? weekDay.date : "");
    setDescription(item.description || "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!mealName.trim()) {
      setFormError("Meal name is required.");
      return;
    }
    if (!mealDate) {
      setFormError("Meal date is required.");
      return;
    }
    const [y, m, day] = mealDate.split("-").map(Number);
    const d = new Date(y, m - 1, day); // local calendar date, no TZ shift
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day) || Number.isNaN(d.getTime())) {
      setFormError("Invalid meal date.");
      return;
    }
    const dayOfWeek = DAY_INDEX_OF[d.getDay()];
    if (!dayOfWeek) {
      setFormError("Meals can only be scheduled Tuesday through Friday.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        dayOfWeek,
        mealName: mealName.trim(),
        description: description.trim() || null,
      };
      if (editing?.id) {
        await updateMenuSchedule(editing.id, payload);
        showToast("success", "Meal updated successfully.");
      } else {
        await createMenuSchedule(payload);
        showToast("success", "Meal added successfully.");
      }
      closeModal();
      await loadSchedules();
    } catch (err) {
      setFormError(err?.response?.data?.message || getErrorMessage(err) || "Unable to save meal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenuSchedule(deleteTarget.id);
      showToast("success", "Meal deleted successfully.");
      setConfirmingDelete(false);
      setDeleteTarget(null);
      await loadSchedules();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <PageHeader
        title="Weekly Menu"
        subtitle="Administrators schedule the meals served to students each service day (Tuesday – Friday)."
        action={
          <button type="button" onClick={() => openAdd()} className={`${BTN_MD} ${BTN_PRIMARY}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add meal
          </button>
        }
      />

      {/* Week selector + summary */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <label htmlFor="week-selector" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Select week
          </label>
          <Input
            id="week-selector"
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-44"
          />
          {activeSemester ? (
            <p className="text-xs text-slate-500">Active semester: {activeSemester.name}</p>
          ) : (
            <p className="text-xs font-medium text-red-600">
              No active semester. Create and activate a semester before scheduling meals.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 sm:text-right">
          <div>
            <p className="text-xs font-medium text-slate-500">Scheduled meals</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{schedules.length}</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">of 4 service days</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Meals repeat weekly on their scheduled day (Tuesday–Friday). Dates shown are for the selected week and advance
        automatically each week.
      </p>

      {loading ? (
        <LoadingState message="Loading menu…" />
      ) : error ? (
        <ErrorState title="Unable to load the menu" message={error} />
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="warning"
            title="No meals scheduled yet"
            message="Use Add meal to schedule a meal for a service day (Tuesday–Friday)."
            action={
              <button type="button" onClick={() => openAdd()} className={`${BTN_MD} ${BTN_PRIMARY}`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add meal
              </button>
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Day</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Date</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Meal</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weekDates.map((wd) => {
                  const meal = scheduleFor(wd.dayOfWeek);
                  return (
                    <tr key={wd.dayOfWeek} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                          <CalendarDays className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          {wd.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 tabular-nums">
                        {formatLocalDate(wd.date)}
                      </td>
                      <td className="px-4 py-3">
                        {meal ? (
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{meal.mealName}</p>
                            {meal.description && (
                              <p className="truncate text-[11px] text-slate-400">{meal.description}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-400">Not scheduled</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {meal ? (
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <button type="button" onClick={() => openEdit(meal)} className={`${BTN_SM} ${BTN_OUTLINE}`}>
                              <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(meal);
                                setConfirmingDelete(true);
                              }}
                              className={`${BTN_SM} ${BTN_DANGER}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button type="button" onClick={() => openAdd(wd.date)} className={`${BTN_SM} ${BTN_OUTLINE}`}>
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              Add
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? "Edit meal" : "Add meal"} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="meal-name" className={LABEL}>Meal name</label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g. Grilled chicken with rice"
              disabled={saving}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="meal-date" className={LABEL}>Meal date</label>
            <Input
              id="meal-date"
              type="date"
              value={mealDate}
              onChange={(e) => setMealDate(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-slate-500">Choose any Tuesday–Friday. The meal repeats weekly on that day.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="meal-description" className={LABEL}>Description</label>
            <textarea
              id="meal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              rows={3}
              disabled={saving}
              className={TEXTAREA}
            />
          </div>

          {formError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-red-700">{formError}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={closeModal} disabled={saving} className={`${BTN_MD} ${BTN_OUTLINE}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`${BTN_MD} ${BTN_PRIMARY}`}>
              {saving && <Spinner />}
              {editing ? "Save changes" : "Save meal"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this meal?"
        message="The scheduled meal will be removed and students will no longer see it."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmingDelete(false);
          setDeleteTarget(null);
        }}
        confirmVariant="danger"
        disabled={deleting}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${
            toast.type === "success" ? "border-emerald-200" : "border-red-200"
          }`}
          role="alert"
          aria-live="polite"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          )}
          <p className="min-w-0 flex-1 text-sm font-medium text-slate-900">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}