import { db } from "../db/connection.js";

const INTERVAL = 4 * 60 * 60 * 1000; // 4h
const START_TIME = new Date("2025-01-31T09:00:00.000Z").getTime();

db.exec("DELETE FROM job;");

const companyIds = db.prepare("SELECT id FROM company").all().map((r) => r.id);

const insertJob = db.prepare(
  "INSERT INTO job (id, companyId, title, description, createdAt) VALUES (?, ?, ?, ?, ?)"
);

for (let n = 1; n <= 50; n++) {
  insertJob.run(
    n.toString().padStart(12, "0"),
    companyIds[n % companyIds.length],
    `Job ${n}`,
    `This is the job number ${n}.`,
    new Date(START_TIME + n * INTERVAL).toISOString()
  );
}

process.exit(0);
