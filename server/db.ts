import Database from "better-sqlite3";

function initializeDatabase() {
  const db = new Database("./database.sqlite", { verbose: console.log });
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );
  `
  ).run();

  // Seed Organizations
  db.prepare(`
    INSERT OR IGNORE INTO organizations (id, name) VALUES
    (1, 'MLB'),
    (2, 'Minor League Baseball'),
    (3, 'College Baseball Conference');
  `).run();

  // Seed Accounts
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, organization_id, name) VALUES
    (1, 1, 'New York Yankees'),
    (2, 1, 'Boston Red Sox'),
    (3, 1, 'Los Angeles Dodgers'),
    (4, 2, 'Durham Bulls'),
    (5, 2, 'Toledo Mud Hens'),
    (6, 3, 'Vanderbilt Commodores');
  `).run();

  // Seed Deals
  db.prepare(`
    INSERT OR IGNORE INTO deals (organization_id, account_id, start_date, end_date, value, status) VALUES
    (1, 1, '2024-01-01', '2024-12-31', 1000000.00, 'Deal Proposal'),
    (1, 2, '2024-03-01', '2025-02-28', 750000.00, 'Pitch Proposal'),
    (1, 3, '2024-02-01', '2024-12-31', 850000.00, 'Negotiation'),
    (2, 4, '2024-04-01', '2024-09-30', 150000.00, 'Deal Proposal'),
    (2, 5, '2024-01-01', '2024-12-31', 125000.00, 'Negotiation'),
    (3, 6, '2024-01-01', '2024-06-30', 75000.00, 'Pitch Proposal');
  `).run();

  return db;
}

export default initializeDatabase;
