import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function json(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Codex plugin package", () => {
  it("publishes Bottega itself as the Codex plugin", () => {
    const manifest = json(join(ROOT, ".codex-plugin", "plugin.json"));
    const claudeManifest = json(join(ROOT, ".claude-plugin", "plugin.json"));

    expect(basename(ROOT)).toBe("bottega");
    expect(manifest.name).toBe("bottega");
    expect(manifest.version).toBe("0.52.0");
    expect(manifest.version).toBe(claudeManifest.version);
    expect(manifest.repository).toBe("https://github.com/vadimcomanescu/bottega");
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.defaultPrompt).toBeInstanceOf(Array);
  });

  it("publishes one repo marketplace entry without a copied plugin tree", () => {
    const marketplace = json(join(ROOT, ".agents", "plugins", "marketplace.json"));

    expect(marketplace.name).toBe("bottega");
    expect(marketplace.interface.displayName).toBe("Bottega");
    expect(marketplace.plugins).toEqual([
      expect.objectContaining({
        name: "bottega",
        source: { source: "local", path: "./" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Coding",
      }),
    ]);
    expect(existsSync(join(ROOT, "plugins", "bottega"))).toBe(false);
  });

  it("documents both installs and the Codex orchestrator requirement", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");

    expect(readme).toContain("codex plugin marketplace add vadimcomanescu/bottega");
    expect(readme).toContain("codex plugin add bottega@bottega");
    expect(readme).toContain("$bottega:run");
    expect(readme).toContain("/bottega:run");
    expect(readme).toMatch(/GPT-5\.6 Sol.*Ultra/i);
    expect(agents).toContain(".codex-plugin/plugin.json");
    expect(agents).toContain(".agents/plugins/marketplace.json");
    expect(agents).toContain("host-transports.md");
    expect(agents).toContain("claude-exec");
  });
});
