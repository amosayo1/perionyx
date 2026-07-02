export interface SuggestedQuestion {
  id: string;
  text: string;
  category: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  followUps?: string[];
  timestamp?: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export interface ContextSource {
  id: string;
  name: string;
  status: "connected" | "syncing" | "unavailable";
  lastUpdated: string;
  availability: "live" | "cached" | "scheduled";
}

export interface EnterpriseInsight {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  category: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
}

export interface Session {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  recordsAvailable: string;
  lastIndexed: string;
  status: "synced" | "syncing" | "pending";
}
