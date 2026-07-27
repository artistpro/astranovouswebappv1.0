import { AnalysisRequest, AnalysisResponse } from '../../types';

export class InterpretationCacheService {
  private cache = new Map<string, { data: AnalysisResponse; timestamp: number }>();
  private readonly ttlMs = 1000 * 60 * 60 * 24; // 24-hour cache TTL

  generateCacheKey(req: AnalysisRequest): string {
    const sel = req.selection;
    const bodiesKey = (sel.bodies || []).sort().join('-');
    const signsKey = (sel.signs || []).sort().join('-');
    const housesKey = (sel.houses || []).sort().join('-');
    return `${req.chartId || 'global'}_${sel.configurationType}_${bodiesKey}_${signsKey}_${housesKey}_${sel.aspect || ''}_${sel.zodiacSystem || ''}_${sel.houseSystem || ''}`;
  }

  get(req: AnalysisRequest): AnalysisResponse | null {
    if (req.forceRegenerate) return null;

    const key = this.generateCacheKey(req);
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return { ...item.data, cached: true };
  }

  set(req: AnalysisRequest, response: AnalysisResponse): void {
    const key = this.generateCacheKey(req);
    this.cache.set(key, { data: response, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const interpretationCacheService = new InterpretationCacheService();
