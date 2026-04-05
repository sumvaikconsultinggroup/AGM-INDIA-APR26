export const useIsMissionDomain = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname.includes("avdheshanandgmission.org");
  }
  return false;
};
