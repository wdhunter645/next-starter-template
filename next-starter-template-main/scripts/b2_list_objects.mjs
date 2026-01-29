#!/usr/bin/env node
/**
 * Lists all objects in a Backblaze B2 bucket via the S3-compatible API using AWS CLI.
 * Output: JSON { keys: [{ key, size, lastModified }] }
 *
 * Env required:
 *   B2_ENDPOINT, B2_BUCKET
 * Optional:
 *   B2_PREFIX
 */
import { execFileSync } from "node:child_process";

const endpoint = process.env.B2_ENDPOINT;
const bucket = process.env.B2_BUCKET;
const prefix = process.env.B2_PREFIX || "";

if (!endpoint || !bucket) {
  console.error("Missing B2_ENDPOINT or B2_BUCKET");
  process.exit(2);
}

function aws(args) {
  const out = execFileSync("aws", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return out;
}

let continuationToken = null;
const keys = [];

for (;;) {
  const args = [
    "--endpoint-url", endpoint,
    "s3api", "list-objects-v2",
    "--bucket", bucket,
    "--max-keys", "1000"
  ];
  if (prefix) args.push("--prefix", prefix);
  if (continuationToken) args.push("--continuation-token", continuationToken);

  const raw = aws(args);
  const data = JSON.parse(raw);
  const contents = data.Contents || [];
  for (const obj of contents) {
    keys.push({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified
    });
  }
  if (data.IsTruncated && data.NextContinuationToken) {
    continuationToken = data.NextContinuationToken;
  } else {
    break;
  }
}

process.stdout.write(JSON.stringify({ keys }, null, 2));
