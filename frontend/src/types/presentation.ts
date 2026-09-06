import { SimulationConfig } from './simulation';

export interface LiveDemoPreset {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  config: SimulationConfig;
  expected_outcomes: {
    qber: string;
    ai_status: string;
    pqc_status: string;
    security_level: string;
    key_action: string;
  };
}

export interface VivaQuestion {
  q: string;
  a: string;
  key_point: string;
}

export interface VivaCategory {
  category: string;
  questions: VivaQuestion[];
}

export interface VivaData {
  pitches: {
    pitch_30s: string;
    pitch_60s: string;
    pitch_2m: string;
  };
  question_categories: VivaCategory[];
}

export interface PresentationSlide {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  presenter_note: string;
}
