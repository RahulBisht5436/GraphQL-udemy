import { db } from "./connection.js";

const selectById = db.prepare("SELECT * FROM company WHERE id = ?");

export async function getCompany(id) {
  return selectById.get(id);
}
