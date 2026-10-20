import React, { useEffect, useState, useRef } from "react";
import { CalendarDays, CalendarCheck, CalendarX, Hourglass, Plus } from "lucide-react";
import {
  getActiveSemester,
  createSemester,
  updateSemester,
  closeSemester,
} from "../api/semesters.js";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Input from "../components/Input.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate, toDateInputValue } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const BTN =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_MD = `${BTN} h-10 px-4 text-sm`;
const BTN_PRIMARY = "bg-primary text-white hover:bg-primary-dark";
const BTN_OUTLINE = "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
const BTN_DANGER = "border border-red-200 bg-white text-red-600 hover:bg-red-50";
const LABEL = "block text-sm font-medium text-slate-700";

const Spinner = () => (
  <span
    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
    aria-hidden="true"
  />
);

const DAY_MS = 86400000;

// Display-only helper: how far along the semester is, based on its dates.
const getProgress = (semester) => {
  const start = new Date(semester?.startDate).getTime();
  const end = new Date(semester?.endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  const totalDays = Math.max(1, Math.round((end - start) / DAY_MS) + 1);
  const now = Date.now();
  let elapsed = Math.floor((now - start) / DAY_MS) + 1;
  elapsed = Math.min(Math.max(elapsed, 0), totalDays);
  const pct = Math.round((elapsed / totalDays) * 100);
  let label = `Day ${elapsed} of ${totalDays}`;
  if (now < start) label = "Not started yet";
  else if (now > end + DAY_MS) label = "Ended";
  return { totalDays, pct, label };
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3.5 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-900 tabular-nums">{value}</p>
    </div>
  </div>
);

const SemesterForm = ({ initial, onSave, onCancel }) => {
  const [name, setName] = useState(initial?.name || "");
  const [startDate, setStartDate] = useState(initial?.startDate ? toDateInputValue(initial.startDate) : "");
  const [endDate, setEndDate] = useState(initial?.endDate ? toDateInputValue(initial.endDate) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Semester name is required");
      return;
    }
    if (!startDate) {
      setError("Start date is required");
      return;
    }
    if (!endDate) {
      setError("End date is required");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after the start date");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };
      let savedMsg = "Semester saved.";
      if (initial?.id) {
        const res = await updateSemester(initial.id, payload);
        savedMsg = res?.message || "Semester updated.";
      } else {
        const res = await createSemester(payload);
        savedMsg = res?.message || "Semester created.";
      }
      onSave(savedMsg);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save semester.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="semester-name" className={LABEL}>Name</label>
        <Input
          id="semester-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fall 2026"
          disabled={saving}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="semester-start-date" className={LABEL}>Start date</label>
          <Input
            id="semester-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="semester-end-date" className={LABEL}>End date</label>
          <Input
            id="semester-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
          {initial?.id ? "Save changes" : "Create semester"}
        </button>
      </div>
    </form>
  );
};

const Semesters = () => {
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Guards against overlapping / out-of-order load responses.
  const requestId = useRef(0);

  const load = async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await getActiveSemester();
      if (id !== requestId.current) return;
      setSemester(data);
      setError("");
    } catch (err) {
      // 404 simply means there is no active semester yet.
      if (id !== requestId.current) return;
      setSemester(null);
      if (err?.response?.status && err.response.status !== 404) {
        setError(getErrorMessage(err));
      } else {
        setError("");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = (msg) => {
    setModalOpen(false);
    setEditing(false);
    setError("");
    setSuccess(msg || "Semester saved.");
    load();
  };

  const handleClose = async () => {
    if (!closeTarget) return;
    setClosing(true);
    try {
      await closeSemester(closeTarget.id);
      setSemester(null);
      setCloseTarget(null);
      setConfirmingClose(false);
      setError("");
      setSuccess("Semester closed.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to close semester.");
    } finally {
      setClosing(false);
    }
  };

  const openCreate = () => {
    setEditing(false);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <LoadingState message="Loading semester…" />
      </div>
    );
  }

  const progress = semester ? getProgress(semester) : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <PageHeader
        title="Semesters"
        subtitle="Create and manage the active academic semester."
        action={
          <button type="button" onClick={openCreate} className={`${BTN_MD} ${BTN_PRIMARY}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New semester
          </button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5"
          role="status"
          aria-live="polite"
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          <p className="text-sm font-medium text-emerald-800">{success}</p>
        </div>
      )}

      {!semester ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-8">
          <EmptyState
            icon="info"
            title="No active semester"
            message="Create a semester to enable meal-plan enrollment and meal claims."
            action={
              <button type="button" onClick={openCreate} className={`${BTN_MD} ${BTN_PRIMARY}`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create semester
              </button>
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CalendarDays className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{semester.name}</h2>
                  <StatusBadge status={semester.isActive ? "ACTIVE" : "INACTIVE"} />
                </div>
                <p className="mt-0.5 text-sm text-slate-500 tabular-nums">
                  {formatDate(semester.startDate)} – {formatDate(semester.endDate)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setModalOpen(true);
                }}
                className={`${BTN_MD} ${BTN_OUTLINE}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setCloseTarget(semester);
                  setConfirmingClose(true);
                }}
                className={`${BTN_MD} ${BTN_DANGER}`}
              >
                Close semester
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="border-t border-slate-100 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoTile icon={CalendarCheck} label="Start date" value={formatDate(semester.startDate)} />
              <InfoTile icon={CalendarX} label="End date" value={formatDate(semester.endDate)} />
              <InfoTile icon={Hourglass} label="Duration" value={progress ? `${progress.totalDays} days` : "—"} />
            </div>

            {progress && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{progress.label}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{progress.pct}%</span>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={progress.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Semester progress"
                >
                  <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress.pct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit semester" : "Create semester"}
        onClose={() => {
          setModalOpen(false);
          setError("");
        }}
      >
        <SemesterForm
          initial={editing ? semester : null}
          onSave={handleSaved}
          onCancel={() => {
            setModalOpen(false);
            setError("");
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmingClose}
        title="Close this semester?"
        message="Closing this semester prevents new meal-plan enrollments for it. Existing data remains intact."
        confirmLabel="Close semester"
        onConfirm={handleClose}
        onCancel={() => {
          setConfirmingClose(false);
          setCloseTarget(null);
        }}
        confirmVariant="danger"
        disabled={closing}
      />
    </div>
  );
};

export default Semesters;