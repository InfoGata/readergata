import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Use the pdfjs-dist bundled with react-pdf to ensure version match
const reactPdfPath = path.dirname(require.resolve("react-pdf/package.json"));
const pdfjsDistPath = path.join(reactPdfPath, "node_modules", "pdfjs-dist");
const pdfWorkerPath = path.join(pdfjsDistPath, "build", "pdf.worker.mjs");

const targetDir = "public";
const targetPath = path.join(targetDir, "pdf.worker.mjs");

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy file
fs.copyFileSync(pdfWorkerPath, targetPath);
console.log(`Copied ${pdfWorkerPath} to ${targetPath}`);
