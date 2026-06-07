'use client';

import React, { useCallback, useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import AdminNav from '@/components/admin/AdminNav';
import AdminTokenPanel from '@/components/admin/AdminTokenPanel';
import { adminJson } from '@/lib/adminClient';

type Submission = {
  submission_id: number;
  submitted_by: string;
  payload?: string | null;
  title: string;
  description: string;
  source_name?: string | null;
  source_url?: string | null;
  credit_line?: string | null;
  proposed_tag?: string | null;
  media_url?: string | null;
  media_reference?: string | null;
  status: SubmissionStatus;
  triage_flags?: string | null;
  duplicate_candidate?: string | null;
  review_notes?: string | null;
  decision_by?: string | null;
  decision_at?: string | null;
  rejected_at?: string | null;
  purge_eligible_at?: string | null;
  retention_reason?: string | null;
  created_at?: string | null;
};

type SubmissionStatus = 'pending' | 'triaged' | 'under_review' | 'approved' | 'rejected' | 'merged' | 'purged';
type SubmissionFilter = SubmissionStatus | 'all';
type ReviewAction = 'triage' | 'start_review' | 'approve' | 'merge' | 'reject' | 'purge';

const SUBMISSION_FILTERS: Array<{ value: SubmissionFilter; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'triaged', label: 'Triaged' },
  { value: 'under_review', label: 'Under review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'merged', label: 'Merged' },
  { value: 'purged', label: 'Purged' },
  { value: 'all', label: 'All submissions' },
];

type InventoryRecord = {
  id: number;
  tag: string;
  title: string;
  text: string;
  story_type: string;
  allowed_sections: string;
  priority: number;
  canonical: number;
  source_name?: string | null;
  source_url?: string | null;
  credit_line: string;
  status: 'draft' | 'published' | 'archived';
  review_notes?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
};

type EditorialListResponse = {
  ok: true;
  submissions: Submission[];
  inventory: InventoryRecord[];
};

function fieldStyle(): React.CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.16)',
    width: '100%',
  };
}

function buttonStyle(disabled = false): React.CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.18)',
    background: disabled ? 'rgba(0,0,0,0.05)' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700,
  };
}

function defaultCreditFromSubmitter(value: string): string {
  return value.includes('<') ? value.split('<')[0].trim() : value;
}

export default function AdminEditorialArchivePage() {
  const [status, setStatus] = useState('Idle.');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    setStatus('Loading editorial queue…');

    const result = await adminJson<EditorialListResponse>(
      `/api/admin/editorial/list?limit=100&submission_status=${submissionFilter}`,
    );

    if (!result.ok) {
      setSubmissions([]);
      setInventory([]);
      setStatus(`Error: ${result.error}`);
      setLoading(false);
      return;
    }

    const nextSubmissions = Array.isArray(result.data?.submissions) ? result.data.submissions : [];
    const nextInventory = Array.isArray(result.data?.inventory) ? result.data.inventory : [];
    setSubmissions(nextSubmissions);
    setInventory(nextInventory);
    setStatus(
      `Loaded ${nextSubmissions.length} ${submissionFilter} submission(s) and ${nextInventory.length} archive record(s).`,
    );
    setLoading(false);
  }, [submissionFilter]);

  const reviewSubmission = useCallback(
    async (
      submission: Submission,
      action: ReviewAction,
      form: HTMLFormElement,
      options: { retentionReason?: string } = {},
    ) => {
      const formData = new FormData(form);
      setStatus(`Recording ${action.replace('_', ' ')} for "${submission.title}"…`);

      const targetInventoryId = Number(formData.get('target_inventory_id') || 0);
      const retentionReason =
        String(formData.get('retention_reason') || '').trim() ||
        String(options.retentionReason || '').trim() ||
        '';
      const purgeEligibleAt = String(formData.get('purge_eligible_at') || '');

      const result = await adminJson<{ ok: true }>('/api/admin/editorial/review', {
        method: 'POST',
        body: JSON.stringify({
          submission_id: submission.submission_id,
          action,
          tag: String(formData.get('tag') || submission.proposed_tag || ''),
          source_name: String(formData.get('source_name') || submission.source_name || 'Member submission'),
          source_url: String(formData.get('source_url') || submission.source_url || ''),
          credit_line: String(
            formData.get('credit_line') ||
              submission.credit_line ||
              defaultCreditFromSubmitter(submission.submitted_by) ||
              '',
          ),
          story_type: String(formData.get('story_type') || 'brief'),
          allowed_sections: ['library'],
          priority: Number(formData.get('priority') || 0),
          review_notes: String(formData.get('review_notes') || ''),
          triage_flags: String(formData.get('triage_flags') || '[]'),
          duplicate_candidate: String(formData.get('duplicate_candidate') || ''),
          retention_reason: retentionReason,
          purge_eligible_at: retentionReason ? '' : purgeEligibleAt,
          target_inventory_id: Number.isFinite(targetInventoryId) ? targetInventoryId : 0,
        }),
      });

      if (!result.ok) {
        setStatus(`Review error: ${result.error}`);
        return;
      }

      setStatus(`Submission workflow action recorded: ${action.replace('_', ' ')}.`);
      await load();
    },
    [load],
  );

  const updatePublication = useCallback(
    async (id: number, nextStatus: InventoryRecord['status']) => {
      setStatus(`Updating archive record ${id} to ${nextStatus}…`);

      const result = await adminJson<{ ok: true }>('/api/admin/editorial/publish', {
        method: 'POST',
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (!result.ok) {
        setStatus(`Publication error: ${result.error}`);
        return;
      }

      setStatus(`Archive record ${id} is now ${nextStatus}.`);
      await load();
    },
    [load],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageShell
      title="Editorial Archive"
      subtitle="Review member submissions and publish approved records through content_inventory."
    >
      <AdminNav />
      <AdminTokenPanel onSaved={() => void load()} />

      <div style={{ display: 'grid', gap: 18, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => void load()} disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            Queue status
            <select
              value={submissionFilter}
              onChange={(event) => setSubmissionFilter(event.target.value as SubmissionFilter)}
              style={{ ...fieldStyle(), width: 'auto' }}
            >
              {SUBMISSION_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <span style={{ opacity: 0.85 }}>{status}</span>
        </div>

        <section style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>Submission Review Queue</h2>
          <p style={{ opacity: 0.8 }}>
            Member submissions stay here until a human triages, reviews, approves, merges, rejects, retains, or purges them.
          </p>

          {submissions.length === 0 ? (
            <p>No {submissionFilter} submissions.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.submission_id}
                  submission={submission}
                  onReview={reviewSubmission}
                />
              ))}
            </div>
          )}
        </section>

        <section style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>Content Inventory Publication State</h2>
          <p style={{ opacity: 0.8 }}>
            Only published records are eligible for member archive/library reads.
          </p>

          {inventory.length === 0 ? (
            <p>No content inventory records found.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {inventory.map((record) => (
                <article key={record.id} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{record.title}</h3>
                      <div style={{ opacity: 0.75, fontSize: 13 }}>
                        tag: {record.tag} · status: {record.status} · credit: {record.credit_line}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => void updatePublication(record.id, 'published')}
                        disabled={record.status === 'published'}
                        style={buttonStyle(record.status === 'published')}
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => void updatePublication(record.id, 'draft')}
                        disabled={record.status === 'draft'}
                        style={buttonStyle(record.status === 'draft')}
                      >
                        Return to Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => void updatePublication(record.id, 'archived')}
                        disabled={record.status === 'archived'}
                        style={buttonStyle(record.status === 'archived')}
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{record.text}</p>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    sections: {record.allowed_sections} · updated: {record.updated_at || '—'} · published:{' '}
                    {record.published_at || '—'}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function SubmissionCard(props: {
  submission: Submission;
  onReview: (
    submission: Submission,
    action: ReviewAction,
    form: HTMLFormElement,
    options?: { retentionReason?: string },
  ) => Promise<void>;
}) {
  const { submission, onReview } = props;
  const canPurge = submission.status === 'rejected' && !String(submission.retention_reason || '').trim();
  const retainedDefault =
    String(submission.retention_reason || '').trim() || 'Retained for editorial follow-up.';

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 12, display: 'grid', gap: 10 }}
    >
      <div>
        <h3 style={{ margin: 0 }}>{submission.title}</h3>
        <div style={{ opacity: 0.75, fontSize: 13 }}>
          submitted by {submission.submitted_by} · status: {submission.status} · {submission.created_at || 'date unavailable'}
        </div>
      </div>

      <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{submission.description}</p>
      <div style={{ opacity: 0.78, fontSize: 13 }}>
        source: {submission.source_name || '—'} · credit: {submission.credit_line || '—'} · media:{' '}
        {submission.media_reference || submission.media_url || '—'}
      </div>
      {(submission.duplicate_candidate ||
        submission.triage_flags ||
        submission.decision_at ||
        submission.purge_eligible_at ||
        submission.retention_reason) && (
        <div style={{ opacity: 0.78, fontSize: 13 }}>
          duplicate: {submission.duplicate_candidate || '—'} · triage: {submission.triage_flags || '[]'} · decision:{' '}
          {submission.decision_by || '—'} {submission.decision_at || ''} · purge eligible:{' '}
          {submission.purge_eligible_at || '—'} · retention: {submission.retention_reason || '—'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Tag
          <input name="tag" defaultValue={submission.proposed_tag || ''} style={fieldStyle()} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Source name
          <input name="source_name" defaultValue={submission.source_name || 'Member submission'} style={fieldStyle()} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Source URL
          <input name="source_url" defaultValue={submission.source_url || ''} style={fieldStyle()} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Credit line
          <input
            name="credit_line"
            defaultValue={submission.credit_line || defaultCreditFromSubmitter(submission.submitted_by)}
            style={fieldStyle()}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Story type
          <select name="story_type" defaultValue="brief" style={fieldStyle()}>
            <option value="brief">brief</option>
            <option value="secondary">secondary</option>
            <option value="primary">primary</option>
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Priority
          <input name="priority" type="number" defaultValue={0} style={fieldStyle()} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Duplicate candidate / merge target note
          <input name="duplicate_candidate" defaultValue={submission.duplicate_candidate || ''} style={fieldStyle()} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Target inventory ID for merge
          <input name="target_inventory_id" type="number" min={1} style={fieldStyle()} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          Purge eligible at
          <input name="purge_eligible_at" placeholder="YYYY-MM-DD or ISO timestamp" style={fieldStyle()} />
        </label>
      </div>

      <label style={{ display: 'grid', gap: 6 }}>
        Review notes
        <textarea name="review_notes" rows={3} defaultValue={submission.review_notes || ''} style={fieldStyle()} />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        Objective triage flags JSON
        <textarea name="triage_flags" rows={2} defaultValue={submission.triage_flags || '[]'} style={fieldStyle()} />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        Retention reason
        <textarea name="retention_reason" rows={2} defaultValue={submission.retention_reason || ''} style={fieldStyle()} />
      </label>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={(event) => void onReview(submission, 'triage', event.currentTarget.form as HTMLFormElement)}
          style={buttonStyle()}
        >
          Mark Triaged
        </button>
        <button
          type="button"
          onClick={(event) => void onReview(submission, 'start_review', event.currentTarget.form as HTMLFormElement)}
          style={buttonStyle()}
        >
          Start Review
        </button>
        <button
          type="button"
          onClick={(event) => void onReview(submission, 'approve', event.currentTarget.form as HTMLFormElement)}
          style={buttonStyle()}
        >
          Approve as Draft
        </button>
        <button
          type="button"
          onClick={(event) => void onReview(submission, 'merge', event.currentTarget.form as HTMLFormElement)}
          style={buttonStyle()}
        >
          Mark Merged
        </button>
        <button
          type="button"
          onClick={(event) => void onReview(submission, 'reject', event.currentTarget.form as HTMLFormElement)}
          style={buttonStyle()}
        >
          Reject + Purge Eligible
        </button>
        <button
          type="button"
          onClick={(event) =>
            void onReview(submission, 'reject', event.currentTarget.form as HTMLFormElement, {
              retentionReason: retainedDefault,
            })
          }
          style={buttonStyle()}
        >
          Retain Rejected
        </button>
        <button
          type="button"
          onClick={(event) => void onReview(submission, 'purge', event.currentTarget.form as HTMLFormElement)}
          disabled={!canPurge}
          style={buttonStyle(!canPurge)}
        >
          Mark Purged
        </button>
      </div>
    </form>
  );
}
