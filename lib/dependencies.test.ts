import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { auditDependencies, auditVulnerabilities, emptyVulnerabilityReport } from "./dependencies";

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
    (global.fetch as Mock).mockResolvedValue(mockResponse);

    const result = await auditDependencies(mockPackageJson);

    expect(result.totalDeps).toBe(2);
    expect(result.audits).toHaveLength(2);
    expect(result.audits[0].severity).not.toBe("unknown");
    expect(result.vulnerabilities).toEqual(emptyVulnerabilityReport());
  });

  it("should handle slow network with timeout", async () => {
    // Mock a pending promise that never resolves (or takes too long)
    (global.fetch as Mock).mockImplementation((_url: string, options: { signal?: AbortSignal }) => {
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

describe("auditVulnerabilities", () => {
  const mockPackageJson = JSON.stringify({
    dependencies: {
      "lodash": "4.17.20",
      "express": "4.17.1"
    }
  });

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return vulnerability counts from npm advisory API", async () => {
    const mockAdvisories = {
      "1234": {
        id: 1234,
        title: "Prototype Pollution in lodash",
        severity: "critical",
        url: "https://npmjs.com/advisories/1234",
        module_name: "lodash",
        vulnerable_versions: "<4.17.21",
      },
      "5678": {
        id: 5678,
        title: "Open Redirect in express",
        severity: "moderate",
        url: "https://npmjs.com/advisories/5678",
        module_name: "express",
        vulnerable_versions: "<4.17.3",
      },
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAdvisories,
    });

    const result = await auditVulnerabilities(mockPackageJson);

    expect(result.total).toBe(2);
    expect(result.critical).toBe(1);
    expect(result.moderate).toBe(1);
    expect(result.high).toBe(0);
    expect(result.advisories).toHaveLength(2);
    expect(result.advisories[0].moduleName).toBe("lodash");
  });

  it("should return empty report on network failure", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Network error"));

    const result = await auditVulnerabilities(mockPackageJson);

    expect(result).toEqual(emptyVulnerabilityReport());
  });

  it("should return empty report for invalid JSON", async () => {
    const result = await auditVulnerabilities("not-valid-json");

    expect(result).toEqual(emptyVulnerabilityReport());
  });

  it("should return empty report when API returns non-ok", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await auditVulnerabilities(mockPackageJson);

    expect(result).toEqual(emptyVulnerabilityReport());
  });

  it("should return empty report for package.json with no deps", async () => {
    const result = await auditVulnerabilities(JSON.stringify({ name: "empty" }));

    expect(result).toEqual(emptyVulnerabilityReport());
  });

  it("should send cleaned versions to the advisory API", async () => {
    const pkgWithPrefixes = JSON.stringify({
      dependencies: { "lodash": "^4.17.20" }
    });

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await auditVulnerabilities(pkgWithPrefixes);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ lodash: ["4.17.20"] }),
      })
    );
  });
});
