export class CreateEventDto {
    slug!: string;
    name!: string;
    goalAmount!: number;
    themeConfig!: {
        primaryColor: string;
        secondaryColor?: string;
        logoUrl?: string;
    };
}

export class UpdateEventDto {
    slug?: string;
    name?: string;
    goalAmount?: number;
    themeConfig?: {
        primaryColor?: string;
        secondaryColor?: string;
        logoUrl?: string;
    };
}

export class EventResponseDto {
    id!: string;
    slug!: string;
    name!: string;
    goalAmount!: number;
    themeConfig!: Record<string, any>;
    createdAt!: string | Date;
    updatedAt!: string | Date;
}
