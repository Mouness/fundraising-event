export class CreateEventDto {
    slug!: string;
    name!: string;
    goalAmount!: number;
    themeConfig!: Record<string, any>;
}

export class UpdateEventDto {
    slug?: string;
    name?: string;
    goalAmount?: number;
    themeConfig?: Record<string, any>;
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
