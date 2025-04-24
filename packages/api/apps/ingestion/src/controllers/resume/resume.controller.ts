import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Logger,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from '../../services/resume/resume.service';
import { ParsedResumeResponse } from '../../types/resume.types';
import { Request } from 'express';
import { JwtAuthGuard, UserPayload } from '@app/common/auth';

interface ResumeTextDto {
  text: string;
}

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
    return this.resumeService.handleFileUpload(file, user.id);
  }

  @Post('upload-text')
  @UseGuards(JwtAuthGuard)
  async uploadResumeText(@Req() request: Request, @Body() body: ResumeTextDto) {
    const user = request['user'] as UserPayload;
    await this.resumeService.uploadResumeText(body.text, user.id);

    // Return proper JSON response
    return {
      success: true,
      message: 'Resume text uploaded successfully',
    };
  }
}
