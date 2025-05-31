import express from "express";
import cors from "cors";
import initializeDatabase from "./db";
const app = express();
const port = process.env.PORT || 3000;

/**
 * Welcome to the Fullstack Challenge for the Server!
 *
 * This is a basic express server.
 * You can customize and organize it to your needs.
 * Good luck!
 */
const db = initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM organizations").all();
  res.json({ message: "Welcome to the server! 🎉", rows });
});

app.get("/deals", (req, res) => {
  const deals = db.prepare(`
    SELECT 
      d.*,
      a.id as account_id,
      a.name as account_name,
      a.icon as account_icon,
      o.id as organization_id,
      o.name as organization_name,
      o.icon as organization_icon
    FROM deals d
    JOIN accounts a ON d.account_id = a.id 
    JOIN organizations o ON d.organization_id = o.id
  `).all();
  
  res.json({ deals });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
