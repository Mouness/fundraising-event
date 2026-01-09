import {
    IsNumber,
    IsOptional,
    IsString,
    IsBoolean,
    Min,
    IsEnum,
    IsDateString,
} from 'class-validator'
import { DonationType } from '../enums/donation-type.enum'

export class OfflineDonationDto {
    @IsNumber()
    @Min(0.01)
    declare amount: number

    @IsString()
    declare type: DonationType // 'cash' | 'check' | 'pledge'

    @IsString()
    @IsOptional()
    declare donorName?: string

    @IsString()
    @IsOptional()
    declare donorEmail?: string

    @IsBoolean()
    @IsOptional()
    declare isOfflineCollected?: boolean

    @IsDateString()
    @IsOptional()
    declare collectedAt?: string

    @IsString()
    @IsOptional()
    declare eventId?: string
}
