import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { leadLists } from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function seedLeadLists() {
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Check if lead lists already exist
    const existing = await db.select().from(leadLists);
    if (existing.length > 0) {
      console.log(`✓ Lead lists already exist (${existing.length} records)`);
      await connection.end();
      return;
    }

    // Seed default lead lists
    const defaultLeadLists = [
      {
        title: "Tech Recruiters - Q1 2026",
        description: "50 verified tech recruiters actively hiring for software engineers",
        leadCount: 50,
        price: "60.00",
        csvFileKey: "lead-lists/tech-recruiters-q1-2026.csv",
      },
      {
        title: "Sales Leaders - Enterprise",
        description: "50 verified enterprise sales leaders with hiring signals",
        leadCount: 50,
        price: "60.00",
        csvFileKey: "lead-lists/sales-leaders-enterprise.csv",
      },
      {
        title: "Product Managers - Startups",
        description: "50 verified product managers at high-growth startups",
        leadCount: 50,
        price: "60.00",
        csvFileKey: "lead-lists/product-managers-startups.csv",
      },
    ];

    for (const leadList of defaultLeadLists) {
      await db.insert(leadLists).values(leadList);
      console.log(`✓ Created lead list: ${leadList.title}`);
    }

    console.log("\n✓ Seed completed successfully!");
    await connection.end();
  } catch (error) {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  }
}

seedLeadLists();
