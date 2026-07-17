import type { FC } from "react";
import {
  Archive01Icon,
  Cancel01Icon,
  DocumentCodeIcon,
  File01Icon,
  HugeiconsIcon,
  Image01Icon,
  Loading03Icon,
  MusicNote01Icon,
  Txt01Icon,
  Video01Icon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  url: string;
  name: string;
  type: string;
  description?: string;
  isUploading?: boolean;
}

export interface FilePreviewProps {
  files: UploadedFile[];
  onRemove?: (id: string) => void;
  className?: string;
}

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1]! : "";
};

const getFileIcon = (fileType: string, fileName: string) => {
  const extension = getFileExtension(fileName).toLowerCase();
  const iconSize = 24;

  if (fileType.startsWith("image/"))
    return <HugeiconsIcon icon={Image01Icon} size={iconSize} className="text-emerald-500" />;

  if (fileType === "application/pdf" || extension === "pdf")
    return <HugeiconsIcon icon={Txt01Icon} size={iconSize} className="text-red-500" />;

  if (
    ["doc", "docx", "odt", "rtf"].includes(extension) ||
    fileType.includes("wordprocessing") ||
    fileType.includes("msword")
  )
    return <HugeiconsIcon icon={Txt01Icon} size={iconSize} className="text-blue-500" />;

  if (
    ["xls", "xlsx", "csv", "ods"].includes(extension) ||
    fileType.includes("spreadsheet") ||
    fileType.includes("excel")
  )
    return <HugeiconsIcon icon={Txt01Icon} size={iconSize} className="text-green-500" />;

  if (["txt", "md"].includes(extension) || fileType === "text/plain")
    return <HugeiconsIcon icon={Txt01Icon} size={iconSize} className="text-zinc-500" />;

  if (
    ["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "html", "css"].includes(extension) ||
    fileType.includes("javascript") ||
    fileType.includes("typescript")
  )
    return <HugeiconsIcon icon={DocumentCodeIcon} size={iconSize} className="text-yellow-500" />;

  if (["json", "xml", "yaml", "yml"].includes(extension))
    return <HugeiconsIcon icon={DocumentCodeIcon} size={iconSize} className="text-zinc-500" />;

  if (fileType.startsWith("video/") || ["mp4", "avi", "mov", "mkv"].includes(extension))
    return <HugeiconsIcon icon={Video01Icon} size={iconSize} className="text-purple-500" />;

  if (fileType.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(extension))
    return <HugeiconsIcon icon={MusicNote01Icon} size={iconSize} className="text-pink-500" />;

  if (
    ["zip", "rar", "tar", "gz", "7z"].includes(extension) ||
    fileType.includes("archive") ||
    fileType.includes("compressed")
  )
    return <HugeiconsIcon icon={Archive01Icon} size={iconSize} className="text-amber-500" />;

  return <HugeiconsIcon icon={File01Icon} size={iconSize} className="text-zinc-500" />;
};

const getFormattedFileType = (fileType: string, fileName: string): string => {
  const ext = getFileExtension(fileName).toUpperCase();
  if (fileType.includes("msword") || fileType.includes("wordprocessing")) return "DOC";
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "SPREADSHEET";
  const typePart = fileType.split("/")[1];
  if (!typePart || typePart === "octet-stream") return ext || "FILE";
  const cleanType = typePart
    .replace("vnd.openxmlformats-officedocument.", "")
    .replace("vnd.ms-", "")
    .replace("x-", "")
    .replace("document.", "")
    .replace("presentation.", "")
    .replace("application.", "")
    .split(".")[0];
  return cleanType!.toUpperCase().substring(0, 8);
};

export const FilePreview: FC<FilePreviewProps> = ({ files, onRemove, className }) => {
  if (files.length === 0) return null;

  return (
    <div className={cn("flex w-full flex-col gap-2 rounded-xl p-2", className)}>
      <div className="flex w-full flex-wrap gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group/file relative flex items-center rounded-xl transition-all",
              "bg-zinc-200 hover:bg-zinc-300",
              file.type.startsWith("image/")
                ? "h-14 w-14 justify-center"
                : "min-w-[180px] max-w-[220px] p-2 pr-8",
            )}
          >
            {file.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
                <HugeiconsIcon icon={Loading03Icon} size={20} className="animate-spin text-white" />
              </div>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className={cn(
                  "absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full",
                  "opacity-0 scale-75 transition-all duration-150 group-hover/file:opacity-100 group-hover/file:scale-100",
                  "cursor-pointer bg-zinc-400 hover:bg-zinc-500",
                )}
                aria-label={`Remove ${file.name}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={10} className="text-white" />
              </button>
            )}
            {file.type.startsWith("image/") ? (
              <div className="h-12 w-12 overflow-hidden rounded-md">
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <>
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-300">
                  {getFileIcon(file.type, file.name)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {file.name.length > 18 ? `${file.name.substring(0, 15)}...` : file.name}
                  </p>
                  <span
                    className={cn(
                      "line-clamp-2 text-xs",
                      file.description?.startsWith("❌") ? "text-red-500" : "text-zinc-600",
                    )}
                  >
                    {file.description || getFormattedFileType(file.type, file.name)}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
