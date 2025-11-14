import { GoogleGenAI, Type } from '@google/genai';
import type { GameState } from '../types';
import { ART_STYLE_PROMPT } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("La variable de entorno API_KEY no está configurada");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    storyText: {
      type: Type.STRING,
      description: 'La siguiente parte de la historia. Debe ser atractiva y descriptiva.'
    },
    choices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Un array de 3 opciones distintas para que el jugador elija.'
    },
    inventory: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'El inventario actual del jugador. Actualízalo basándote en los eventos de la historia.'
    },
    currentQuest: {
      type: Type.STRING,
      description: 'La misión u objetivo principal actual del jugador. Actualízala si la historia progresa.'
    },
    tone: {
      type: Type.STRING,
      description: "El tono emocional o la atmósfera de la escena. Debe ser uno de los siguientes: 'mysterious', 'action', 'suspenseful', 'somber', 'calm'."
    }
  },
  required: ['storyText', 'choices', 'inventory', 'currentQuest', 'tone']
};

const generateImage = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = ART_STYLE_PROMPT + prompt;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No se generó ninguna imagen.");
  } catch (error) {
    console.error("Error al generar la imagen:", error);
    // Return a placeholder image on failure
    return `https://picsum.photos/seed/${Date.now()}/1280/720`;
  }
};


export const getNextStoryPart = async (
  playerChoice: string,
  storyHistory: string[],
  inventory: string[],
  currentQuest: string
): Promise<GameState> => {
  const isNewGame = playerChoice === 'start_game';

  const prompt = isNewGame
    ? `Inicia una historia de elige tu propia aventura. Proporciona la escena inicial, 3 opciones, un inventario vacío, la primera misión y el tono inicial de la escena ('mysterious'). El tema es fantasía oscura.`
    : `
      Eres un maestro narrador para un juego infinito de elige tu propia aventura.
      La historia hasta ahora es: "${storyHistory.join(' -> ')}".
      El inventario actual del jugador es: [${inventory.join(', ')}].
      La misión actual es: "${currentQuest}".
      El jugador acaba de elegir: "${playerChoice}".

      Continúa la historia. La elección del usuario debe alterar genuinamente la trama.
      Actualiza el inventario y la misión si es necesario basándose en los nuevos eventos de la historia.
      Determina el tono emocional de la escena (elige uno de: 'mysterious', 'action', 'suspenseful', 'somber', 'calm').
      Proporciona la siguiente parte de la historia, 3 nuevas opciones, la lista de inventario actualizada, la descripción de la misión actualizada y el tono de la escena.
      Mantén un tono de fantasía oscura consistente.
      Asegúrate de que la historia sea atractiva y avance.
    `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8,
    },
  });

  const text = response.text.trim();
  let parsedResponse;

  try {
    parsedResponse = JSON.parse(text);
  } catch (e) {
    console.error("Error al analizar el JSON del modelo:", text);
    throw new Error("El modelo devolvió un formato de historia no válido.");
  }

  const { storyText, choices, inventory: newInventory, currentQuest: newQuest, tone } = parsedResponse;

  if (!storyText || !choices || !newInventory || !newQuest || !tone) {
    throw new Error("A la respuesta del modelo le faltaban campos obligatorios.");
  }

  // Generate image based on the new story text
  const imageUrl = await generateImage(storyText);

  return {
    storyText,
    choices,
    inventory: newInventory,
    currentQuest: newQuest,
    imageUrl,
    tone,
  };
};