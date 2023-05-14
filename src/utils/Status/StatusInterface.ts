export interface ServerStatus {
  name: string;
  status: string | any;
  message?: string;
  timestamp: Date;
}
