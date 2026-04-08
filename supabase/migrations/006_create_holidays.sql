CREATE TABLE holidays (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL UNIQUE,
  name_ko         TEXT NOT NULL,
  name_en         TEXT,
  is_substitute   BOOLEAN DEFAULT FALSE,
  year            SMALLINT NOT NULL
);
