import React, { useEffect, useRef, useState } from 'react';
import type { SceneTone } from '../types';
import { MUSIC_TRACKS } from '../constants';

interface MusicPlayerProps {
  currentTone: SceneTone | undefined;
  isMuted: boolean;
}

const FADE_DURATION = 2000; // 2 segundos
const MAX_VOLUME = 0.4; // Volumen máximo para no ser molesto

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentTone, isMuted }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const [activeTrackUrl, setActiveTrackUrl] = useState<string | null>(null);

  // Inicializar el elemento de audio
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
    }
    
    // Limpieza al desmontar el componente
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);
  
  // Gestionar el estado de silencio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Gestionar los cambios de pista
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTrackUrl = currentTone ? MUSIC_TRACKS[currentTone] : null;

    if (newTrackUrl === activeTrackUrl) {
      return; // No se necesita ningún cambio
    }

    // Limpiar siempre el intervalo anterior
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startFade = (targetVolume: number, onComplete?: () => void) => {
      const startVolume = audio.volume;
      const delta = targetVolume - startVolume;
      
      if (Math.abs(delta) < 0.01) {
        if (targetVolume === 0) audio.volume = 0;
        onComplete?.();
        return;
      }
      
      const stepTime = 50;
      const stepCount = FADE_DURATION / stepTime;
      const volumeStep = delta / stepCount;
      let currentStep = 0;

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        if (currentStep >= stepCount) {
          audio.volume = targetVolume;
          clearInterval(fadeIntervalRef.current!);
          fadeIntervalRef.current = null;
          onComplete?.();
        } else {
          audio.volume += volumeStep;
        }
      }, stepTime);
    };

    // Atenuar la pista actual
    startFade(0, () => {
      if (newTrackUrl) {
        // Cuando se atenúa, cambiar la fuente y reproducir
        setActiveTrackUrl(newTrackUrl);
        audio.src = newTrackUrl;
        audio.play().catch(e => console.error("Error al reproducir audio (el autoplay puede estar bloqueado):", e));
        // Aumentar el volumen de la nueva pista
        startFade(MAX_VOLUME);
      } else {
        // Si no hay nueva pista, simplemente pausar
        audio.pause();
        setActiveTrackUrl(null);
      }
    });

  }, [currentTone, activeTrackUrl]);

  return null; // Este componente no renderiza nada
};

export default MusicPlayer;
