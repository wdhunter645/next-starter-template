export type FaqStatus = 'pending' | 'approved' | 'denied';

export type AskInboxStatus = 'open' | 'pending' | 'approved' | 'rejected' | 'archived' | 'responded' | 'hidden';

export function parsePositiveInt(value: unknown): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function parsePinned(value: unknown): 0 | 1 | null {
  const pinned = Number(value);
  if (pinned === 0 || pinned === 1) return pinned;
  return null;
}

export function validateFaqQuestion(question: string): string | null {
  const text = question.trim();
  if (!text) return 'Question is required.';
  if (text.length > 500) return 'Question must be 500 characters or fewer.';
  return null;
}

export function validateFaqAnswer(answer: string, required: boolean): string | null {
  const text = answer.trim();
  if (!text && required) return 'Answer is required.';
  if (text.length > 8000) return 'Answer must be 8000 characters or fewer.';
  return null;
}

export function normalizeFaqStatus(value: unknown): FaqStatus | null {
  const status = String(value ?? '').trim().toLowerCase();
  if (status === 'pending' || status === 'approved' || status === 'denied') return status;
  return null;
}

export function askStatusesForFilter(filter: string): string[] {
  const key = String(filter || 'pending').trim().toLowerCase();
  switch (key) {
    case 'approved':
      return ['approved'];
    case 'rejected':
      return ['rejected', 'hidden'];
    case 'archived':
      return ['archived'];
    case 'pending':
    default:
      return ['open', 'pending'];
  }
}

export function isPublishedFaqStatus(status: string): boolean {
  return status === 'approved';
}
