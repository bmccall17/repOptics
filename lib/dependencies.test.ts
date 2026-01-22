import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auditDependencies } from "./dependencies";

describe("auditDependencies", () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should NOT flag @types/node major update as major (fix verification)", async () => {
        const packageJson = JSON.stringify({
            dependencies: {},
            devDependencies: {
                "@types/node": "^20"
            }
        });

        // Mock fetch response for @types/node
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ version: "25.0.10" })
        });

        const report = await auditDependencies(packageJson);
        const nodeAudit = report.audits.find(a => a.package === "@types/node");

        expect(nodeAudit).toBeDefined();
        // Expect severity to be "none" because of our fix
        expect(nodeAudit?.severity).toBe("none");
    });
});
