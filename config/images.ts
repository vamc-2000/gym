/**
 * Centralized Image Configuration
 * All heavy assets are served from Cloudflare R2 CDN for optimal performance.
 */

const CDN_BASE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || "https://cdn.gymstreak.com";

export const IMAGE_URLS = {
  landing: {
    one: `${CDN_BASE_URL}/landing1.png`,
    two: `${CDN_BASE_URL}/landing2.png`,
    three: `${CDN_BASE_URL}/landing3.png`,
    four: `${CDN_BASE_URL}/landing4.png`,
    five: `${CDN_BASE_URL}/landing5.png`,
  },
  workouts: {
    benchpress: `${CDN_BASE_URL}/workouts/bench_press.png`,
    deadlift: `${CDN_BASE_URL}/workouts/deadlift.png`,
    plank: `${CDN_BASE_URL}/workouts/plank.png`,
    pullup: `${CDN_BASE_URL}/workouts/pullup.png`,
    pushup: `${CDN_BASE_URL}/workouts/pushup.png`,
    pushups: `${CDN_BASE_URL}/workouts/pushup.png`,
    standardpushups: `${CDN_BASE_URL}/workouts/pushup.png`,
    standardpushup: `${CDN_BASE_URL}/workouts/pushup.png`,
    kneepushups: `${CDN_BASE_URL}/workouts/pushup.png`,
    kneepushup: `${CDN_BASE_URL}/workouts/pushup.png`,
    diamondpushups: `${CDN_BASE_URL}/workouts/pushup.png`,
    diamondpushup: `${CDN_BASE_URL}/workouts/pushup.png`,
    squat: `${CDN_BASE_URL}/workouts/squat.png`,
    squats: `${CDN_BASE_URL}/workouts/squat.png`,
    bodyweightsquats: `${CDN_BASE_URL}/workouts/squat.png`,
    bodyweightsquat: `${CDN_BASE_URL}/workouts/squat.png`,
    gobletsquats: `${CDN_BASE_URL}/workouts/squat.png`,
    gobletsquat: `${CDN_BASE_URL}/workouts/squat.png`,
    pistolsquats: `${CDN_BASE_URL}/workouts/squat.png`,
    pistolsquat: `${CDN_BASE_URL}/workouts/squat.png`,
  },
  placeholders: {
    hero: `${CDN_BASE_URL}/hero-banner.png`,
    dashboard: `${CDN_BASE_URL}/dashboard-banner.png`,
  }
};

/**
 * Helper to get local fallback if CDN fails
 */
export const getSafeImageUrl = (cdnUrl: string, fallbackPath: string) => {
  // In a real scenario, you might check if the CDN URL is valid or use an onError handler in the component
  return cdnUrl || fallbackPath;
};
