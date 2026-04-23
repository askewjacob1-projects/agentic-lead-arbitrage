import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storagePut } from "../server/storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const leadListFiles = [
  {
    localPath: "../webdev-static-assets/tech-recruiters-q1-2026.csv",
    storageKey: "lead-lists/tech-recruiters-q1-2026.csv",
    title: "Tech Recruiters - Q1 2026",
  },
];

async function uploadLeadLists() {
  console.log("🚀 Starting lead list upload to S3...\n");

  try {
    for (const file of leadListFiles) {
      const fullPath = path.resolve(__dirname, file.localPath);

      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${fullPath}`);
        continue;
      }

      const fileContent = fs.readFileSync(fullPath);
      console.log(`📤 Uploading ${file.title}...`);

      const result = await storagePut(file.storageKey, fileContent, "text/csv");

      console.log(`✓ Successfully uploaded: ${file.title}`);
      console.log(`  Storage Key: ${result.key}`);
      console.log(`  URL: ${result.url}\n`);
    }

    console.log("✓ All lead lists uploaded successfully!");
    console.log("\nNext steps:");
    console.log("1. Use the storage keys above when creating lead list records in the database");
    console.log("2. Run the seed script to create lead list records with these keys");
    console.log("3. Test the purchase flow to verify downloads work");
  } catch (error) {
    console.error("✗ Upload failed:", error);
    process.exit(1);
  }
}

uploadLeadLists();
