import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { DataImportService } from './data-import.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('data-import')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post('upload')
  @RequirePermissions('system:admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only Excel and CSV files are allowed'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!type) {
      throw new BadRequestException('Import type is required');
    }

    return this.dataImportService.analyzeFile(file, type);
  }

  @Post('import/:fileId')
  @RequirePermissions('system:admin')
  async importFile(@Param('fileId') fileId: string) {
    return this.dataImportService.importFile(fileId);
  }

  @Get('preview/:fileId')
  @RequirePermissions('system:admin')
  async previewFile(@Param('fileId') fileId: string) {
    return this.dataImportService.getPreview(fileId);
  }

  @Get('status/:fileId')
  @RequirePermissions('system:admin')
  async getStatus(@Param('fileId') fileId: string) {
    return this.dataImportService.getStatus(fileId);
  }

  @Get('templates/:type')
  @RequirePermissions('system:admin')
  async downloadTemplate(@Param('type') type: string) {
    return this.dataImportService.getTemplate(type);
  }

  @Get('history')
  @RequirePermissions('system:admin')
  async getImportHistory() {
    return this.dataImportService.getImportHistory();
  }
}
