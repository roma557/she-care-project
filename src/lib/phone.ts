/** iPhone 14/15/16 Pro logical viewport (393 × 852 pt) */
export const PHONE = {
  width: 393,
  height: 852,
  /** Status bar + dynamic island */
  safeTop: 54,
  /** Home indicator area */
  safeBottom: 20,
  /** Horizontal content padding */
  paddingX: 28,
  /** Bottom nav bar height (excluding safe bottom) */
  navHeight: 72,
} as const;

export const PHONE_CONTENT = {
  /** Scrollable body width */
  width: PHONE.width - PHONE.paddingX * 2,
  /** Body height when bottom nav is shown */
  bodyWithNav:
    PHONE.height -
    PHONE.safeTop -
    PHONE.navHeight -
    PHONE.safeBottom,
  /** Body height without nav */
  bodyFull:
    PHONE.height - PHONE.safeTop - PHONE.safeBottom,
} as const;

export type NavTab = "home" | "learn" | "chat" | "cycle" | "profile";

/** All navigable screens including overlay modules from home grid */
export type AppScreen = NavTab | "assessment" | "careplan" | "wellness" | "notifications";

export const OVERLAY_SCREENS: AppScreen[] = ["assessment", "careplan", "wellness", "notifications"];

/** Visual scale for the mockup on desktop — internal layout stays 393×852 */
export const PHONE_DISPLAY = {
  scale: 0.78,
  padding: 48,
  margin: 32,
} as const;

export const PHONE_FRAME = {
  bezel: 10,
  outerWidth: PHONE.width + 20,
  outerHeight: PHONE.height + 20,
} as const;
