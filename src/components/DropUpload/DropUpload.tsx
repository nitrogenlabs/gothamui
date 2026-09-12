import {cn} from '@nlabs/utils';
import {FileImage, UploadCloud, X} from 'lucide-react';
import {memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

import type {
  ChangeEvent,
  DragEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  Ref
} from 'react';

export type DropUploadRejectionReason = 'max-files' | 'max-size' | 'type';

export interface DropUploadItem {
  readonly file: File;
  readonly id: string;
  readonly previewUrl?: string;
}

export interface DropUploadRejection {
  readonly file: File;
  readonly reason: DropUploadRejectionReason;
}

export interface DropUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onDrop'> {
  readonly accept?: string;
  readonly browseLabel?: string;
  readonly defaultFiles?: readonly File[];
  readonly disabled?: boolean;
  readonly files?: readonly File[];
  readonly helperText?: ReactNode;
  readonly imageOutputMimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  readonly imageOutputQuality?: number;
  readonly imageResizeTargetHeight?: number;
  readonly imageResizeTargetWidth?: number;
  readonly imageResizeUpscale?: boolean;
  readonly label?: ReactNode;
  readonly maxFileSize?: number;
  readonly maxFiles?: number;
  readonly multiple?: boolean;
  readonly onFilesChange?: (files: File[], items: DropUploadItem[]) => void;
  readonly onReject?: (rejections: DropUploadRejection[]) => void;
  readonly previewClassName?: string;
  readonly ref?: Ref<HTMLDivElement>;
  readonly showPreviews?: boolean;
  readonly transformImages?: boolean;
}

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const createId = (file: File, index = 0): string => [
  file.name,
  file.size,
  file.lastModified,
  index
].join('-');

const parseAccept = (accept = ''): string[] => accept
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const acceptsFile = (file: File, accept = ''): boolean => {
  const acceptRules = parseAccept(accept);

  if(!acceptRules.length) {
    return true;
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return acceptRules.some((rule) => {
    if(rule.endsWith('/*')) {
      return fileType.startsWith(rule.slice(0, -1));
    }

    if(rule.startsWith('.')) {
      return fileName.endsWith(rule);
    }

    return fileType === rule;
  });
};

const createImagePreview = (file: File): string | undefined => {
  if(!imageMimeTypes.has(file.type)) {
    return undefined;
  }

  return URL.createObjectURL(file);
};

const resizeImage = async (
  file: File,
  {
    imageOutputMimeType = 'image/jpeg',
    imageOutputQuality = 0.92,
    imageResizeTargetHeight,
    imageResizeTargetWidth,
    imageResizeUpscale = false
  }: Pick<
    DropUploadProps,
    'imageOutputMimeType' |
    'imageOutputQuality' |
    'imageResizeTargetHeight' |
    'imageResizeTargetWidth' |
    'imageResizeUpscale'
  >
): Promise<File> => {
  if(!imageMimeTypes.has(file.type) || (!imageResizeTargetHeight && !imageResizeTargetWidth)) {
    return file;
  }

  const sourceUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = sourceUrl;
  await image.decode();

  const widthRatio = imageResizeTargetWidth ? imageResizeTargetWidth / image.width : Number.POSITIVE_INFINITY;
  const heightRatio = imageResizeTargetHeight ? imageResizeTargetHeight / image.height : Number.POSITIVE_INFINITY;
  const scale = Math.min(widthRatio, heightRatio, imageResizeUpscale ? Number.POSITIVE_INFINITY : 1);

  if(scale >= 1 && !imageResizeUpscale) {
    URL.revokeObjectURL(sourceUrl);
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  context?.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(sourceUrl);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, imageOutputMimeType, imageOutputQuality);
  });

  if(!blob) {
    return file;
  }

  return new File([blob], file.name, {
    lastModified: file.lastModified,
    type: imageOutputMimeType
  });
};

const filesToItems = (files: readonly File[]): DropUploadItem[] => files.map((file, index) => ({
  file,
  id: createId(file, index),
  previewUrl: createImagePreview(file)
}));

const DropUploadComponent = ({
  accept,
  browseLabel = 'browse',
  className,
  defaultFiles = [],
  disabled = false,
  files,
  helperText,
  imageOutputMimeType = 'image/jpeg',
  imageOutputQuality = 0.92,
  imageResizeTargetHeight,
  imageResizeTargetWidth,
  imageResizeUpscale = false,
  label = 'Drop files here or',
  maxFileSize,
  maxFiles = Number.POSITIVE_INFINITY,
  multiple = true,
  onFilesChange,
  onReject,
  previewClassName,
  ref,
  showPreviews = true,
  transformImages = true,
  ...props
}: DropUploadProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<DropUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [internalItems, setInternalItems] = useState<DropUploadItem[]>(() => filesToItems(defaultFiles));
  const isControlled = Array.isArray(files);
  const items = useMemo(
    () => (isControlled ? filesToItems(files || []) : internalItems),
    [files, internalItems, isControlled]
  );

  useEffect(() => {
    const nextPreviewUrls = new Set(items.map((item) => item.previewUrl).filter(Boolean));

    itemsRef.current.forEach((item) => {
      if(item.previewUrl && !nextPreviewUrls.has(item.previewUrl)) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      if(item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }, []);

  const updateItems = useCallback((nextItems: DropUploadItem[]) => {
    if(!isControlled) {
      setInternalItems(nextItems);
    }

    onFilesChange?.(nextItems.map((item) => item.file), nextItems);
  }, [isControlled, onFilesChange]);

  const addFiles = useCallback(async (incomingFiles: File[]) => {
    if(disabled) {
      return;
    }

    const currentItems = multiple ? items : [];
    const acceptedFiles: File[] = [];
    const rejections: DropUploadRejection[] = [];
    const remainingSlots = Math.max(0, maxFiles - currentItems.length);

    incomingFiles.forEach((file) => {
      if(acceptedFiles.length >= remainingSlots) {
        rejections.push({file, reason: 'max-files'});
        return;
      }

      if(!acceptsFile(file, accept)) {
        rejections.push({file, reason: 'type'});
        return;
      }

      if(maxFileSize && file.size > maxFileSize) {
        rejections.push({file, reason: 'max-size'});
        return;
      }

      acceptedFiles.push(file);
    });

    if(rejections.length) {
      onReject?.(rejections);
    }

    if(!acceptedFiles.length) {
      return;
    }

    const transformedFiles = transformImages
      ? await Promise.all(acceptedFiles.map((file) => resizeImage(file, {
        imageOutputMimeType,
        imageOutputQuality,
        imageResizeTargetHeight,
        imageResizeTargetWidth,
        imageResizeUpscale
      })))
      : acceptedFiles;

    updateItems([
      ...currentItems,
      ...filesToItems(transformedFiles)
    ]);
  }, [
    accept,
    disabled,
    imageOutputMimeType,
    imageOutputQuality,
    imageResizeTargetHeight,
    imageResizeTargetWidth,
    imageResizeUpscale,
    items,
    maxFileSize,
    maxFiles,
    multiple,
    onReject,
    transformImages,
    updateItems
  ]);

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await addFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if(event.currentTarget === event.target) {
      setIsDragging(false);
    }
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await addFiles(Array.from(event.dataTransfer.files || []));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if(event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className={cn('flex w-full flex-col gap-4', className)} ref={ref} {...props}>
      <div
        aria-disabled={disabled}
        className={cn(
          'group relative flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-transparent px-6 py-8 text-center transition-colors',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30',
          'hover:border-primary/70 hover:bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
          isDragging && 'border-primary bg-primary/10'
        )}
        onClick={() => inputRef.current?.click()}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}>
        <input
          accept={accept}
          className="sr-only"
          disabled={disabled}
          id={inputId}
          multiple={multiple}
          onChange={onInputChange}
          ref={inputRef}
          type="file"
        />
        <UploadCloud aria-hidden="true" className="mb-4 size-10 text-muted-foreground transition-colors group-hover:text-primary" />
        <div className="text-sm font-medium text-foreground">
          <span>{label} </span>
          <label className="cursor-pointer text-primary underline-offset-4 hover:underline" htmlFor={inputId}>
            {browseLabel}
          </label>
        </div>
        {helperText && (
          <div className="mt-2 text-sm text-muted-foreground">
            {helperText}
          </div>
        )}
      </div>

      {showPreviews && !!items.length && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              className={cn(
                'group/item relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
                previewClassName
              )}
              key={item.id}>
              <div className="flex aspect-video items-center justify-center bg-muted">
                {item.previewUrl ? (
                  <img
                    alt={item.file.name}
                    className="size-full object-cover"
                    src={item.previewUrl}
                  />
                ) : (
                  <FileImage aria-hidden="true" className="size-9 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">{Math.ceil(item.file.size / 1024)} KB</p>
                </div>
                <button
                  aria-label={`Remove ${item.file.name}`}
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(item.id);
                  }}
                  type="button">
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DropUpload = memo(DropUploadComponent);
DropUpload.displayName = 'DropUpload';
