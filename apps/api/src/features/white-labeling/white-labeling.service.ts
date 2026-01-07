import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ConfigScope,
  Configuration,
  Prisma,
} from '@prisma/client';
import { EventConfig } from '@fundraising/white-labeling';

@Injectable()
export class WhiteLabelingService {
  constructor(private prisma: PrismaService) { }

  async getGlobalSettings(): Promise<EventConfig> {
    const config = await this.getConfig(ConfigScope.GLOBAL);
    return this.mapConfigToEventConfig(config || ({} as Configuration));
  }

  async getEventSettings(slug: string): Promise<(EventConfig & { isOverride: boolean }) | null> {
    const event = await this.prisma.event.findUnique({ where: { slug } });
    if (!event) return null;

    const config = await this.getConfig(ConfigScope.EVENT, event.id);
    const mapped = this.mapConfigToEventConfig(config || ({} as Configuration), event);

    return {
      ...mapped,
      isOverride: !!config,
    };
  }

  async updateGlobalSettings(data: Partial<EventConfig>) {
    const payload = this.mapToDbPayload('GLOBAL', data);
    return this.prisma.configuration.upsert({
      where: {
        scope_entityId: { scope: ConfigScope.GLOBAL, entityId: 'GLOBAL' },
      },
      update: payload,
      create: { ...payload, scope: ConfigScope.GLOBAL, entityId: 'GLOBAL' } as any,
    });
  }

  async updateEventSettings(eventId: string, data: Partial<EventConfig>) {
    const payload = this.mapToDbPayload(eventId, data);
    return this.prisma.configuration.upsert({
      where: {
        scope_entityId: { scope: ConfigScope.EVENT, entityId: eventId },
      },
      update: payload,
      create: { ...payload, scope: ConfigScope.EVENT, entityId: eventId } as any,
    });
  }

  async resetEventSettings(eventId: string) {
    return this.prisma.configuration.updateMany({
      where: { scope: ConfigScope.EVENT, entityId: eventId },
      data: {
        organization: null,
        address: null,
        phone: null,
        logo: null,
        email: null,
        website: null,
        themeVariables: Prisma.DbNull,
        assets: Prisma.DbNull,
        event: Prisma.DbNull,
        communication: Prisma.DbNull,
        form: Prisma.DbNull,
        payment: Prisma.DbNull,
        socialNetwork: Prisma.DbNull,
        locales: Prisma.DbNull,
      },
    });
  }

  private async getConfig(scope: ConfigScope, entityId?: string) {
    return this.prisma.configuration.findFirst({
      where: { scope, entityId },
    });
  }

  /**
   * Transforms EventConfig structure into Database Schema columns.
   * NO LEGACY LOOKUPS. STRICTLY USES EventConfig PATHS.
   */
  private mapToDbPayload(eventId: string, data: Partial<EventConfig>): Prisma.ConfigurationUpdateInput {
    const payload: Prisma.ConfigurationUpdateInput = {
      updatedAt: new Date(),
    };

    // 1. Communication -> Root Columns & JSON
    if (data.communication) {
      const c = data.communication;
      if (c.legalName !== undefined) payload.organization = c.legalName || null;
      if (c.address !== undefined) payload.address = c.address || null;
      if (c.phone !== undefined) payload.phone = c.phone || null;
      if (c.supportEmail !== undefined) payload.email = c.supportEmail || null;
      if (c.website !== undefined) payload.website = c.website || null;

      payload.communication = this.cleanForPersistence(c) as Prisma.InputJsonValue;
    }

    // 2. Theme -> Assets (Logo) & Variables
    if (data.theme !== undefined) {
      if (data.theme?.assets !== undefined) {
        if (data.theme.assets?.logo !== undefined) payload.logo = data.theme.assets.logo || null;
        payload.assets = this.cleanForPersistence(data.theme.assets) as Prisma.InputJsonValue;
      }
      if (data.theme?.variables !== undefined) {
        payload.themeVariables = this.cleanForPersistence(data.theme.variables) as Prisma.InputJsonValue;
      }
    }

    // 3. Content -> event column
    if (data.content !== undefined) {
      // Logic: If user provides content.title and NOT communication.legalName, we sync to organization
      if (data.content?.title !== undefined && (!data.communication || data.communication.legalName === undefined)) {
        payload.organization = data.content.title || null;
      }
      payload.event = this.cleanForPersistence(data.content) as Prisma.InputJsonValue;
    }

    // 4. Donation -> form, payment, sharing
    if (data.donation !== undefined) {
      if (data.donation?.form !== undefined) payload.form = this.cleanForPersistence(data.donation.form) as Prisma.InputJsonValue;
      if (data.donation?.payment !== undefined) payload.payment = this.cleanForPersistence(data.donation.payment) as Prisma.InputJsonValue;
      if (data.donation?.sharing !== undefined) payload.socialNetwork = this.cleanForPersistence(data.donation.sharing) as Prisma.InputJsonValue;
    }

    // 5. Locales & Live Theme
    if (data.locales) payload.locales = this.cleanForPersistence(data.locales) as Prisma.InputJsonValue;
    if (data.live?.theme) payload.liveTheme = data.live.theme;

    return payload;
  }

  private cleanForPersistence(obj: any): any {
    if (obj === null || obj === undefined) return Prisma.DbNull;
    if (typeof obj !== 'object' || Array.isArray(obj)) return obj;

    const cleaned = Object.entries(obj).reduce((acc: any, [key, value]) => {
      if (value === '' || value === null || value === undefined) {
        // Skip for inheritance
      } else if (typeof value === 'object') {
        const child = this.cleanForPersistence(value);
        if (child !== Prisma.DbNull) acc[key] = child;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    return Object.keys(cleaned).length > 0 ? cleaned : Prisma.DbNull;
  }

  private mapConfigToEventConfig(config: Configuration, event?: any): EventConfig {
    return {
      id: config.entityId || event?.id || '',
      name: event?.name || '',
      description: event?.description || '',
      theme: {
        assets: {
          logo: config.logo || '',
          ...(config.assets as any || {}),
        },
        variables: (config.themeVariables as any) || {},
      },
      content: {
        title: config.organization || '',
        totalLabel: 'Total Raised',
        goalAmount: event?.goalAmount ? Number(event.goalAmount) : 0,
        ...(config.event as any || {}),
      },
      live: {
        theme: (config.liveTheme as any) || 'classic',
      },
      donation: {
        form: (config.form as any) || {
          phone: { enabled: false, required: false },
          address: { enabled: false, required: false },
          company: { enabled: false, required: false },
          message: { enabled: true, required: false },
          anonymous: { enabled: true, required: false },
        },
        sharing: (config.socialNetwork as any) || { enabled: true, networks: [] },
        payment: (config.payment as any) || { provider: 'stripe', currency: 'EUR' },
      },
      communication: {
        legalName: config.organization || '',
        address: config.address || '',
        supportEmail: config.email || '',
        phone: config.phone || '',
        website: config.website || '',
        pdf: { enabled: true },
        email: { enabled: true },
        ...(config.communication as any || {}),
      },
      locales: (config.locales as any) || { default: 'en', supported: ['en'] },
    };
  }
}
