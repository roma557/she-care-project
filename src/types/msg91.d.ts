interface Msg91OtpSuccessData {
  message?: string;
  type?: string;
  accessToken?: string;
  token?: string;
  reqId?: string;
  [key: string]: unknown;
}

interface Msg91OtpConfig {
  widgetId: string;
  tokenAuth: string;
  identifier?: string;
  exposeMethods?: boolean | string;
  captchaRenderId?: string;
  success?: (data: Msg91OtpSuccessData) => void;
  failure?: (error: unknown) => void;
}

interface Window {
  initSendOTP?: (config: Msg91OtpConfig) => void;
  sendOtp?: (
    identifier: string,
    success?: (data: Msg91OtpSuccessData) => void,
    failure?: (error: unknown) => void,
  ) => void;
  verifyOtp?: (
    otp: string,
    success?: (data: Msg91OtpSuccessData) => void,
    failure?: (error: unknown) => void,
  ) => void;
  retryOtp?: (
    channel?: number | string,
    success?: (data: Msg91OtpSuccessData) => void,
    failure?: (error: unknown) => void,
  ) => void;
}
