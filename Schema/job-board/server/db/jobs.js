// Data access for the `job` table (node:sqlite `DatabaseSync` via `connection.js`).
// All reads/writes use precompiled `db.prepare(...)` statements; ordering is in SQL, not in JS.

import { db } from "./connection.js";
import { generateId } from "./ids.js";

// Home / list: newest first. Two statements so optional `limit` never binds `undefined` to SQLite.
const selectAllUnlimited = db.prepare(
  "SELECT * FROM job ORDER BY createdAt DESC"
);
const selectAllLimited = db.prepare(
  "SELECT * FROM job ORDER BY createdAt DESC LIMIT ?"
);
const MAX_JOBS_PAGE_SIZE = 500;

const selectById = db.prepare("SELECT * FROM job WHERE id = ?");
const insert = db.prepare(`
  INSERT INTO job (id, companyId, title, description, createdAt)
  VALUES (?, ?, ?, ?, ?)
`);
const deleteById = db.prepare("DELETE FROM job WHERE id = ?");
const update = db.prepare(
  "UPDATE job SET title = ?, description = ? WHERE id = ?"
);

/**
 * Normalizes GraphQL `limit` (optional Int): returns a positive integer cap, or `null` for no LIMIT.
 */
function normalizeJobsLimit(limit) {
  if (limit === undefined || limit === null) {
    return null;
  }
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.min(Math.floor(n), MAX_JOBS_PAGE_SIZE);
}

/**
 * Job rows sorted by `createdAt` desc.
 * Omit `limit` or pass invalid/zero to return all rows (bounded only by `MAX_JOBS_PAGE_SIZE` when set).
 */
export async function getJobs(limit) {
  const cap = normalizeJobsLimit(limit);
  if (cap === null) {
    return selectAllUnlimited.all();
  }
  return selectAllLimited.all(cap);
}

/** Single job by primary key, or `undefined` if not found. */
export async function getJob(id) {
  return selectById.get(id);
}

/** Inserts a new row, generates `id` and `createdAt`, and returns the saved object. */
export async function createJob({ companyId, title, description }) {
  const job = {
    id: generateId(),
    companyId,
    title,
    description,
    createdAt: new Date().toISOString(),
  };
  insert.run(
    job.id,
    job.companyId,
    job.title,
    job.description,
    job.createdAt
  );
  return job;
}

/** Deletes by id; throws if the id does not exist. Returns the row that was removed. */
export async function deleteJob(id) {
  const job = selectById.get(id);
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  deleteById.run(id);
  return job;
}

/**
 * Partial update: any omitted `title` or `description` is left unchanged.
 * Merges updated fields with the previous row in the return value.
 */
export async function updateJob({ id, title, description }) {
  const job = selectById.get(id);
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  const nextTitle = title !== undefined && title !== null ? title : job.title;
  const nextDescription =
    description !== undefined && description !== null ? description : job.description;
  update.run(nextTitle, nextDescription, id);
  return { ...job, title: nextTitle, description: nextDescription };
}
