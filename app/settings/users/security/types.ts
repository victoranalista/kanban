export interface Result {
  success: boolean;
  message?: string;
}
export interface OtpStatus {
  enabled: boolean;
}
export interface QrResult extends Result {
  qrCode?: string;
  secret?: string;
}
