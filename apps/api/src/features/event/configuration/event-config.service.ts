import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { loadConfig } from '@fundraising/white-labeling';
import type { EventConfig } from '@fundraising/white-labeling';

@Injectable()
export class EventConfigService implements OnModuleInit {
    private readonly logger = new Logger(EventConfigService.name);
    private config: EventConfig | null = null;
    private readonly configPath: string;

    constructor(private readonly configService: ConfigService) {
        // Development: Fallback to local 'event-config.json' in API root if it exists
        const defaultDevPath = path.join(process.cwd(), 'event-config.json');
        this.configPath = this.configService.get('EVENT_CONFIG_PATH') || defaultDevPath;
    }

    async onModuleInit() {
        await this.loadConfig();
    }

    async loadConfig() {
        try {
            this.logger.log(`Loading custom config from: ${this.configPath}`);
            const data = await fs.readFile(this.configPath, 'utf-8');
            const customConfig = JSON.parse(data) as Partial<EventConfig>;
            this.config = loadConfig(customConfig);
            this.logger.log(`Event config loaded: ${this.config.content.title}`);
        } catch (error) {
            this.logger.warn(`No custom config found or failed to load (${error.message}). Using defaults.`);
            this.config = loadConfig();
        }
    }

    getConfig(): EventConfig {
        return this.config || loadConfig();
    }

    async getThemeVariable(variable: string, fallback: string = ''): Promise<string> {
        try {
            // 1. Try Custom Sibling Theme (The Cascade)
            const configDir = path.dirname(this.configPath);
            const customThemePath = path.join(configDir, 'theme.css');
            const customValue = await this.extractVariableFromFile(customThemePath, variable);

            if (customValue) return customValue;

            // 2. Default Package Theme
            const { createRequire } = await import('module');
            const require = createRequire(path.join(process.cwd(), 'package.json'));
            const defaultThemePath = require.resolve('@fundraising/white-labeling/css');

            return await this.extractVariableFromFile(defaultThemePath, variable) || fallback;
        } catch (error) {
            return fallback;
        }
    }

    private async extractVariableFromFile(filePath: string, variable: string): Promise<string | null> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Matches: --variable: value; or --variable: value (end of line/file)
            const regex = new RegExp(`${variable}:\\s*([^;\\n\\r]+);?`);
            const match = content.match(regex);
            return match ? match[1].trim() : null;
        } catch {
            return null;
        }
    }
}
