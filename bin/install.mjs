#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = join(__dirname, "..");

const PLUGIN_NAME = "promptlint";
const PLUGIN_VERSION = JSON.parse(
  readFileSync(join(PLUGIN_ROOT, "package.json"), "utf8")
).version;

const CLAUDE_DIR = join(homedir(), ".claude");
const PLUGINS_DIR = join(CLAUDE_DIR, "plugins");
const CACHE_DIR = join(PLUGINS_DIR, "cache", "npm");
const INSTALL_DIR = join(CACHE_DIR, PLUGIN_NAME, PLUGIN_VERSION);
const INSTALLED_PLUGINS_FILE = join(PLUGINS_DIR, "installed_plugins.json");
const SETTINGS_FILE = join(CLAUDE_DIR, "settings.json");
const PLUGIN_KEY = `${PLUGIN_NAME}@npm`;

// --- Helpers ---

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readJSON(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

// --- Uninstall ---

function uninstall() {
  console.log(`\nUninstalling ${PLUGIN_NAME}...\n`);

  // Remove from installed_plugins.json
  if (existsSync(INSTALLED_PLUGINS_FILE)) {
    const registry = readJSON(INSTALLED_PLUGINS_FILE, { version: 2, plugins: {} });
    if (registry.plugins[PLUGIN_KEY]) {
      delete registry.plugins[PLUGIN_KEY];
      writeJSON(INSTALLED_PLUGINS_FILE, registry);
      console.log("  ✓ Removed from plugin registry");
    }
  }

  // Remove from settings.json
  if (existsSync(SETTINGS_FILE)) {
    const settings = readJSON(SETTINGS_FILE, {});
    if (settings.enabledPlugins && settings.enabledPlugins[PLUGIN_KEY]) {
      delete settings.enabledPlugins[PLUGIN_KEY];
      writeJSON(SETTINGS_FILE, settings);
      console.log("  ✓ Removed from settings");
    }
  }

  console.log(`\n  ${PLUGIN_NAME} has been uninstalled.`);
  console.log("  Restart Claude Code to apply changes.\n");
  process.exit(0);
}

// --- Install ---

function install() {
  console.log(`\nInstalling ${PLUGIN_NAME} v${PLUGIN_VERSION} for Claude Code...\n`);

  // 1. Copy plugin files to cache
  ensureDir(INSTALL_DIR);

  const filesToCopy = [".claude-plugin", "commands", "skills", "evals", "LICENSE", "README.md"];
  for (const entry of filesToCopy) {
    const src = join(PLUGIN_ROOT, entry);
    const dest = join(INSTALL_DIR, entry);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true });
    }
  }
  console.log(`  ✓ Plugin files copied to ${INSTALL_DIR}`);

  // 2. Register in installed_plugins.json
  ensureDir(PLUGINS_DIR);
  const registry = readJSON(INSTALLED_PLUGINS_FILE, { version: 2, plugins: {} });

  registry.plugins[PLUGIN_KEY] = [
    {
      scope: "user",
      installPath: INSTALL_DIR,
      version: PLUGIN_VERSION,
      installedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  ];

  writeJSON(INSTALLED_PLUGINS_FILE, registry);
  console.log("  ✓ Registered in plugin registry");

  // 3. Enable in settings.json
  const settings = readJSON(SETTINGS_FILE, {});
  if (!settings.enabledPlugins) {
    settings.enabledPlugins = {};
  }
  settings.enabledPlugins[PLUGIN_KEY] = true;
  writeJSON(SETTINGS_FILE, settings);
  console.log("  ✓ Enabled in Claude Code settings");

  // 4. Done
  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${PLUGIN_NAME} v${PLUGIN_VERSION} installed!

  Restart Claude Code, then run:
    /promptlint <prompt-file> <use case>

  Example:
    /promptlint ./system-prompt.md Agentic support bot

  To uninstall:
    npx promptlint --uninstall
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// --- Main ---

const args = process.argv.slice(2);

if (args.includes("--uninstall") || args.includes("uninstall")) {
  uninstall();
} else if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  promptlint - A linter for LLM prompts (Claude Code plugin)

  Usage:
    npx promptlint            Install the plugin into Claude Code
    npx promptlint --uninstall  Remove the plugin from Claude Code

  After installing, restart Claude Code and use:
    /promptlint <prompt-file> <use case description>
`);
} else {
  install();
}
