import { db } from "../db/connection.js";

db.exec('DROP TABLE IF EXISTS "user";');
db.exec("DROP TABLE IF EXISTS job;");
db.exec("DROP TABLE IF EXISTS company;");

db.exec(`CREATE TABLE company (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);`);

db.exec(`CREATE TABLE job (
  id TEXT NOT NULL PRIMARY KEY,
  companyId TEXT NOT NULL REFERENCES company (id),
  title TEXT NOT NULL,
  description TEXT,
  createdAt TEXT NOT NULL
);`);

db.exec(`CREATE TABLE "user" (
  id TEXT NOT NULL PRIMARY KEY,
  companyId TEXT NOT NULL REFERENCES company (id),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);`);

const insertCompany = db.prepare(
  "INSERT INTO company (id, name, description) VALUES (?, ?, ?)"
);
insertCompany.run(
  "FjcJCHJALA4i",
  "Facegle",
  "We are a startup on a mission to disrupt social search engines. Think Facebook meet Google."
);
insertCompany.run(
  "Gu7QW9LcnF5d",
  "Goobook",
  "We are a startup on a mission to disrupt search social media. Think Google meet Facebook."
);

const insertJob = db.prepare(
  "INSERT INTO job (id, companyId, title, description, createdAt) VALUES (?, ?, ?, ?, ?)"
);
insertJob.run(
  "f3YzmnBZpK0o",
  "FjcJCHJALA4i",
  "Frontend Developer",
  "We are looking for a Frontend Developer familiar with React.",
  "2025-01-26T11:00:00.000Z"
);
insertJob.run(
  "XYZNJMXFax6n",
  "FjcJCHJALA4i",
  "Backend Developer",
  "We are looking for a Backend Developer familiar with Node.js and Express.",
  "2025-01-27T11:00:00.000Z"
);
insertJob.run(
  "6mA05AZxvS1R",
  "Gu7QW9LcnF5d",
  "Full-Stack Developer",
  "We are looking for a Full-Stack Developer familiar with Node.js, Express, and React.",
  "2025-01-30T11:00:00.000Z"
);

const insertUser = db.prepare(
  'INSERT INTO "user" (id, companyId, email, password) VALUES (?, ?, ?, ?)'
);
insertUser.run(
  "AcMJpL7b413Z",
  "FjcJCHJALA4i",
  "alice@facegle.io",
  "alice123"
);
insertUser.run(
  "BvBNW636Z89L",
  "Gu7QW9LcnF5d",
  "bob@goobook.co",
  "bob123"
);

process.exit(0);
