import type { SceneTone } from './types';

// This constant is prepended to every image generation prompt to ensure a consistent visual style.
export const ART_STYLE_PROMPT = "Al estilo de un cómic de fantasía oscura y cruda, con tintas pesadas, sombras dinámicas y una paleta de colores apagados. ";

export const MUSIC_TRACKS: Record<SceneTone, string> = {
  mysterious: 'https://cdn.pixabay.com/download/audio/2023/08/03/audio_8041a87a2a.mp3', // Dark Castle by Dark Fantasy Studio
  calm: 'https://cdn.pixabay.com/download/audio/2023/08/03/audio_8041a87a2a.mp3', // Using the same for general ambient
  suspenseful: 'https://cdn.pixabay.com/download/audio/2022/01/27/audio_33c92b656b.mp3', // Cinematic Suspense by NaturesEye
  action: 'https://cdn.pixabay.com/download/audio/2023/04/10/audio_14886b704c.mp3', // For The King by SergeQuadrado
  somber: 'https://cdn.pixabay.com/download/audio/2022/09/16/audio_9855a73562.mp3', // The Last Goodbye by ZakharValaha
};