import { GoogleGenAI, Type } from '@google/genai';
import { CalculationResponse, FullProfileResponse, ZODIAC_SIGNS } from '../../types';
import { fileSearchService } from './fileSearchService';

export class FullProfileService {
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

  async generateProfile(chartData: CalculationResponse): Promise<FullProfileResponse> {
    const startTime = Date.now();

    const { normalizedData, planets, angles, houseCusps, aspects } = chartData;

    // 1. Calculate elemental and modality balance
    let fuego = 0, tierra = 0, aire = 0, agua = 0;
    let cardinal = 0, fijo = 0, mutable = 0;

    const signMap = new Map(ZODIAC_SIGNS.map((s) => [s.name.toLowerCase(), s]));

    planets.forEach((p) => {
      const signInfo = signMap.get(p.sign.toLowerCase());
      if (signInfo) {
        if (signInfo.element === 'Fuego') fuego++;
        else if (signInfo.element === 'Tierra') tierra++;
        else if (signInfo.element === 'Aire') aire++;
        else if (signInfo.element === 'Agua') agua++;

        if (signInfo.modality === 'Cardinal') cardinal++;
        else if (signInfo.modality === 'Fijo') fijo++;
        else if (signInfo.modality === 'Mutable') mutable++;
      }
    });

    // 2. Build summary string of chart positions
    const sun = planets.find((p) => p.key === 'sun');
    const moon = planets.find((p) => p.key === 'moon');
    const ascendant = angles.find((a) => a.key === 'ascendant');
    const midheaven = angles.find((a) => a.key === 'midheaven');

    const planetsList = planets
      .map((p) => `${p.name} en ${p.sign} (${p.formattedDMS}), Casa ${p.house} [${p.motion}]`)
      .join('\n');

    const anglesList = angles
      .map((a) => `${a.name} (${a.abbreviation}): ${a.sign} (${a.formattedDMS})`)
      .join('\n');

    const majorAspects = aspects
      .slice(0, 12)
      .map((asp) => `${asp.bodyA} ${asp.aspectSymbol} (${asp.aspect}) ${asp.bodyB} - Orbe: ${asp.orb}° (${asp.motionRelation})`)
      .join('\n');

    // Build RAG query
    const ragQuery = `
Sol en ${sun?.sign || ''} Luna en ${moon?.sign || ''} Ascendente ${ascendant?.sign || ''} Medio Cielo ${midheaven?.sign || ''}
${planets.map((p) => `${p.name} ${p.sign} casa ${p.house}`).join(' ')}
    `.trim();

    const localKnowledge = await fileSearchService.getKnowledgeContext(ragQuery);
    const storeId = fileSearchService.getFileSearchStoreId();

    let systemInstruction = `
Eres un reconocido máster en Astrología Psicológica y Tradicional, especializado en la elaboración de Perfiles Natales Integrales.
REGLAS OBLIGATORIAS:
1. Las posiciones planetarias, casas y aspectos proporcionados han sido calculados con precisión astronómica por el motor natal. NUNCA alteres ni recalcules ningún dato astronómico.
2. Utiliza la base documental astrológica adjunta (libros, tratados y manuales) para fundamentar y enriquecer las interpretaciones psicodinámicas, citando a los autores o textos siempre que sea relevante.
3. El Perfil Natal debe ser sumamente detallado, fluido, motivador y profesional, ofreciendo al consultante una visión profunda e integradora de su arquitectura psíquica.
4. Genera todas las explicaciones en español impecable y estructurado.
5. Devuelve estrictamente el JSON con la estructura solicitada.
`.trim();

    if (!storeId && localKnowledge.text) {
      systemInstruction += `\n\nBASE DOCUMENTAL ADJUNTA RECUPERADA PARA ESTE ANÁLISIS PERFILAR:\n${localKnowledge.text}`;
    }

    const userPrompt = `
Genera un PERFIL NATAL GENERAL DETALLADO para el consultante con los siguientes datos natales:

Consultante: ${normalizedData.name || 'Consultante'}
Lugar de Nacimiento: ${normalizedData.locationName}
Fecha/Hora Local: ${normalizedData.localTime}
Sistema de Casas: ${normalizedData.houseSystemLabel}

--- BALANCE ELEMENTAL Y MODAL ---
- Fuego: ${fuego} planetas
- Tierra: ${tierra} planetas
- Aire: ${aire} planetas
- Agua: ${agua} planetas
- Cardinal: ${cardinal} planetas | Fijo: ${fijo} planetas | Mutable: ${mutable} planetas

--- POSICIONES PLANETARIAS ---
${planetsList}

--- ÁNGULOS PRINCIPALES ---
${anglesList}

--- ASPECTOS MAYORES CLAVE ---
${majorAspects}

Estructura el perfil cubriendo:
1. Un resumen ejecutivo del perfil natal.
2. Análisis del balance de elementos y modalidades (temperamento).
3. Eje de Identidad Vital: La combinación del Sol (Esencia), Luna (Mundo Emocional/Seguridad) y Ascendente (Canal de Expresión y Aprendizaje).
4. Mente, Vínculos y Acción: Mercurio, Venus y Marte (signos, casas y aspectos).
5. Vocación, Propósito y Estructura: Júpiter, Saturno, Casas IX/X y Medio Cielo.
6. Fuerzas Transpersonales y Transformación: Urano, Neptuno, Plutón y Nodos Lunares.
7. Síntesis de Integración Consciente: Fortalezas clave, principales tensiones a canalizar y consejo evolutivo.
`.trim();

    try {
      const ai = this.getAiClient();

      const configObj: any = {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consultantName: { type: Type.STRING },
            birthDetails: { type: Type.STRING },
            executiveSummary: { type: Type.STRING, description: 'Resumen o diagnóstico general de la carta natal' },
            elementalAnalysis: { type: Type.STRING, description: 'Interpretación profunda del balance de elementos y modalidades' },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  content: { type: Type.STRING },
                  keyInsights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'category', 'content']
              }
            },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Fortalezas y dones principales'
            },
            mainChallenges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Desafíos, fricciones o tensiones a integrar'
            },
            integrationGuidance: { type: Type.STRING, description: 'Orientación de síntesis evolutiva y desarrollo personal' },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ['title']
              }
            }
          },
          required: ['consultantName', 'birthDetails', 'executiveSummary', 'elementalAnalysis', 'sections', 'keyStrengths', 'mainChallenges', 'integrationGuidance', 'sources']
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
      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        console.error('[FullProfileService] JSON parse error:', e);
        parsed = {
          consultantName: normalizedData.name || 'Consultante',
          birthDetails: `${normalizedData.locationName}, ${normalizedData.localTime}`,
          executiveSummary: response.text || 'Perfil generado.',
          elementalAnalysis: 'Análisis de elementos.',
          sections: [],
          keyStrengths: [],
          mainChallenges: [],
          integrationGuidance: '',
          sources: localKnowledge.sources || []
        };
      }

      // Ensure fallback sources if empty
      if ((!parsed.sources || parsed.sources.length === 0) && localKnowledge.sources.length > 0) {
        parsed.sources = localKnowledge.sources;
      }

      const result: FullProfileResponse = {
        id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        consultantName: parsed.consultantName || normalizedData.name || 'Consultante',
        birthDetails: parsed.birthDetails || `${normalizedData.locationName} (${normalizedData.localTime})`,
        executiveSummary: parsed.executiveSummary || '',
        elementalBalance: {
          fuego,
          tierra,
          aire,
          agua,
          cardinal,
          fijo,
          mutable,
          analysis: parsed.elementalAnalysis || ''
        },
        sections: parsed.sections || [],
        keyStrengths: parsed.keyStrengths || [],
        mainChallenges: parsed.mainChallenges || [],
        integrationGuidance: parsed.integrationGuidance || '',
        sources: parsed.sources || [],
        generatedAt: new Date().toISOString(),
        storeConfigured: fileSearchService.isConfigured(),
        responseTimeMs
      };

      return result;

    } catch (err: any) {
      console.error('[FullProfileService] Error generating full profile:', err);
      throw err;
    }
  }
}

export const fullProfileService = new FullProfileService();
