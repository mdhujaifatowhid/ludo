export type SoundName = 'dice' | 'move' | 'capture' | 'home' | 'win' | 'message' | 'join';

const FILES: Record<SoundName, string> = {
  dice: '/sounds/dice.mp3',
  move: '/sounds/move.mp3',
  capture: '/sounds/capture.mp3',
  home: '/sounds/home.mp3',
  win: '/sounds/win.mp3',
  message: '/sounds/message.mp3',
  join: '/sounds/join.mp3',
};

class SoundManager {
  private cache = new Map<SoundName, HTMLAudioElement>();
  private muted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = window.localStorage.getItem('ludo-muted') === 'true';
    }
  }

  private load(name: SoundName): HTMLAudioElement {
    let audio = this.cache.get(name);
    if (!audio) {
      audio = new Audio(FILES[name]);
      audio.preload = 'auto';
      this.cache.set(name, audio);
    }
    return audio;
  }

  play(name: SoundName) {
    if (this.muted || typeof window === 'undefined') return;
    try {
      const audio = this.load(name);
      // Clone so overlapping plays (e.g. rapid moves) don't cut each other off.
      const instance = audio.cloneNode(true) as HTMLAudioElement;
      instance.volume = 0.6;
      void instance.play().catch(() => {
        /* autoplay can be blocked before the first user gesture — ignore */
      });
    } catch {
      /* ignore playback errors */
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ludo-muted', String(this.muted));
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
}

export const sounds = new SoundManager();
