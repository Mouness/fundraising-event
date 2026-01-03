import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigScope } from '@prisma/client';

@Injectable()
export class WhiteLabelingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Retrieves a configuration record for a given scope.
     */
    /**
     * Retrieves a configuration record for a given scope.
     */
    private async getConfig(scope: ConfigScope, entityId?: string) {
        if (scope === ConfigScope.GLOBAL) {
            return this.prisma.configuration.findFirst({
                where: { scope: ConfigScope.GLOBAL },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!entityId) return null;

        return this.prisma.configuration.findUnique({
            where: {
                scope_entityId: {
                    scope,
                    entityId
                }
            }
        });
    }

    /**
     * Retrieves the platform-wide global configuration.
     */
    async getGlobalSettings() {
        const config = await this.getConfig(ConfigScope.GLOBAL);
        return this.mapConfigToEventConfig(config || {});
    }

    /**
     * Updates the platform-wide global configuration.
     */
    async updateGlobalSettings(data: any) {
        // Map incoming EventConfig-like structure back to isolated columns if necessary
        const { id, updatedAt, scope, entityId, ...cleanData } = data;
        const GLOBAL_ENTITY_ID = 'GLOBAL';

        return this.prisma.configuration.upsert({
            where: {
                scope_entityId: {
                    scope: ConfigScope.GLOBAL,
                    entityId: GLOBAL_ENTITY_ID
                }
            },
            create: {
                ...cleanData,
                scope: ConfigScope.GLOBAL,
                entityId: GLOBAL_ENTITY_ID
            },
            update: cleanData,
        });
    }

    /**
     * Retrieves event-specific configuration, merged with global defaults.
     */
    async getEventSettings(slug: string) {
        const event = await this.prisma.event.findUnique({
            where: { slug }
        });

        if (!event) return null;

        const globalConfig = await this.getConfig(ConfigScope.GLOBAL);
        const eventConfig = await this.getConfig(ConfigScope.EVENT, event.id);

        // Merge logic: Event overrides Global
        const merged = this.mergeConfigs(globalConfig || {}, eventConfig || {});

        return {
            ...this.mapConfigToEventConfig(merged),
            id: event.id,
            slug: event.slug,
            isOverride: !!eventConfig, // Flag to indicate if event-specific settings exist
            overrides: {
                communication: !!eventConfig?.communication,
                theme: !!eventConfig?.themeVariables,
            },
            content: {
                ...this.mapConfigToEventConfig(merged).content,
                goalAmount: Number(event.goalAmount),
                description: event.description
            }
        };
    }

    /**
     * Merges two configuration records, with local overriding global.
     */
    private mergeConfigs(global: any, local: any) {
        const merged = { ...global };

        for (const key in local) {
            if (local[key] !== null && local[key] !== undefined) {
                // For JSON blocks, we might want deeper merging, but for now, top-level replacement is safer for branding overrides
                merged[key] = local[key];
            }
        }

        return merged;
    }

    /**
     * Updates configuration for a specific event.
     */
    async updateEventSettings(eventId: string, data: any) {
        const payload = this.mapToDbPayload(eventId, data);

        return this.prisma.configuration.upsert({
            where: {
                scope_entityId: {
                    scope: ConfigScope.EVENT,
                    entityId: eventId
                }
            },
            create: payload,
            update: payload,
        });
    }

    private mapToDbPayload(eventId: string, data: any) {
        // 1. Extract specific nested fields
        const themeVariables = data.theme?.variables;
        const logo = data.assets?.logo;
        const eventContent = data.content;
        const formConfig = data.formConfig || data.donation?.form;
        const paymentConfig = data.donation?.payment;
        const socialConfig = data.donation?.sharing;

        // 2. Remove non-column objects from data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, updatedAt, scope, entityId, theme, content, donation, formConfig: fc, ...cleanData } = data;

        // 3. Construct and return final payload
        return {
            ...cleanData,
            ...(themeVariables && { themeVariables }),
            ...(logo && { logo }),
            ...(eventContent && { event: eventContent }),
            ...(formConfig && { form: formConfig }),
            ...(paymentConfig && { payment: paymentConfig }),
            ...(socialConfig && { socialNetwork: socialConfig }),
            scope: ConfigScope.EVENT,
            entityId: eventId
        };
    }

    /**
     * Deletes event-specific overrides, effectively reverting to global.
     */
    async resetEventSettings(eventId: string) {
        return this.prisma.configuration.deleteMany({
            where: {
                scope: ConfigScope.EVENT,
                entityId: eventId
            }
        });
    }

    /**
     * Maps the database Configuration record to the EventConfig structure expected by the frontend.
     */
    private mapConfigToEventConfig(config: any) {
        return {
            content: {
                title: config.organization || 'Platform',
                ...(config.event || {})
            },
            theme: {
                assets: {
                    logo: config.logo,
                    ...(config.assets || {})
                },
                variables: config.themeVariables || {}
            },
            donation: {
                form: config.form || {},
                sharing: config.socialNetwork || {},
                payment: config.payment || {}
            },
            communication: {
                legalName: config.organization,
                address: config.address,
                supportEmail: config.email,
                phone: config.phone,
                website: config.website,
                emailConfig: (config.communication as any)?.emailConfig || {},
                pdf: (config.communication as any)?.pdf || {},
                ...(config.communication || {})
            },
            locales: config.locales || {}
        };
    }
}
