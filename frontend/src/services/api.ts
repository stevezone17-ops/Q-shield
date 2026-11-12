import { SimulationConfig, SimulationResult } from '../types/simulation';
import { ExperimentConfig, ExperimentResult } from '../types/experiment';
import { LiveDemoPreset, VivaData } from '../types/presentation';

const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '') as string;
export const API_BASE_URL = envUrl
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export class ApiError extends Error {
  status?: number;
  operation: string;
  endpoint: string;

  constructor(message: string, operation: string, endpoint: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.operation = operation;
    this.endpoint = endpoint;
    this.status = status;
  }
}

async function handleResponse<T>(response: Response, operation: string, endpoint: string): Promise<T> {
  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Body not JSON
    }

    if (response.status === 404) {
      throw new ApiError(
        `[${operation} 404 Not Found] Endpoint "${endpoint}" does not exist on target server (${errorDetail}). Verify Q-SHIELD backend routing on dedicated port 8002.`,
        operation,
        endpoint,
        404
      );
    } else if (response.status === 500) {
      throw new ApiError(
        `[${operation} 500 Server Error] Internal error at "${endpoint}": ${errorDetail}`,
        operation,
        endpoint,
        500
      );
    } else if (response.status === 422) {
      throw new ApiError(
        `[${operation} 422 Validation Error] Invalid request payload sent to "${endpoint}": ${JSON.stringify(errorDetail)}`,
        operation,
        endpoint,
        422
      );
    } else {
      throw new ApiError(
        `[${operation} Error ${response.status}] Request to "${endpoint}" failed: ${errorDetail}`,
        operation,
        endpoint,
        response.status
      );
    }
  }

  return response.json();
}

export interface HealthStatus {
  status: string;
  service: string;
  app_id?: string;
  port?: number;
  stage?: string;
  version?: string;
}

export async function checkHealth(): Promise<HealthStatus> {
  const endpoint = `${API_BASE_URL}/health`;
  try {
    const response = await fetch(endpoint);
    const data = await handleResponse<HealthStatus>(response, 'Health Check', endpoint);

    // Verify service identity: must identify as q-shield application
    const isQShield =
      data.app_id === 'q-shield' ||
      (data.service && data.service.toLowerCase().includes('q-shield'));

    if (!isQShield) {
      throw new ApiError(
        `[Health Check Conflict] Connected to unexpected service "${data.service}" on port 8002. Expected "Q-SHIELD BB84 Simulator API".`,
        'Health Check',
        endpoint,
        409
      );
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `[Health Check Connection Error] Unable to connect to Q-SHIELD backend at "${endpoint}". Ensure FastAPI is running on http://127.0.0.1:8002. (${err.message})`,
      'Health Check',
      endpoint
    );
  }
}

export async function runSimulation(config: SimulationConfig): Promise<SimulationResult> {
  const endpoint = `${API_BASE_URL}/simulate/bb84`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    return await handleResponse<SimulationResult>(response, 'Simulation', endpoint);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `[Simulation Connection Error] Network request failed for "${endpoint}": ${err.message}`,
      'Simulation',
      endpoint
    );
  }
}

export async function runExperiment(config: ExperimentConfig): Promise<ExperimentResult> {
  const endpoint = `${API_BASE_URL}/experiments/run`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    return await handleResponse<ExperimentResult>(response, 'Experiment', endpoint);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `[Experiment Connection Error] Network request failed for "${endpoint}": ${err.message}`,
      'Experiment',
      endpoint
    );
  }
}

export async function getLiveDemos(): Promise<{ demos: LiveDemoPreset[] }> {
  const endpoint = `${API_BASE_URL}/presentation/demos`;
  try {
    const response = await fetch(endpoint);
    return await handleResponse<{ demos: LiveDemoPreset[] }>(response, 'Live Demos', endpoint);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `[Presentation Demos Error] Failed to fetch live demos from "${endpoint}": ${err.message}`,
      'Live Demos',
      endpoint
    );
  }
}

export async function getVivaQuestions(): Promise<VivaData> {
  const endpoint = `${API_BASE_URL}/presentation/viva`;
  try {
    const response = await fetch(endpoint);
    return await handleResponse<VivaData>(response, 'Viva Questions', endpoint);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `[Viva Questions Error] Failed to fetch viva question bank from "${endpoint}": ${err.message}`,
      'Viva Questions',
      endpoint
    );
  }
}

export async function getExperimentTemplates(): Promise<{ templates: any[] }> {
  const endpoint = `${API_BASE_URL}/experiments/templates`;
  try {
    const response = await fetch(endpoint);
    return await handleResponse<{ templates: any[] }>(response, 'Experiment Templates', endpoint);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `[Experiment Templates Error] Failed to fetch templates from "${endpoint}": ${err.message}`,
      'Experiment Templates',
      endpoint
    );
  }
}
