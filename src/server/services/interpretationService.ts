import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisRequest, AnalysisResponse } from '../../types';
import { fileSearchService } from './fileSearchService';
import { astrologyKnowledgeService } from './astrologyKnowledgeService';
import { interpretationCacheService } from './interpretationCacheService';

export class InterpretationService {
  private getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();

    // 1. Check if File Search Store or Local Knowledge Base is available
    const storeConfigured = fileSearchService.isConfigured();
    if (!storeConfigured) {
      console.log('[InterpretationService] Neither File Search Store nor local knowledge docs are configured.');
      return {
        id: `interp_unconfigured_${Date.now()}`,
        title: request.selection.title || 'Análisis Astrológico Documental',
        summary: 'Base documental astrológica no configurada',
        centralDynamic: 'Para habilitar las interpretaciones fundamentadas, puedes subir tus libros, manuscritos o transcripciones en la sección "Base Documental" o configurar FILE_SEARCH_STORE_ID.',
        constructiveExpressions: [],
        possibleTensions: [],
        integration: 'Haz clic en el botón "Base Documental" en la barra superior para subir tus textos astrológicos.',
        modifyingFactors: [],
        sources: [],
        generatedAt: new Date().toISOString(),
        storeConfigured: false,
        responseTimeMs: Date.now() - startTime,
      };
    }

    // 2. Check cache if forceRegenerate is false
    const cached = interpretationCacheService.get(request);
    if (cached) {
      console.log(`[InterpretationService] Returning cached response for ${cached.id}`);
      return cached;
    }

    const storeId = fileSearchService.getFileSearchStoreId();
    const searchQuery = astrologyKnowledgeService.buildSearchQuery(request.selection);
    const localKnowledge = await fileSearchService.getKnowledgeContext(searchQuery);

    let systemInstruction = `
Eres un especialista en análisis documental astrológico.
REGLAS OBLIGATORIAS Y ESTRICTAS:
1. El motor natal de la aplicación calcula las posiciones, casas, ángulos y aspectos. TUS DATOS DE ENTRADA SON DEFINITIVOS. NUNCA intentes recalcular o alterar las posiciones astronómicas ni las casas.
2. Utiliza la información y fragmentos recuperados de la base documental astrológica adjunta para fundamentar y redactar la interpretación.
3. No inventes posiciones planetarias ni calcules otros orbes.
4. Genera una síntesis en español clara, profesional y rigurosa en el campo 'summary' y 'centralDynamic'.
5. Cita explícitamente en el arreglo 'sources' los documentos o libros de donde provienen las citas o conceptos utilizados.
6. Devuelve la respuesta respetando la estructura JSON indicada.
`.trim();

    if (!storeId && localKnowledge.text) {
      systemInstruction += `\n\nBASE DOCUMENTAL ADJUNTA RECUPERADA PARA ESTA CONSULTA:\n${localKnowledge.text}`;
    }

    const userPrompt = `
Genera la interpretación astrológica documental para los siguientes datos estructurados:

- Tipo de configuración: ${request.selection.configurationType}
- Título: ${request.selection.title}
- Cuerpos implicados: ${(request.selection.bodies || []).join(', ') || 'N/A'}
- Signos: ${(request.selection.signs || []).join(', ') || 'N/A'}
- Casas: ${(request.selection.houses || []).map((h) => `Casa ${h}`).join(', ') || 'N/A'}
- Longitudes: ${(request.selection.longitudes || []).map((l) => `${l.toFixed(2)}°`).join(', ') || 'N/A'}
- Aspecto: ${request.selection.aspect || 'N/A'}
- Separación / Orbe: ${request.selection.separation !== undefined ? `${request.selection.separation}°` : 'N/A'} (Orbe: ${request.selection.orb !== undefined ? `${request.selection.orb}°` : 'N/A'})
- Fase: ${request.selection.phase || 'N/A'}
- Sistema Zodiacal: ${request.selection.zodiacSystem || 'tropical'}
- Sistema de Casas: ${request.selection.houseSystem || 'placidus'}

Consulta de análisis: "${searchQuery}".
`.trim();

    try {
      const ai = this.getAiClient();

      const configObj: any = {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Título de la configuración astrológica' },
            summary: { type: Type.STRING, description: 'Resumen o síntesis de la interpretación' },
            centralDynamic: { type: Type.STRING, description: 'Análisis de la dinámica central' },
            constructiveExpressions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Expresiones o virtudes constructivas'
            },
            possibleTensions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Posibles tensiones o retos'
            },
            integration: { type: Type.STRING, description: 'Recomendación o pautas de integración' },
            modifyingFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Factores que matizan la interpretación'
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Título del documento o libro' },
                  author: { type: Type.STRING, description: 'Autor' },
                  location: { type: Type.STRING, description: 'Ubicación, capítulo o página' }
                },
                required: ['title']
              },
              description: 'Fuentes documentales utilizadas'
            }
          },
          required: ['title', 'summary', 'centralDynamic', 'constructiveExpressions', 'possibleTensions', 'integration', 'sources']
        }
      };

      if (storeId) {
        configObj.tools = [
          {
            fileSearch: {
              storeNames: [storeId]
            }
          }
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: configObj
      });

      const responseTimeMs = Date.now() - startTime;
      console.log(`[InterpretationService] Completed interpretation query in ${responseTimeMs}ms`);

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        console.error('[InterpretationService] JSON Parse error:', e);
        parsed = {
          title: request.selection.title,
          summary: response.text || 'Sin contenido.',
          centralDynamic: '',
          constructiveExpressions: [],
          possibleTensions: [],
          integration: '',
          modifyingFactors: [],
          sources: localKnowledge.sources || []
        };
      }

      // Ensure fallback sources if empty from local knowledge
      if ((!parsed.sources || parsed.sources.length === 0) && localKnowledge.sources.length > 0) {
        parsed.sources = localKnowledge.sources;
      }

      const result: AnalysisResponse = {
        id: `interp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: parsed.title || request.selection.title,
        summary: parsed.summary || '',
        centralDynamic: parsed.centralDynamic || '',
        constructiveExpressions: parsed.constructiveExpressions || [],
        possibleTensions: parsed.possibleTensions || [],
        integration: parsed.integration || '',
        modifyingFactors: parsed.modifyingFactors || [],
        sources: parsed.sources || [],
        generatedAt: new Date().toISOString(),
        storeConfigured: true,
        responseTimeMs
      };

      interpretationCacheService.set(request, result);
      return result;

    } catch (err: any) {
      const responseTimeMs = Date.now() - startTime;
      console.error('[InterpretationService] Error from Gemini / File Search:', err);

      if (err?.message?.includes('store') || err?.message?.includes('not found') || err?.status === 404) {
        return {
          id: `interp_err_${Date.now()}`,
          title: request.selection.title,
          summary: 'Base documental astrológica no configurada',
          centralDynamic: `No se pudo consultar el almacén de datos: ${err?.message || String(err)}`,
          constructiveExpressions: [],
          possibleTensions: [],
          integration: 'Sube tus documentos astrológicos usando el botón Base Documental.',
          modifyingFactors: [],
          sources: [],
          generatedAt: new Date().toISOString(),
          storeConfigured: false,
          responseTimeMs
        };
      }

      throw err;
    }
  }
}

export const interpretationService = new InterpretationService();
