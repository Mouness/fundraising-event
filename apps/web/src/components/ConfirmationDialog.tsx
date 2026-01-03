import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: ReactNode
    description?: ReactNode
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    variant = "default",
}: ConfirmationDialogProps) {
    const { t } = useTranslation('common')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title || t('confirmation.title', 'Are you sure?')}</DialogTitle>
                    <DialogDescription>
                        {description || t('confirmation.description', 'This action cannot be undone.')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelText || t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        {confirmText || t('common.confirm', 'Confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
