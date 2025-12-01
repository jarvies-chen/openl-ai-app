import axios from 'axios';

// Use the current hostname to allow access from other devices on the network
// If running on server side (SSR), default to localhost
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8099`;
  }
  return 'http://localhost:8099';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DatatypeField {
  name: string;
  type: string;
}

export interface Datatype {
  name: string;
  fields: DatatypeField[];
  selected: boolean;
}

export interface Rule {
  id: string;
  name?: string;
  summary: string;
  condition?: string;
  result?: string;
  source_text?: string;
  category?: string;
  selected: boolean;
  rule_type?: string;
  related_datatypes?: string[];
  related_constants?: string[];
}

export interface ExtractionResponse {
  rules: Rule[];
  datatypes: Datatype[];
}

export interface GenerationRequest {
  rules: Rule[];
  datatypes: Datatype[];
}

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const krakenUploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/kraken-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const extractRules = async (text: string): Promise<ExtractionResponse> => {
  const response = await api.post('/extract-rules', { text });
  return response.data;
};

export const generateExcel = async (rules: Rule[], datatypes: Datatype[]) => {
  const response = await api.post('/generate-excel', { rules, datatypes });
  return response.data;
};

export interface VersionMetadata {
  version: number;
  filename: string;
  original_filename: string;
  file_hash: string;
  created_at: string;
  rules_path: string;
  file_path: string;
  comments?: string | null;
}

export interface DiffResult {
  added: Rule[];
  removed: Rule[];
  modified: { rule: Rule; changes: Record<string, { old: any; new: any }> }[];
}

export interface DocumentSummary {
  base_filename: string;
  version_count: number;
  latest_version: VersionMetadata | null;
}

export interface RuleHistoryEntry {
  version: number;
  created_at: string;
  comments: string | null;
  rule: Rule;
}

export const saveVersion = async (filename: string, rules: Rule[], tempPath?: string, textContent?: string, comments?: string): Promise<VersionMetadata> => {
  const response = await api.post(`/save-version`, { rules, text_content: textContent, comments }, {
    params: { filename, temp_path: tempPath }
  });
  return response.data;
};

export const getVersions = async (filename: string): Promise<VersionMetadata[]> => {
  const response = await api.get(`/versions/${encodeURIComponent(filename)}`);
  return response.data;
};

export const getDocuments = async (): Promise<DocumentSummary[]> => {
  const response = await api.get('/documents');
  return response.data;
};

export const getRulesVersion = async (filename: string, version: number): Promise<Rule[]> => {
  const response = await api.get(`/rules/${encodeURIComponent(filename)}/${version}`);
  return response.data;
};

export const getDiff = async (filename: string, v_old: number, v_new: number): Promise<DiffResult> => {
  const response = await api.get(`/diff/${encodeURIComponent(filename)}/${v_old}/${v_new}`);
  return response.data;
};

export const getRuleHistory = async (filename: string, ruleId: string): Promise<RuleHistoryEntry[]> => {
  const response = await api.get(`/rule-history/${encodeURIComponent(filename)}/${encodeURIComponent(ruleId)}`);
  return response.data;
};

export const getDocumentContent = async (filename: string, version: number): Promise<{ content: string }> => {
  const response = await api.get(`/document-content/${encodeURIComponent(filename)}/${version}`);
  return response.data;
};

export interface CandidateRule {
  id: string;
  name: string;
  summary: string;
  source_text: string;
  selected: boolean;
}

export const extractCandidates = async (text: string): Promise<CandidateRule[]> => {
  const response = await api.post('/extract-candidates', { text });
  return response.data;
};

export const enrichRules = async (rules: CandidateRule[], text: string): Promise<ExtractionResponse> => {
  const response = await api.post('/enrich-rules', { rules, text });
  return response.data;
};

export const deleteDocument = async (filename: string) => {
  const response = await api.delete(`/delete-document/${encodeURIComponent(filename)}`);
  return response.data;
};

export const generateKrakenRules = async (excelData: { summary: string; source_text: string }[]) => {
  const response = await api.post('/generate-kraken-rules', { excel_data: excelData });
  return response.data;
};

export const krakenDownload = async (data: { file_name: string; name_space: string; generated_rules: string }) => {
  const response = await api.post('/kraken-download', data);
  return response.data;
};
