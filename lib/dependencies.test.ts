import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auditDependencies } from "./dependencies";

describe("auditDependencies", () => {
  const mockPackageJson = JSON.stringify({
    dependencies: {
      "react": "18.2.0",
      "next": "13.4.0"
    }
  });

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return correct audit results when registry responds", async () => {
    // Mock successful response
    const mockResponse = {
      ok: true,
      json: async () => ({ version: "18.3.0" }) // Newer version
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await auditDependencies(mockPackageJson);

    expect(result.totalDeps).toBe(2);
    expect(result.audits).toHaveLength(2);
    expect(result.audits[0].severity).not.toBe("unknown");
  });

  it("should handle slow network with timeout", async () => {
    // Mock a pending promise that never resolves (or takes too long)
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve({
             ok: true,
             json: async () => ({ version: "18.3.0" })
          });
        }, 10000); // 10 seconds delay

        if (options?.signal) {
            if (options.signal.aborted) {
                clearTimeout(timeoutId);
                reject(new DOMException("The operation was aborted", "AbortError"));
            } else {
                options.signal.addEventListener("abort", () => {
                    clearTimeout(timeoutId);
                    reject(new DOMException("The operation was aborted", "AbortError"));
                });
            }
        }
      });
    });

    const promise = auditDependencies(mockPackageJson);

    // Fast forward time by 6 seconds (timeout should be 5s)
    vi.advanceTimersByTime(6000);

    const result = await promise;

    expect(result.audits).toHaveLength(2);
    // Should be unknown/error because it timed out
    expect(result.audits[0].latestVersion).toBe("error");
    expect(result.audits[0].impact).toBe("Network error checking version");
  }, 10000);
});
