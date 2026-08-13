/**
 * FE 07: Web Performance & Core Web Vitals Helper
 * Uses PerformanceObserver API to track LCP, CLS, and INP metrics in the browser console.
 */
export function initPerformanceMonitoring() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  try {
    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (import.meta.env?.DEV) {
        console.log(`[Web Vitals] LCP: ${Math.round(lastEntry.startTime)}ms`, lastEntry);
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // Monitor Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      if (import.meta.env?.DEV) {
        console.log(`[Web Vitals] CLS: ${clsValue.toFixed(4)}`);
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch (err) {
    // Ignore unsupported observers in older browser environments
  }
}
