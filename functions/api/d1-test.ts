// Cloudflare Pages Function for GET /api/d1-test
// Verifies D1 binding exists and required tables are present
// Admin-only: requires authenticated admin session

import { requireAdminMember } from '../_lib/session';
import { requireTables, jsonResponse } from '../_lib/d1';

// Core tables required for basic functionality
const REQUIRED_TABLES = [
  'join_requests',
  'join_email_log',
  'login_attempts',
  'members',
  'photos'
];

export const onRequestGet = async (context: any): Promise<Response> => {
  const admin = await requireAdminMember(context);
  if (!admin.ok) {
    return jsonResponse(admin.body, admin.status);
  }

  const db = admin.db;

  try {
    const url = new URL(context.request.url);
    const table = url.searchParams.get("table");

    // If a table is specified, return its column info
    if (table) {
      const allowed = [
        "_cf_METADATA",
        "d1_migrations",
        "join_requests",
        "library_entries",
        "photos",
        "sqlite_sequence",
        "join_email_log",
        "login_attempts",
        "members",
        "weekly_matchups",
        "events",
        "faq_entries",
        "content_blocks",
        "page_content",
        "media_assets",
        "milestones",
        "friends",
        "discussions",
        "footer_quotes",
        "membership_card_content",
        "welcome_email_content",
        "admin_team_worklist",
      ];

      if (!allowed.includes(table)) {
        return jsonResponse(
          {
            ok: false,
            error: `Invalid table name: ${table}`,
          },
          400
        );
      }

      const pragma = await db.prepare(`PRAGMA table_info(${table});`).all();

      return jsonResponse(
        {
          ok: true,
          table,
          columns: pragma.results ?? [],
        },
        200
      );
    }

    // Check required tables exist (validates migrations applied)
    const tablesCheck = await requireTables(db, REQUIRED_TABLES);
    if (!tablesCheck.ok) {
      return jsonResponse(tablesCheck.body, tablesCheck.status);
    }

    // List all tables with count
    const result = await db.prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;`
    ).all();

    // Get sample row count from join_requests for validation
    let joinRequestsCount = 0;
    try {
      const countResult = await db.prepare(`SELECT COUNT(*) as count FROM join_requests`).first();
      joinRequestsCount = (countResult as any)?.count || 0;
    } catch (e) {
      // Non-critical, continue
    }

    return jsonResponse(
      {
        ok: true,
        status: 'healthy',
        tables: result.results ?? [],
        checks: {
          d1Binding: 'present',
          requiredTables: 'present',
          tablesChecked: REQUIRED_TABLES
        },
        diagnostics: {
          totalTables: (result.results || []).length,
          joinRequestsCount
        },
        message: 'D1 binding and schema validated successfully',
        timestamp: new Date().toISOString()
      },
      200
    );
  } catch (err: any) {
    return jsonResponse(
      {
        ok: false,
        error: String(err?.message ?? err),
      },
      500
    );
  }
};
