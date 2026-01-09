import { IsNumber, IsOptional, IsString, IsObject, Min } from 'class-validator';

export class CreateDonationDto {
    @IsNumber()
    @Min(0.01)
    declare amount: number;

    @IsString()
    @IsOptional()
    declare currency?: string;

    @IsObject()
    @IsOptional()
    declare metadata?: Record<string, any>;
}
