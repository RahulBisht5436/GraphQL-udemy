import { db } from "./connection.js";
import DataLoader from "dataloader";

const selectById = db.prepare("SELECT * FROM company WHERE id = ?");

/**
 * Fetches a single company row, or `undefined` if the id is unknown.
 */
export async function getCompany(id) {
  return selectById.get(id);
}

/**
 * Loads all rows for the given id list, then reorders to match `ids` (N+1-safe batching).
 * Duplicate keys in `ids` each get a matching value in the result array.
 */
function getCompaniesByIds(ids) {
  if (ids.length === 0) {
    return [];
  }
  const uniqueIds = [...new Set(ids)];
  const placeholders = uniqueIds.map(() => "?").join(",");
  const selectMany = db.prepare(
    `SELECT * FROM company WHERE id IN (${placeholders})`
  );
  const rows = selectMany.all(...uniqueIds);
  return ids.map((id) => rows.find((row) => String(row.id) === String(id)) ?? null);
}

/**
 * Batches `Company` lookups in one query per event-loop tick. Result length matches `ids`;
 * `null` means that id is missing (per DataLoader + GraphQL N+1 pattern).
 */
export const companyLoader = new DataLoader(async (ids) => {
  return getCompaniesByIds(ids);
});
