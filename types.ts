export enum Sender {
  USER = 'USER',
  AI = 'AI'
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  sources?: Source[];
  isLoading?: boolean;
}

export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export type TimerDurations = {
  [key in TimerMode]: number;
};

export interface StudySession {
  date: string;
  durationMinutes: number;
  mode: TimerMode;
}