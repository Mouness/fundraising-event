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
}
