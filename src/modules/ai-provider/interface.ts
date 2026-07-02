import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  ProviderHealth,
  ModelConfig,
  AiProviderKind,
} from "./types";

export interface IAiProvider {
  readonly kind: AiProviderKind;
  readonly label: string;

  initialize(): Promise<void>;

  chat(request: CompletionRequest): Promise<CompletionResponse>;

  streamChat(
    request: CompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onDone: (result: CompletionResponse) => void,
    onError: (error: Error) => void,
  ): Promise<void>;

  embed?(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  healthCheck(): Promise<ProviderHealth>;

  getModels(): ModelConfig[];

  isAvailable(): boolean;
}
