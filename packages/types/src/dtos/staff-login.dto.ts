import { IsString, Length } from 'class-validator';

export class StaffLoginDto {
    @IsString()
    @Length(4, 6) // Assuming code is 4-6 chars
    declare code: string;
}
