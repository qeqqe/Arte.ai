import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from '../../services/resume/resume.service';
import { ParsedResumeResponse } from '../../types/resume.types';
import { Request } from 'express';
import { JwtAuthGuard, UserPayload } from '@app/common/auth';

@Controller('resume')
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);

  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ): Promise<ParsedResumeResponse> {
    const user = request['user'] as UserPayload;

    this.logger.debug(`Processing resume upload for user: ${user.id}`);

    return this.resumeService.handleFileUpload(file, user.id);
  }
}
