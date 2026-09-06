import { SimulationConfig, SimulationResult } from '../types/simulation';
import { ExperimentConfig, ExperimentResult } from '../types/experiment';
import { LiveDemoPreset, VivaData } from '../types/presentation';

const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '') as string;
const API_BASE_URL = envUrl
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function runSimulation(config: SimulationConfig): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE_URL}/simulate/bb84`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Simulation request failed');
  }

  return response.json();
}

export async function runExperiment(config: ExperimentConfig): Promise<ExperimentResult> {
  const response = await fetch(`${API_BASE_URL}/experiments/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Experiment request failed');
  }

  return response.json();
}

export async function getLiveDemos(): Promise<{ demos: LiveDemoPreset[] }> {
  const response = await fetch(`${API_BASE_URL}/presentation/demos`);
  if (!response.ok) {
    throw new Error('Failed to fetch presentation live demos');
  }
  return response.json();
}

export async function getVivaQuestions(): Promise<VivaData> {
  const response = await fetch(`${API_BASE_URL}/presentation/viva`);
  if (!response.ok) {
    throw new Error('Failed to fetch viva question bank');
  }
  return response.json();
}

export async function getExperimentTemplates(): Promise<{ templates: any[] }> {
  const response = await fetch(`${API_BASE_URL}/experiments/templates`);
  if (!response.ok) {
    throw new Error('Failed to fetch experiment templates');
  }
  return response.json();
}

