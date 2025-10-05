import { IsString, IsOptional } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  userId: string;
}
