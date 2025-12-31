export class CreateEventDto {
    slug!: string;
    name!: string;
    goalAmount!: number;
    themeConfig!: Record<string, any>;
    date?: string | Date;
    description?: string;
    status?: string;
}

export class UpdateEventDto {
    slug?: string;
    name?: string;
    goalAmount?: number;
    themeConfig?: Record<string, any>;
    date?: string | Date;
    description?: string;
    status?: string;
}

export class EventResponseDto {
    id!: string;
    slug!: string;
    name!: string;
    goalAmount!: number;
    themeConfig!: Record<string, any>;
    date?: string | Date;
    description?: string | null;
    status?: string;
    raised?: number;
    donorCount?: number;
    createdAt!: string | Date;
    updatedAt!: string | Date;
}
