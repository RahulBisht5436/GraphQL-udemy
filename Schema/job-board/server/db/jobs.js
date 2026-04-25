import { db } from "./connection.js";
import { generateId } from "./ids.js";

const selectAll = db.prepare("SELECT * FROM job");
const selectById = db.prepare("SELECT * FROM job WHERE id = ?");
const insert = db.prepare(`
  INSERT INTO job (id, companyId, title, description, createdAt)
  VALUES (?, ?, ?, ?, ?)
`);
const deleteById = db.prepare("DELETE FROM job WHERE id = ?");
const update = db.prepare(
  "UPDATE job SET title = ?, description = ? WHERE id = ?"
);

export async function getJobs() {
  return selectAll.all();
}

export async function getJob(id) {
  return selectById.get(id);
}

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

export async function deleteJob(id) {
  const job = selectById.get(id);
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  deleteById.run(id);
  return job;
}

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
