import { Paperclip, Trash2 } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/ui/button';
import { Infotip } from '@/Components/ui/infotip';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';

export interface ExistingAttachmentItem {
    id: number;
    originalFilename: string;
    sizeBytes: number;
    downloadUrl: string;
}

export interface ProjectAttachmentFieldProps {
    id: string;
    label?: string;
    infotipAriaLabel?: string;
    infotipContent?: ReactNode;
    disabled?: boolean;
    error?: string;
    /** この送信で追加できる残り件数（案件上限10件との兼ね合い） */
    remainingSlots?: number;
    selectedNewFiles: File[];
    onNewFilesChange: (files: File[]) => void;
    existingAttachments?: ExistingAttachmentItem[];
    removeExistingIds?: number[];
    onToggleRemoveExisting?: (id: number) => void;
    processing?: boolean;
    /** 案件詳細など閲覧のみ（一覧とダウンロードリンクのみ） */
    readOnly?: boolean;
}

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ProjectAttachmentField({
    id,
    label = 'ファイル添付',
    infotipAriaLabel,
    infotipContent,
    disabled = false,
    error,
    remainingSlots = 5,
    selectedNewFiles,
    onNewFilesChange,
    existingAttachments = [],
    removeExistingIds = [],
    onToggleRemoveExisting,
    processing = false,
    readOnly = false,
}: ProjectAttachmentFieldProps) {
    const canPickMore = !readOnly && !disabled && !processing && remainingSlots > 0;
    const maxPick = Math.min(5, remainingSlots);

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files ? Array.from(event.target.files) : [];
        event.target.value = '';
        if (picked.length === 0) {
            return;
        }
        const merged = [...selectedNewFiles, ...picked].slice(0, maxPick);
        onNewFilesChange(merged);
    };

    const removeNewAt = (index: number) => {
        onNewFilesChange(selectedNewFiles.filter((_, i) => i !== index));
    };

    return (
        <div
            className={cn(
                'rounded-md border border-dashed px-4 py-3',
                disabled
                    ? 'border-slate-300 bg-slate-100/70'
                    : 'border-brand-border bg-brand-bg/80',
            )}
        >
            <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 shrink-0 text-brand-muted" aria-hidden />
                <InputLabel htmlFor={id} value={label} />
                {infotipContent !== undefined && infotipAriaLabel !== undefined ? (
                    <Infotip ariaLabel={infotipAriaLabel} align="left">
                        {infotipContent}
                    </Infotip>
                ) : null}
            </div>

            {existingAttachments.length > 0 ? (
                <ul className="mt-3 space-y-2">
                    {existingAttachments.map((item) => {
                        const stagedRemove = removeExistingIds.includes(item.id);
                        return (
                            <li
                                key={item.id}
                                className={cn(
                                    'flex flex-wrap items-center justify-between gap-2 rounded-md border border-brand-border bg-white px-3 py-2 text-sm',
                                    stagedRemove && 'opacity-50 line-through',
                                )}
                            >
                                <a
                                    href={item.downloadUrl}
                                    className="min-w-0 flex-1 truncate font-medium text-brand-blue hover:underline"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {item.originalFilename}
                                </a>
                                <span className="shrink-0 text-xs text-brand-muted">
                                    {formatBytes(item.sizeBytes)}
                                </span>
                                {onToggleRemoveExisting !== undefined && !readOnly && !disabled && !processing ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 shrink-0 gap-1 text-brand-muted hover:text-brand-red"
                                        onClick={() => onToggleRemoveExisting(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden />
                                        {stagedRemove ? '元に戻す' : '削除'}
                                    </Button>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            ) : readOnly ? (
                <p className="mt-2 text-sm text-brand-muted">添付ファイルはありません。</p>
            ) : null}

            {!readOnly && selectedNewFiles.length > 0 ? (
                <ul className="mt-3 space-y-2">
                    {selectedNewFiles.map((file, index) => (
                        <li
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center justify-between gap-2 rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
                        >
                            <span className="min-w-0 flex-1 truncate font-medium text-brand-dark">
                                {file.name}
                            </span>
                            <span className="shrink-0 text-xs text-brand-muted">{formatBytes(file.size)}</span>
                            {!disabled && !processing ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 shrink-0"
                                    onClick={() => removeNewAt(index)}
                                >
                                    取り除く
                                </Button>
                            ) : null}
                        </li>
                    ))}
                </ul>
            ) : null}

            {!readOnly ? (
                <>
                    <Input
                        id={id}
                        type="file"
                        multiple
                        disabled={!canPickMore}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                        className={cn(
                            'mt-2 cursor-pointer',
                            !canPickMore && 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
                        )}
                        onChange={handleFileInput}
                    />
                    <p className="mt-1 text-xs text-brand-muted">
                        PDF・Office・画像・テキスト・ZIP。1ファイル最大5MB、1回の送信で最大5件まで追加できます。
                        {remainingSlots < 5 ? ` この案件ではあと ${remainingSlots} 件まで追加できます。` : null}
                    </p>
                </>
            ) : null}
            <InputError className="mt-2" message={error} />
        </div>
    );
}
