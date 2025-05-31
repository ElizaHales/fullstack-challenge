import Database from "better-sqlite3";

function initializeDatabase() {
  const db = new Database("./database.sqlite", { verbose: console.log });
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
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
      icon TEXT NOT NULL,
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

  // Delete existing data
  db.prepare('DELETE FROM deals;').run();
  db.prepare('DELETE FROM accounts;').run();
  db.prepare('DELETE FROM organizations;').run();

  // Seed Organizations
  db.prepare(`
    INSERT OR IGNORE INTO organizations (id, name, icon) VALUES
    (1, 'New York Yankees', '/icons/new-york-yankees.png'),
    (2, 'Boston Red Sox', '/icons/boston-red-sox.png'),
    (3, 'Los Angeles Dodgers', '/icons/los-angeles-dodgers.png'),
    (4, 'Chicago Cubs', '/icons/chicago-cubs.png'),
    (5, 'San Francisco Giants', '/icons/san-francisco-giants.png');
  `).run();

  // Seed Accounts
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, organization_id, name, icon) VALUES
    (1, 1, 'Nike', '/icons/nike.png'),
    (2, 1, 'Gatorade', '/icons/gatorade.png'),
    (3, 1, 'Under Armour', '/icons/under-armour.png'),
    (4, 2, 'New Balance', '/icons/new-balance.png'),
    (5, 2, 'Bank of America', '/icons/bank-of-america.png'),
    (6, 3, 'American Express', '/icons/american-express.png'),
    (7, 3, 'Toyota', '/icons/toyota.png'),
    (8, 4, 'Budweiser', '/icons/budweiser.png'),
    (9, 4, 'United Airlines', '/icons/united-airlines.png'),
    (10, 5, 'Oracle', '/icons/oracle.png'),
    (11, 5, 'Visa', '/icons/visa.png'),
    (12, 1, 'Delta Airlines', '/icons/delta-airlines.png');
  `).run();

  // Seed Deals
  db.prepare(`
    INSERT OR IGNORE INTO deals (organization_id, account_id, start_date, end_date, value, status) VALUES
    (1, 1, '2026-01-01', '2027-12-31', 1500000.00, 'Build Proposal'),
    (2, 4, '2026-04-01', '2026-09-30', 950000.00, 'Build Proposal'), 
    (3, 7, '2026-06-01', '2028-05-31', 1300000.00, 'Build Proposal'),
    (5, 10, '2026-01-01', '2028-12-31', 2500000.00, 'Build Proposal'),
    (4, 9, '2025-07-01', '2028-06-30', 1750000.00, 'Build Proposal'),
    (1, 2, '2026-03-01', '2028-02-28', 1250000.00, 'Pitch Proposal'),
    (3, 6, '2026-01-01', '2029-06-30', 1750000.00, 'Pitch Proposal'),
    (4, 9, '2026-03-01', '2030-02-28', 1950000.00, 'Pitch Proposal'),
    (1, 12, '2026-01-01', '2030-12-31', 2000000.00, 'Pitch Proposal'),
    (2, 5, '2025-08-01', '2029-05-31', 1850000.00, 'Pitch Proposal'),
    (1, 3, '2026-02-01', '2031-12-31', 1850000.00, 'Negotiation'),
    (2, 5, '2026-01-01', '2031-12-31', 2200000.00, 'Negotiation'),
    (4, 8, '2025-09-01', '2027-08-31', 1100000.00, 'Negotiation'),
    (5, 11, '2025-07-01', '2029-06-30', 1650000.00, 'Negotiation'),
    (3, 7, '2025-08-01', '2028-07-31', 1900000.00, 'Negotiation'),
    (3, 6, '2021-01-01', '2025-12-31', 2100000.00, 'Active'),
    (4, 8, '2022-01-01', '2026-12-31', 1800000.00, 'Active'),
    (5, 10, '2023-01-01', '2027-12-31', 2750000.00, 'Active'),
    (1, 1, '2023-06-01', '2028-05-31', 2300000.00, 'Active'),
    (2, 4, '2023-03-01', '2029-02-28', 1950000.00, 'Active');
  `).run();

  return db;
}

export default initializeDatabase;
