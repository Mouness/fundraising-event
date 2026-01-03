import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateEventDto {
    slug!: string;
    name!: string;
    goalAmount!: number;
    themeConfig!: Record<string, any>;
    date?: string | Date;
    description?: string;
    status?: string;
    formConfig?: Record<string, any>;
}

export class UpdateEventDto {
    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    goalAmount?: number;

    @IsOptional()
    @IsObject()
    themeConfig?: Record<string, any>;

    @IsOptional()
    date?: string | Date;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsObject()
    formConfig?: Record<string, any>;
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
    formConfig?: Record<string, any>;
}
