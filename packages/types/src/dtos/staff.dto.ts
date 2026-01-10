import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator'

export class CreateStaffDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 50)
    declare name: string

    @IsString()
    @IsNotEmpty()
    @Length(4, 10)
    declare code: string

    @IsString()
    @IsNotEmpty()
    declare eventId: string
}

export class UpdateStaffDto {
    @IsString()
    @IsOptional()
    @Length(2, 50)
    declare name?: string

    @IsString()
    @IsOptional()
    @Length(4, 10)
    declare code?: string

    @IsString()
    @IsOptional()
    declare eventId?: string
}
