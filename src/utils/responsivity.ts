export type screenType = "mobile" | "desktop";

export const getScreenType = (w: number): screenType => {
  if (w > 720) {
    return "desktop";
  } else {
    return "mobile";
  }
};