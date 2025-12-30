
export interface CaptionSegment {
  startTime: number;
  endTime: number;
  text: string;
  isHighlight?: boolean;
}

export interface HighlightClip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  engagementScore: number;
  subjectPositionX: number; // 0 to 100
  captions: CaptionSegment[];
  description: string;
  videoUrl: string; // Real processed video URL from backend
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  FETCHING_METADATA = 'FETCHING_METADATA',
  PROCESSING = 'PROCESSING', // Backend downloading/cropping
  ANALYZING = 'ANALYZING',
  REFRAMING = 'REFRAMING',
  GENERATING_CAPTIONS = 'GENERATING_CAPTIONS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface VideoMetadata {
  id: string;
  duration: number;
  width: number;
  height: number;
  name: string;
  originalUrl: string;
  description?: string;
}

export interface BackendProcessResponse {
  jobId: string;
  status: string;
  metadata: VideoMetadata;
  clips?: HighlightClip[];
}
