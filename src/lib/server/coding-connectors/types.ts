import type {
  CodingActivityItem,
  CodingMetrics,
  CodingPlatform,
} from "@/lib/student/types";

export interface ConnectorFetchResult {
  ok: boolean;
  platform: CodingPlatform;
  username: string;
  profileUrl: string;
  avatarUrl?: string;
  metrics: CodingMetrics;
  activities: CodingActivityItem[];
  error?: string;
}

export interface PlatformConnector {
  sync(studentId: string, username: string): Promise<ConnectorFetchResult>;
}
