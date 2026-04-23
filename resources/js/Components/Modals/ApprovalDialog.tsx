import { CheckCircle2, MessageSquareText, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface DialogProject {
    id: number;
    title: string;
    department: string;
}

interface ApprovalDialogProps {
    mode: 'approve' | 'reject';
    open: boolean;
    onClose: () => void;
    project: DialogProject | null;
    approvalLevel: 'dept' | 'hq';
    onSubmit: (comment: string) => void;
}

export default function ApprovalDialog({
    mode,
    open,
    onClose,
    project,
    approvalLevel,
    onSubmit,
}: ApprovalDialogProps) {
    const [comment, setComment] = useState('');

    const isApprove = mode === 'approve';
    const levelLabel = approvalLevel === 'dept' ? '部門承認' : '本部承認';

    const dialogLabel = useMemo(
        () => ({
            title: isApprove ? `${levelLabel}を実行` : `${levelLabel}で却下`,
            description: isApprove
                ? '必要に応じてコメントを残して承認できます。'
                : '却下理由を入力して送信してください。',
            submit: isApprove ? '承認する' : '却下する',
        }),
        [isApprove, levelLabel],
    );

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setComment('');
            onClose();
        }
    };

    const handleSubmit = () => {
        if (!isApprove && comment.trim().length === 0) {
            return;
        }

        onSubmit(comment.trim());
        setComment('');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isApprove ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        {dialogLabel.title}
                    </DialogTitle>
                    <DialogDescription>{dialogLabel.description}</DialogDescription>
                </DialogHeader>

                <div className="rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm">
                    <p className="font-semibold text-brand-dark">{project?.title ?? '案件未選択'}</p>
                    <p className="mt-1 text-xs text-brand-muted">
                        部門: {project?.department ?? '—'} / 案件ID: {project?.id ?? '—'}
                    </p>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="approval-comment"
                        className="flex items-center gap-1 text-sm font-medium text-brand-dark"
                    >
                        <MessageSquareText className="h-4 w-4 text-brand-muted" />
                        コメント
                        {!isApprove && <span className="text-xs text-red-600">（必須）</span>}
                    </label>
                    <textarea
                        id="approval-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder={
                            isApprove
                                ? '任意: 承認コメントを入力'
                                : '却下理由を入力してください'
                        }
                        className="min-h-28 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        キャンセル
                    </Button>
                    <Button
                        type="button"
                        variant={isApprove ? 'default' : 'destructive'}
                        onClick={handleSubmit}
                        disabled={!isApprove && comment.trim().length === 0}
                    >
                        {dialogLabel.submit}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
