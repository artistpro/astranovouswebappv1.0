import { AnalysisSelection } from '../../types';

export class AstrologyKnowledgeService {
  /**
   * Constructs an optimized search query string for the File Search Store
   * based on the structured astrological selection.
   */
  buildSearchQuery(selection: AnalysisSelection): string {
    const parts: string[] = [];

    if (selection.title) {
      parts.push(selection.title);
    }

    if (selection.bodies && selection.bodies.length > 0) {
      parts.push(`Planetas: ${selection.bodies.join(', ')}`);
    }

    if (selection.signs && selection.signs.length > 0) {
      parts.push(`Signos: ${selection.signs.join(', ')}`);
    }

    if (selection.houses && selection.houses.length > 0) {
      parts.push(`Casas: ${selection.houses.map((h) => `Casa ${h}`).join(', ')}`);
    }

    if (selection.aspect) {
      parts.push(`Aspecto: ${selection.aspect}`);
    }

    return parts.join(' | ');
  }
}

export const astrologyKnowledgeService = new AstrologyKnowledgeService();
