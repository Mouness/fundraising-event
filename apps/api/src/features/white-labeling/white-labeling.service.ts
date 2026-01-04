import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigScope, Configuration } from '@prisma/client';
import { EventConfig } from '@fundraising/white-labeling';

@Injectable()
export class WhiteLabelingService {
  constructor(private prisma: PrismaService) { }

  async getGlobalSettings(): Promise<EventConfig> {
    const config = await this.getConfig(ConfigScope.GLOBAL);
    return this.mapConfigToEventConfig(config || ({} as Configuration));
  }

  async updateGlobalSettings(data: any) {
    // Determine entityId - default to 'GLOBAL' if creating new
    const entityId = 'GLOBAL';
    const payload = this.mapToDbPayload(entityId, data);

    // Ensure scope is correct
    payload.scope = ConfigScope.GLOBAL;

    return this.prisma.configuration.upsert({
      where: {
        scope_entityId: {
          scope: ConfigScope.GLOBAL,
          entityId: entityId,
        },
      },
      create: payload,
      update: payload,
    });
  }

  private async getConfig(scope: ConfigScope, entityId?: string) {
    return this.prisma.configuration.findFirst({
      where: {
        scope,
        entityId,
      },
    });
  }

  /**
   * Retrieves event-specific configuration, merged with global defaults.
   */
  async getEventSettings(slug: string): Promise<EventConfig | null> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
    });

    if (!event) return null;

    const globalConfig = await this.getConfig(ConfigScope.GLOBAL);
    const eventConfig = await this.getConfig(ConfigScope.EVENT, event.id);

    // Merge logic: Event overrides Global
    const merged = this.mergeConfigs(globalConfig || {}, eventConfig || {});

    const mapped = this.mapConfigToEventConfig(merged);

    // Casting to EventConfig as mapped structure matches, plus we ensure id/slug
    return {
      ...mapped,
      id: event.id,
      slug: event.slug,
      // isOverride is not part of EventConfig, so we omit strict typing for it if not needed downstream
      // or we can intersection type it if really needed. For now, matching EventConfig.
      content: {
        ...mapped.content,
        // Ensure goalAmount is number
        goalAmount: Number(event.goalAmount),
        // Ensure description is present inside content if expected
        description: event.description,
        totalLabel: mapped.content.totalLabel || 'Total Raised',
        title: mapped.content.title || event.description || 'Event',
      },
    } as EventConfig;
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
  async updateEventSettings(
    eventId: string,
    data: Partial<EventConfig> & {
      assets?: { logo?: string };
      formConfig?: any;
    },
  ) {
    const payload = this.mapToDbPayload(eventId, data);

    return this.prisma.configuration.upsert({
      where: {
        scope_entityId: {
          scope: ConfigScope.EVENT,
          entityId: eventId,
        },
      },
      create: payload,
      update: payload,
    });
  }

  private mapToDbPayload(
    eventId: string,
    data: Partial<EventConfig> & { assets?: { logo?: string }; formConfig?: any },
  ) {
    // 1. Extract specific nested fields
    const themeVariables = data.theme?.variables;
    const logo = data.assets?.logo;
    const eventContent = data.content as any;
    const formConfig = data.formConfig || data.donation?.form;
    const paymentConfig = data.donation?.payment;
    const socialConfig = data.donation?.sharing;

    // 2. Remove non-column objects from data
    const {
      id,
      updatedAt,
      scope,
      entityId,
      theme,
      content,
      donation,
      formConfig: fc,
      ...cleanData
    } = data as any;

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
      entityId: eventId,
    };
  }

  /**
   * Deletes event-specific overrides, effectively reverting to global.
   */
  async resetEventSettings(eventId: string) {
    return this.prisma.configuration.deleteMany({
      where: {
        scope: ConfigScope.EVENT,
        entityId: eventId,
      },
    });
  }

  /**
   * Maps the database Configuration record to the EventConfig structure expected by the frontend.
   */
  /**
   * Maps the database Configuration record to the EventConfig structure expected by the frontend.
   */
  private mapConfigToEventConfig(config: Configuration): EventConfig {
    const assets = (config.assets as Record<string, string>) || {};
    const themeVariables =
      (config.themeVariables as Record<string, string>) || {};

    // Cast JSON fields to their expected partial types
    const eventContent =
      (config.event as Partial<EventConfig['content']>) || {};
    const form = config.form as EventConfig['donation']['form'] | null;
    const socialNetwork = config.socialNetwork as
      | EventConfig['donation']['sharing']
      | null;
    const payment = config.payment as EventConfig['donation']['payment'] | null;
    const communicationJson =
      (config.communication as Partial<EventConfig['communication']>) || {};
    const locales = config.locales as EventConfig['locales'] | null;

    return {
      // These will be overridden by the caller for EventConfig
      id: '',

      theme: {
        assets: {
          logo: config.logo || '',
          ...assets,
        },
        variables: themeVariables,
      },

      content: {
        title: config.organization || 'Platform',
        totalLabel: 'Total Raised',
        goalAmount: 0, // Placeholder, overridden by event data
        ...eventContent,
      },

      donation: {
        form: form || {
          phone: { enabled: false, required: false },
          address: { enabled: false, required: false },
          company: { enabled: false, required: false },
          message: { enabled: false, required: false },
          anonymous: { enabled: true, required: false },
        },
        sharing: socialNetwork || {
          enabled: false,
          networks: [],
        },
        payment: payment || {
          provider: 'stripe',
          currency: 'USD',
        },
      },

      communication: {
        legalName: config.organization || '',
        address: config.address || '',
        supportEmail: config.email || undefined,
        phone: config.phone || undefined,
        website: config.website || undefined,
        email: communicationJson.email || {
          enabled: true,
        },
        pdf: communicationJson.pdf || {
          enabled: true,
        },
        ...communicationJson,
      },

      locales: locales || {
        default: 'en',
        supported: ['en'],
      },
    };
  }
}
