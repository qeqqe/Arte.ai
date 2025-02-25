import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ResumeService } from '../../services/resume/resume.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParsedResumeResponse } from '../../types/resume.types';
import { Logger } from 'nestjs-pino';

//  ! This controller handles the resume upload and parsing functionality.

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly logger: Logger,
  ) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ParsedResumeResponse> {
    this.logger.log('Received file upload request', {
      filename: file?.originalname,
      size: file?.size,
    });

    const response = await this.resumeService.handleFileUpload(file);

    this.logger.log('Python service response', {
      responseData: response,
    });

    return response;
  }
}
