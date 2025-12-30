import { IsNumber, IsOptional, IsString, IsBoolean, Min, IsEnum, IsDateString } from 'class-validator';

export class OfflineDonationDto {
    @IsNumber()
    @Min(0.01)
    declare amount: number;

    @IsString()
    declare type: string; // 'cash' | 'check' | 'pledge'

    @IsString()
    @IsOptional()
    declare donorName?: string;

    @IsString()
    @IsOptional()
    declare donorEmail?: string;

    @IsBoolean()
    @IsOptional()
    declare isOfflineCollected?: boolean;

    @IsDateString()
    @IsOptional()
    declare collectedAt?: string;
}
