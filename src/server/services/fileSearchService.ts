import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let pdfParseFn: any = null;
try {
  pdfParseFn = require('pdf-parse');
} catch (e) {
  console.warn('[FileSearchService] Warning: pdf-parse could not be loaded via require:', e);
}

export interface DocumentMeta {
  id: string;
  title: string;
  author: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  excerpt?: string;
  extractedTextPath?: string;
}

export class FileSearchService {
  private docsDir = process.env.VERCEL ? path.join('/tmp', 'knowledge_docs') : path.join(process.cwd(), 'knowledge_docs');
  private catalogFile = process.env.VERCEL ? path.join('/tmp', 'knowledge_docs', 'catalog.json') : path.join(process.cwd(), 'knowledge_docs', 'catalog.json');

  constructor() {
    this.ensureDirectory();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(this.docsDir)) {
        fs.mkdirSync(this.docsDir, { recursive: true });
      }
      if (!fs.existsSync(this.catalogFile)) {
        fs.writeFileSync(this.catalogFile, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('[FileSearchService] Warning: Could not create knowledge_docs directory (read-only filesystem):', err);
    }
  }

  /**
   * Retrieves the configured File Search Store ID from environment variables.
   * Checks FILE_SEARCH_STORE_ID and GEMINI_FILE_SEARCH_STORE_ID.
   */
  getFileSearchStoreId(): string | null {
    const storeId = process.env.FILE_SEARCH_STORE_ID || process.env.GEMINI_FILE_SEARCH_STORE_ID;
    if (!storeId || storeId.trim() === '' || storeId === 'undefined') {
      return null;
    }
    return storeId.trim();
  }

  /**
   * List all locally uploaded knowledge documents.
   */
  getDocuments(): DocumentMeta[] {
    this.ensureDirectory();
    try {
      const data = fs.readFileSync(this.catalogFile, 'utf-8');
      return JSON.parse(data) as DocumentMeta[];
    } catch (err) {
      console.error('[FileSearchService] Error reading catalog:', err);
      return [];
    }
  }

  /**
   * Register a new uploaded document in catalog.
   */
  addDocument(doc: DocumentMeta): DocumentMeta {
    const docs = this.getDocuments();
    const updated = [doc, ...docs.filter((d) => d.id !== doc.id)];
    fs.writeFileSync(this.catalogFile, JSON.stringify(updated, null, 2), 'utf-8');
    return doc;
  }

  /**
   * Remove a document by ID.
   */
  deleteDocument(id: string): boolean {
    const docs = this.getDocuments();
    const target = docs.find((d) => d.id === id);
    if (target) {
      const filePath = path.join(this.docsDir, target.filename);
      const textPath = path.join(this.docsDir, `${target.filename}.txt`);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      if (fs.existsSync(textPath)) {
        try { fs.unlinkSync(textPath); } catch {}
      }
      const updated = docs.filter((d) => d.id !== id);
      fs.writeFileSync(this.catalogFile, JSON.stringify(updated, null, 2), 'utf-8');
      return true;
    }
    return false;
  }

  /**
   * Extract plain text from PDF or text files, caching the result as a .txt file.
   */
  async getExtractedText(doc: DocumentMeta): Promise<string> {
    const textCachePath = path.join(this.docsDir, `${doc.filename}.txt`);
    
    // Return cached text if available
    if (fs.existsSync(textCachePath)) {
      try {
        return fs.readFileSync(textCachePath, 'utf-8');
      } catch (err) {
        console.error(`[FileSearchService] Error reading text cache for ${doc.filename}:`, err);
      }
    }

    const filePath = path.join(this.docsDir, doc.filename);
    if (!fs.existsSync(filePath)) return '';

    try {
      const buffer = fs.readFileSync(filePath);
      let extractedText = '';

      // Check if file is PDF
      if (buffer.toString('utf8', 0, 4) === '%PDF' || doc.originalName.toLowerCase().endsWith('.pdf')) {
        console.log(`[FileSearchService] Extracting PDF text from ${doc.title} (${doc.filename})...`);
        if (typeof pdfParseFn === 'function') {
          const pdfData = await pdfParseFn(buffer);
          extractedText = pdfData.text || '';
        } else if (pdfParseFn && typeof pdfParseFn.default === 'function') {
          const pdfData = await pdfParseFn.default(buffer);
          extractedText = pdfData.text || '';
        } else {
          extractedText = buffer.toString('utf-8');
        }
      } else {
        extractedText = buffer.toString('utf-8');
      }

      // Clean up multiple spaces and empty lines
      extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

      // Save to text cache
      if (extractedText.trim().length > 0) {
        fs.writeFileSync(textCachePath, extractedText, 'utf-8');
      }

      return extractedText;
    } catch (err) {
      console.error(`[FileSearchService] Error extracting text from ${doc.filename}:`, err);
      return '';
    }
  }

  /**
   * Extracts top relevant chunks from all uploaded documents based on query keywords.
   */
  async getKnowledgeContext(query: string): Promise<{ text: string; sources: { title: string; author: string; location: string }[] }> {
    const docs = this.getDocuments();
    if (docs.length === 0) {
      return { text: '', sources: [] };
    }

    // Stop words to ignore during keyword matching
    const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'para', 'por', 'con', 'sin', 'que', 'tipo', 'configuracion', 'analisis', 'astrologico', 'documental']);

    const rawKeywords = query.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .split(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/)
      .filter((k) => k.length >= 2 && !stopWords.has(k));

    console.log(`[FileSearchService] Keywords for RAG search:`, rawKeywords);

    interface ScoredChunk {
      docTitle: string;
      docAuthor: string;
      filename: string;
      score: number;
      text: string;
      chunkIndex: number;
    }

    const allScoredChunks: ScoredChunk[] = [];
    const usedSourcesMap = new Map<string, { title: string; author: string; location: string }>();

    for (const doc of docs) {
      const fullText = await this.getExtractedText(doc);
      if (!fullText || fullText.trim().length === 0) continue;

      const normalizedFullText = fullText.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Split into chunks of ~1200 characters with 300 overlap
      const chunkSize = 1200;
      const overlap = 300;
      const chunks: { original: string; normalized: string; index: number }[] = [];

      for (let i = 0; i < fullText.length; i += (chunkSize - overlap)) {
        const original = fullText.substring(i, i + chunkSize);
        const normalized = normalizedFullText.substring(i, i + chunkSize);
        chunks.push({ original, normalized, index: chunks.length + 1 });
      }

      // Score each chunk
      for (const chunk of chunks) {
        let score = 0;
        for (const kw of rawKeywords) {
          if (chunk.normalized.includes(kw)) {
            score += 1;
            // Bonus for exact compound matches like "sol en leo" or "casa 9"
            if (rawKeywords.length >= 2) {
              const mainConcept = rawKeywords.slice(0, 3).join(" ");
              if (chunk.normalized.includes(mainConcept)) {
                score += 5;
              }
            }
          }
        }

        if (score > 0) {
          allScoredChunks.push({
            docTitle: doc.title,
            docAuthor: doc.author || 'Autor no especificado',
            filename: doc.filename,
            score,
            text: chunk.original,
            chunkIndex: chunk.index
          });
        }
      }
    }

    // Sort by score descending
    allScoredChunks.sort((a, b) => b.score - a.score);

    // Pick top 8 best chunks
    const topChunks = allScoredChunks.slice(0, 8);
    const snippets: string[] = [];

    for (const chunk of topChunks) {
      snippets.push(`DOCUMENTO: "${chunk.docTitle}" (${chunk.docAuthor})\nUBICACIÓN: Fragmento #${chunk.chunkIndex}\nFRAGMENTO:\n${chunk.text.trim()}\n---`);
      usedSourcesMap.set(chunk.filename, {
        title: chunk.docTitle,
        author: chunk.docAuthor,
        location: `Fragmento #${chunk.chunkIndex}`
      });
    }

    // Fallback: If no chunks scored (or low keywords), take first 2000 chars of all docs
    if (snippets.length === 0) {
      for (const doc of docs) {
        const fullText = await this.getExtractedText(doc);
        if (fullText.trim().length > 0) {
          const excerpt = fullText.substring(0, 2500);
          snippets.push(`DOCUMENTO: "${doc.title}" (${doc.author || 'Autor no especificado'})\nFRAGMENTO INICIAL:\n${excerpt.trim()}\n---`);
          usedSourcesMap.set(doc.filename, {
            title: doc.title,
            author: doc.author || 'Autor no especificado',
            location: 'Inicio del documento'
          });
        }
      }
    }

    return {
      text: snippets.join('\n\n'),
      sources: Array.from(usedSourcesMap.values())
    };
  }

  /**
   * Returns whether a valid File Search Store ID is configured OR local knowledge docs exist.
   */
  isConfigured(): boolean {
    return this.getFileSearchStoreId() !== null || this.getDocuments().length > 0;
  }
}

export const fileSearchService = new FileSearchService();
