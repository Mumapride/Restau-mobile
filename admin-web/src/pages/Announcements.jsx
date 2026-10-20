import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import {
  createAnnouncement,
  getAnnouncements,
  setAnnouncementPublishStatus,
  updateAnnouncement,
} from "../api/announcements.js";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Input from "../components/Input.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDateTime } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const TITLE_MAX = 191;
const BODY_MAX = 10000;
const PREVIEW_MAX = 110;

const previewText = (body, max = PREVIEW_MAX) => {
  if (!body) return "";
  return body.length > max ? `${body.slice(0, max).trimEnd()}…` : body;
};

// Shared button styles. Fixed height + nowrap + shrink-0 keep labels inside
// their buttons at every width.
const BTN =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SM = `${BTN} h-8 px-3 text-xs`;
const BTN_MD = `${BTN} h-10 px-4 text-sm`;
const BTN_PRIMARY = "bg-primary text-white hover:bg-primary-dark";
const BTN_OUTLINE = "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
const BTN_DANGER = "border border-red-200 bg-white text-red-600 hover:bg-red-50";

const Spinner = ({ tone = "light" }) => (
  <span
    className={`h-3.5 w-3.5 animate-spin rounded-full border-2 motion-reduce:animate-none ${
      tone === "light" ? "border-white/40 border-t-white" : "border-red-200 border-t-red-600"
    }`}
    aria-hidden="true"
  />
);

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const [toast, setToast] = useState(null);
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Toasts close themselves after a few seconds (still dismissible by hand).
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const sorted = useMemo(
    () =>
      [...announcements].sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt).getTime() -
          new Date(a.createdAt || a.updatedAt).getTime()
      ),
    [announcements]
  );

  const publishedCount = useMemo(
    () => announcements.filter((a) => a.isPublished).length,
    [announcements]
  );

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title || "");
    setBody(announcement.body || "");
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setTitle("");
    setBody("");
    setFormError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    const t = title.trim();
    const b = body.trim();
    if (!t) {
      setFormError("Title is required");
      return;
    }
    if (t.length > TITLE_MAX) {
      setFormError(`Title must be ${TITLE_MAX} characters or fewer`);
      return;
    }
    if (!b) {
      setFormError("Message is required");
      return;
    }
    if (b.length > BODY_MAX) {
      setFormError(`Message must be ${BODY_MAX} characters or fewer`);
      return;
    }

    setSaving(true);
    try {
      const payload = { title: t, body: b };
      if (editingId) {
        await updateAnnouncement(editingId, payload);
        setToast({ kind: "success", message: "Announcement updated." });
      } else {
        await createAnnouncement({ ...payload, isPublished: false });
        setToast({ kind: "success", message: "Announcement created as draft." });
      }
      closeModal();
      await fetchAnnouncements();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const requestPublish = (announcement) => {
    const targetPublish = !announcement.isPublished;
    setConfirmTarget({
      id: announcement.id,
      isPublished: targetPublish,
    });
    setConfirming(true);
  };

  const handlePublish = async () => {
    if (!confirmTarget) return;
    setPublishingId(confirmTarget.id);
    try {
      await setAnnouncementPublishStatus(
        confirmTarget.id,
        confirmTarget.isPublished
      );
      setToast({
        kind: "success",
        message: `Announcement ${confirmTarget.isPublished ? "published" : "unpublished"}.`,
      });
      setConfirming(false);
      setConfirmTarget(null);
      setPublishingId(null);
      await fetchAnnouncements();
    } catch (err) {
      setError(getErrorMessage(err));
      setConfirming(false);
      setConfirmTarget(null);
      setPublishingId(null);
    }
  };

  const dismissToast = () => setToast(null);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <PageHeader
        title="Announcements"
        subtitle="Manage cafeteria announcements for students. Drafts are hidden from students until published."
        action={
          <button
            type="button"
            onClick={openCreate}
            disabled={saving}
            className={`${BTN_MD} ${BTN_PRIMARY}`}
          >
            {saving ? <Spinner /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            Create announcement
          </button>
        }
      />

      {/* Summary pills */}
      {!loading && announcements.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {announcements.length} {announcements.length === 1 ? "announcement" : "announcements"}
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums">
            {publishedCount} published
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums">
            {announcements.length - publishedCount} draft
          </span>
        </div>
      )}

      {error && (
        <ErrorState
          title="Unable to load announcements"
          message={error}
          action={
            <Button variant="primary" size="sm" onClick={fetchAnnouncements}>
              Try again
            </Button>
          }
        />
      )}

      {loading ? (
        <LoadingState message="Loading announcements…" />
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="info"
            title="No announcements yet"
            message="Create your first announcement. It will start as a draft and won't be visible to students until you publish it."
            action={
              <button
                type="button"
                onClick={openCreate}
                disabled={saving}
                className={`${BTN_MD} ${BTN_PRIMARY}`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create announcement
              </button>
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Announcement</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Updated</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((a) => {
                  const busy = saving || publishingId === a.id;
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-slate-50">
                      <td className="max-w-[420px] px-4 py-3">
                        <p className="truncate font-medium text-slate-900">
                          {a.title || "(untitled)"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {previewText(a.body) || "—"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={a.isPublished ? "PUBLISHED" : "DRAFT"} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 tabular-nums">
                          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          {formatDateTime(a.updatedAt || a.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEdit(a)}
                            disabled={busy}
                            className={`${BTN_SM} ${BTN_OUTLINE}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => requestPublish(a)}
                            disabled={busy}
                            className={`${BTN_SM} ${a.isPublished ? BTN_DANGER : BTN_PRIMARY}`}
                          >
                            {publishingId === a.id && (
                              <Spinner tone={a.isPublished ? "danger" : "light"} />
                            )}
                            {a.isPublished ? "Unpublish" : "Publish"}
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
        title={editingId ? "Edit announcement" : "Create announcement"}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="announcement-title" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cafeteria closed for maintenance"
              maxLength={TITLE_MAX}
              disabled={saving}
            />
            <div className="flex justify-between">
              <span className="text-xs text-slate-400 tabular-nums">
                {title.length}/{TITLE_MAX} characters
              </span>
              {title.length > TITLE_MAX && (
                <span className="text-xs font-medium text-red-600">Over limit</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="announcement-body" className="block text-sm font-medium text-slate-700">
              Message / body
            </label>
            <textarea
              id="announcement-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter the full announcement message…"
              rows={6}
              maxLength={BODY_MAX}
              disabled={saving}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-50 disabled:text-slate-400"
            />
            <div className="flex justify-between">
              <span className="text-xs text-slate-400 tabular-nums">
                {body.length}/{BODY_MAX} characters
              </span>
              {body.length > BODY_MAX && (
                <span className="text-xs font-medium text-red-600">Over limit</span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Drafts are hidden from students. Publish when ready.
            </p>
          </div>

          {formError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-red-700">{formError}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className={`${BTN_MD} ${BTN_OUTLINE}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !body.trim()}
              className={`${BTN_MD} ${BTN_PRIMARY}`}
            >
              {saving && <Spinner />}
              {editingId ? "Save changes" : "Save as draft"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirming}
        title={
          confirmTarget && confirmTarget.isPublished
            ? "Publish this announcement?"
            : "Unpublish this announcement?"
        }
        message={
          confirmTarget && confirmTarget.isPublished
            ? "Students will be able to see this announcement immediately."
            : "Students will no longer see this announcement. It will remain as a draft."
        }
        confirmLabel={confirmTarget && confirmTarget.isPublished ? "Publish" : "Unpublish"}
        cancelLabel="Cancel"
        onConfirm={handlePublish}
        onCancel={() => {
          setConfirming(false);
          setConfirmTarget(null);
        }}
        confirmVariant={confirmTarget && confirmTarget.isPublished ? "primary" : "danger"}
        disabled={publishingId !== null}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${
            toast.kind === "success" ? "border-emerald-200" : "border-red-200"
          }`}
          role="alert"
          aria-live="polite"
        >
          {toast.kind === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          )}
          <p className="min-w-0 flex-1 text-sm font-medium text-slate-900">{toast.message}</p>
          <button
            type="button"
            onClick={dismissToast}
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