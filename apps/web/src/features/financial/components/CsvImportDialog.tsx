import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

interface CsvImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => Promise<{
        success: boolean;
        imported: number;
        errors: Array<{ row: number; error: string }>;
        message: string;
    }>;
    onDownloadTemplate: () => void;
}

export function CsvImportDialog({
    isOpen,
    onClose,
    onImport,
    onDownloadTemplate
}: CsvImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        imported: number;
        errors: Array<{ row: number; error: string }>;
        message: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'text/csv') {
            setFile(droppedFile);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setIsLoading(true);
        try {
            const importResult = await onImport(file);
            setResult(importResult);
            if (importResult.success && importResult.errors.length === 0) {
                setTimeout(() => {
                    onClose();
                    setFile(null);
                    setResult(null);
                }, 2000);
            }
        } catch {
            setResult({
                success: false,
                imported: 0,
                errors: [{ row: 0, error: 'Erro ao processar arquivo' }],
                message: 'Erro ao importar arquivo'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card
                className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="csv-import-dialog-title"
            >
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" aria-hidden="true" />
                        <span id="csv-import-dialog-title">Importar Transações</span>
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full" aria-label="Fechar importação CSV">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-colors"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            aria-label="Selecionar arquivo CSV para importação"
                        />
                        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" aria-hidden="true" />
                        {file ? (
                            <p className="text-sm font-medium text-green-600">{file.name}</p>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-gray-700">
                                    Arraste um arquivo CSV ou clique para selecionar
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Formato: data, tipo, descricao, valor, conta, categoria
                                </p>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onDownloadTemplate}
                        className="text-sm text-green-600 hover:text-green-700 hover:underline flex items-center gap-1"
                    >
                        <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                        Baixar planilha modelo
                    </button>

                    {result && (
                        <div className={`rounded-lg p-4 ${result.errors.length > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                            <div className="flex items-start gap-2">
                                {result.errors.length > 0 ? (
                                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" aria-hidden="true" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" aria-hidden="true" />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${result.errors.length > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                                        {result.message}
                                    </p>
                                    {result.errors.length > 0 && (
                                        <ul className="mt-2 text-xs text-amber-600 space-y-1 max-h-32 overflow-auto">
                                            {result.errors.slice(0, 5).map((err, i) => (
                                                <li key={i}>Linha {err.row}: {err.error}</li>
                                            ))}
                                            {result.errors.length > 5 && (
                                                <li>... e mais {result.errors.length - 5} erros</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!file || isLoading}
                            isLoading={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Importar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
