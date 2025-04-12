import { IsNotEmpty, IsString } from 'class-validator';

export class ScrapeJobMicroserviceDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
