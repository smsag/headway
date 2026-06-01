import { App, PluginSettingTab, Setting } from "obsidian";
import type HeadwayPlugin from "./main";
import {
  MAX_OVERLAY_VISIBLE_ROWS,
  MIN_OVERLAY_VISIBLE_ROWS,
  normalizeSettings
} from "./services/plugin-settings";

export class HeadwaySettingTab extends PluginSettingTab {
  plugin: HeadwayPlugin;

  constructor(app: App, plugin: HeadwayPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Max visible rows")
      .setDesc("Maximum number of rows visible in expanded sibling lists.")
      .addSlider((slider) => {
        slider
          .setDynamicTooltip()
          .setLimits(MIN_OVERLAY_VISIBLE_ROWS, MAX_OVERLAY_VISIBLE_ROWS, 1)
          .setValue(this.plugin.settings.overlayMaxVisibleRows)
          .onChange(async (value) => {
            this.plugin.settings = normalizeSettings({
              ...this.plugin.settings,
              overlayMaxVisibleRows: value
            });
            await this.plugin.saveSettings();
            this.plugin.requestOverlayRefresh();
          });
      });
  }
}
