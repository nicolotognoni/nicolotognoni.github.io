#!/usr/bin/env node

/**
 * Script per rimuovere i line terminators insoliti (LS, PS) dal PDF
 * Esegui: node fix-pdf.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(__dirname, 'public', 'BendingSpoon_CoverLetter.pdf');
const backupPath = path.join(__dirname, 'public', 'BendingSpoon_CoverLetter.pdf.backup');

console.log('Leggendo il PDF...');
const pdfData = fs.readFileSync(pdfPath);

console.log(`Dimensione originale: ${pdfData.length} bytes`);

// Line Separator (U+2028) e Paragraph Separator (U+2029)
const lineSeparator = Buffer.from([0xE2, 0x80, 0xA8]); // LS
const paragraphSeparator = Buffer.from([0xE2, 0x80, 0xA9]); // PS

let cleanedData = pdfData;
let lsCount = 0;
let psCount = 0;

// Conta e rimuovi LS
let index = cleanedData.indexOf(lineSeparator);
while (index !== -1) {
  lsCount++;
  cleanedData = Buffer.concat([
    cleanedData.slice(0, index),
    cleanedData.slice(index + 3)
  ]);
  index = cleanedData.indexOf(lineSeparator);
}

// Conta e rimuovi PS
index = cleanedData.indexOf(paragraphSeparator);
while (index !== -1) {
  psCount++;
  cleanedData = Buffer.concat([
    cleanedData.slice(0, index),
    cleanedData.slice(index + 3)
  ]);
  index = cleanedData.indexOf(paragraphSeparator);
}

console.log(`Trovati ${lsCount} Line Separator (LS)`);
console.log(`Trovati ${psCount} Paragraph Separator (PS)`);

if (lsCount > 0 || psCount > 0) {
  // Crea un backup
  console.log('Creando backup...');
  fs.copyFileSync(pdfPath, backupPath);
  console.log(`Backup salvato in: ${backupPath}`);
  
  // Salva il PDF pulito
  fs.writeFileSync(pdfPath, cleanedData);
  console.log(`PDF pulito salvato. Nuova dimensione: ${cleanedData.length} bytes`);
  console.log('✅ PDF riparato con successo!');
} else {
  console.log('✅ Nessun line terminator insolito trovato nel PDF.');
}

