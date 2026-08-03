import type { EventEmitter } from 'node:events';
import type { Readable } from 'node:stream';

export interface CursorLifecycleEvent {
  type?: string;
  subtype?: string;
  session_id?: string;
  call_id?: string;
  [key: string]: unknown;
}

export interface LaunchChild extends EventEmitter {
  stdout?: Readable | null;
  stderr?: Readable | null;
  pid?: number;
  kill(signal?: NodeJS.Signals | number): boolean;
}

export interface LaunchMonitorResult {
  accepted: boolean;
  sessionId: string | null;
  reason: string;
  exitCode: number | null;
  signal: NodeJS.Signals | string | null;
}

export interface LaunchMonitorOptions {
  child: LaunchChild;
  startupTimeoutMs?: number;
  executionTimeoutMs?: number;
  heartbeatIntervalMs?: number;
  killGraceMs?: number;
  onAccepted?: (event: {
    event: CursorLifecycleEvent;
    sessionId: string;
    acceptedAt: string;
  }) => void;
  onHeartbeat?: (event: {
    accepted: boolean;
    sessionId: string | null;
    state: 'cli_spawned' | 'running';
    at: string;
  }) => void;
  onDiagnostic?: (line: string) => void;
}

export interface RetryPacket {
  issueNumber?: number;
  issue?: number;
  deliveryId?: string;
  launchAttempts?: number;
  lastLaunchFailure?: string;
  lastLaunchFailureAt?: string;
  notBefore?: string;
  [key: string]: unknown;
}

export interface InFlightRecord {
  state?: string;
  acceptedAt?: string | null;
  [key: string]: unknown;
}

export function isAgentAcceptedEvent(event: CursorLifecycleEvent | null | undefined): boolean;
export function sanitizeDiagnostic(value: unknown): string;
export function summarizeStreamEvent(event: CursorLifecycleEvent | null | undefined): string;
export function prepareRetryPacket(
  packet: RetryPacket,
  options?: {
    reason?: string;
    now?: Date | string | number;
    baseDelaySeconds?: number;
    maxDelaySeconds?: number;
  },
): RetryPacket;
export function classifyInterruptedLaunch(
  record: InFlightRecord | null | undefined,
): 'none' | 'retry_preaccept' | 'hold_postaccept';
export function inFlightPath(config: Record<string, unknown>): string;
export function readInFlight(config: Record<string, unknown>): InFlightRecord | null;
export function writeInFlight(
  config: Record<string, unknown>,
  record: InFlightRecord,
): InFlightRecord;
export function clearInFlight(config: Record<string, unknown>): void;
export function monitorAgentProcess(options: LaunchMonitorOptions): Promise<LaunchMonitorResult>;
