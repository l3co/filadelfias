import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-900/50 transition-opacity backdrop-blur-sm"
                    onClick={onClose}
                />

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
