import { db } from "./connection.js";

// `user` is quoted — reserved word in SQLite
const selectById = db.prepare('SELECT * FROM "user" WHERE id = ?');
const selectByEmail = db.prepare('SELECT * FROM "user" WHERE email = ?');

export async function getUser(id) {
  return selectById.get(id);
}

export async function getUserByEmail(email) {
  return selectByEmail.get(email);
}
