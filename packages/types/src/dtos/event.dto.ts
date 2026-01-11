import { IsString, IsOptional, IsNumber, IsObject, Matches } from 'class-validator'

export class CreateEventDto {
    @IsString()
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug must be lowercase alphanumeric with dashes',
    })
    slug!: string

    @IsString()
    name!: string

    @IsNumber()
    goalAmount!: number

    @IsOptional()
    @IsObject()
    themeConfig?: Record<string, any>

    @IsOptional()
    date?: string | Date

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    status?: string

    @IsOptional()
    @IsObject()
    formConfig?: Record<string, any>
}

export class UpdateEventDto {
    @IsOptional()
    @IsString()
    slug?: string

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsNumber()
    goalAmount?: number

    @IsOptional()
    @IsObject()
    themeConfig?: Record<string, any>

    @IsOptional()
    date?: string | Date

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    status?: string

    @IsOptional()
    @IsObject()
    formConfig?: Record<string, any>
}

export class EventResponseDto {
    id!: string
    slug!: string
    name!: string
    goalAmount!: number
    themeConfig!: Record<string, any>
    date?: string | Date
    description?: string | null
    status?: string
    raised?: number
    donorCount?: number
    createdAt!: string | Date
    updatedAt!: string | Date
    formConfig?: Record<string, any>
}
