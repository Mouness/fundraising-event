import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { loadConfigs, deepMerge } from '@fundraising/white-labeling';
import type { EventConfig } from '@fundraising/white-labeling';
import { PrismaService } from '../../../database/prisma.service';



@Injectable()
export class EventConfigService implements OnModuleInit {
    private readonly logger = new Logger(EventConfigService.name);
    private config: EventConfig | null = null;
    private readonly configPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        // Development: Fallback to local 'event-config.json' in API root if it exists
        const defaultDevPath = path.join(process.cwd(), 'event-config.json');
        this.configPath = this.configService.get('EVENT_CONFIG_PATH') || defaultDevPath;
    }

    async onModuleInit() {
        await this.loadConfig();
    }

    async loadConfig() {
        try {
            // 1. Base Defaults
            let finalConfig = loadConfigs();

            // 2. Local File Override (Dev/Static)
            try {
                this.logger.log(`Loading custom config from: ${this.configPath}`);
                const data = await fs.readFile(this.configPath, 'utf-8');
                const fileConfig = JSON.parse(data);
                finalConfig = deepMerge(finalConfig, fileConfig);
            } catch (fileError) {
                this.logger.warn(`File config not found or invalid: ${fileError.message}`);
            }

            // 3. Database Override (Admin Settings)
            try {
                // Assuming single event for now, similar to frontend logic
                const event = await this.prisma.event.findFirst();
                if (event) {
                    this.logger.log(`Loading DB config for event: ${event.name}`);

                    // Map DB Event to EventConfig structure (Partial)
                    // This mapping mirrors what loadConfigs() does in the frontend with getDbConfig()
                    // But here we do it explicitly server-side.
                    const dbConfig: any = {
                        content: {
                            title: event.name,
                            goalAmount: Number(event.goalAmount),
                        },
                        // We can also map themeConfig purely here if we want strict control
                        // But usually themeConfig in DB is already essentially partial EventConfig
                    };

                    // If themeConfig has specific structure we merge it
                    if (event.themeConfig) {
                        finalConfig = deepMerge(finalConfig, event.themeConfig as any);
                    }

                    finalConfig = deepMerge(finalConfig, dbConfig);
                }
            } catch (dbError) {
                this.logger.error(`Failed to load config from DB: ${dbError.message}`);
            }

            this.config = finalConfig;
            this.logger.log(`Final Event Config loaded: ${this.config.content.title}`);

        } catch (error) {
            this.logger.error(`Critical error loading event config: ${error.message}`);
            this.config = loadConfigs(); // Fallback to safe defaults
        }
    }

    getConfig(): EventConfig {
        return this.config || loadConfigs();
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
