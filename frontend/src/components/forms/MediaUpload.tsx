'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  File,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface MediaUploadProps {
  accept: 'images' | 'documents' | 'all';
  maxFiles?: number;
  maxSize?: number; // in MB
  onFilesChange?: (files: File[]) => void;
  className?: string;
  title?: string;
  description?: string;
}

export function MediaUpload({
  accept = 'all',
  maxFiles = 5,
  maxSize = 10,
  onFilesChange,
  className,
  title,
  description,
}: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const getAcceptObject = (): Record<string, string[]> => {
    if (accept === 'images') {
      return { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] };
    }
    
    if (accept === 'documents') {
      return { 
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
      };
    }
    
    // accept === 'all'
    return {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    };
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File size must be less than ${maxSize}MB` };
    }

    // Type validation
    const acceptedTypes = getAcceptObject();
    const isValidType = Object.keys(acceptedTypes).some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      return file.type === type;
    });

    if (!isValidType) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = [];

    acceptedFiles.forEach((file) => {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return;
      }

      const uploadedFile: UploadedFile = {
        file,
        status: 'success',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };

      newFiles.push(uploadedFile);
    });

    setUploadedFiles(prev => {
      const updated = [...prev, ...newFiles];
      onFilesChange?.(updated.map(f => f.file));
      return updated;
    });

    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  }, [uploadedFiles.length, maxFiles, maxSize, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptObject(),
    maxFiles,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange?.(updated.map(f => f.file));
      
      // Revoke preview URL to prevent memory leaks
      if (prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview!);
      }
      
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {title && (
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Upload Zone */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-colors ${
                isDragActive ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
                </p>
                <p className="text-sm text-gray-500">
                  {accept === 'images' && 'Images only (JPG, PNG, GIF, WebP)'}
                  {accept === 'documents' && 'Documents only (PDF, DOC, DOCX, TXT)'}
                  {accept === 'all' && 'Images and documents supported'}
                </p>
                <p className="text-xs text-gray-400">
                  Maximum {maxFiles} files, {maxSize}MB each
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Info */}
        {uploadedFiles.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{uploadedFiles.length} of {maxFiles} files uploaded</span>
            <Badge variant="outline">
              {Math.round((uploadedFiles.length / maxFiles) * 100)}%
            </Badge>
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <div className="relative group">
                        <img
                          src={uploadedFile.preview}
                          alt={uploadedFile.file.name}
                          className="h-12 w-12 object-cover rounded border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded border flex items-center justify-center">
                        {getFileIcon(uploadedFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      {getStatusIcon(uploadedFile.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      <span>•</span>
                      <span>{uploadedFile.file.type || 'Unknown type'}</span>
                    </div>
                    {uploadedFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>
                    )}
                  </div>

                  {/* Progress/Actions */}
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === 'uploading' && uploadedFile.progress && (
                      <div className="w-20">
                        <Progress value={uploadedFile.progress} className="h-2" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {uploadedFiles.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Total files:</span> {uploadedFiles.length}
              </div>
              <div>
                <span className="font-medium">Total size:</span>{' '}
                {formatFileSize(uploadedFiles.reduce((sum, f) => sum + f.file.size, 0))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 