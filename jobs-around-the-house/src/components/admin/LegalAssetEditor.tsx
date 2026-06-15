"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface FileInfo {
    exists: boolean;
    sizeKb: number;
    lastModified: string | null;
}

interface Props {
    initialFileInfo: FileInfo;
}

export default function LegalAssetEditor({ initialFileInfo }: Props) {
    const router = useRouter();
    const [fileInfo, setFileInfo] = useState<FileInfo>(initialFileInfo);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setError(null);
        setSuccess(false);

        if (file) {
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                setError("Please select a valid PDF file (.pdf format only).");
                setSelectedFile(null);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit. Please optimize the PDF.");
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("/api/admin/legal/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setSuccess(true);
                setSelectedFile(null);
                // Update local file metadata info
                const sizeKb = Math.round((selectedFile.size / 1024) * 10) / 10;
                setFileInfo({
                    exists: true,
                    sizeKb,
                    lastModified: new Date().toLocaleString("en-GB"),
                });
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to upload legal document.");
            }
        } catch {
            setError("A network error occurred. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px" }}>
            {/* Alerts */}
            {error && (
                <div
                    className="sg-manager__alert sg-manager__alert--error"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}
                >
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div
                    className="sg-manager__alert"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                        background: "#ecfdf5",
                        borderColor: "#a7f3d0",
                        color: "#065f46",
                        border: "1px solid",
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-lg)",
                    }}
                >
                    <CheckCircle2 size={20} />
                    <span>Terms & Conditions PDF document updated successfully!</span>
                </div>
            )}

            <div className="admin-card">
                <h2 className="admin-card__title">Current Active Document</h2>
                {fileInfo.exists ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1rem", background: "var(--color-navy-50)", borderRadius: "var(--radius-lg)" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "3.5rem",
                                height: "3.5rem",
                                background: "rgba(0, 188, 212, 0.1)",
                                color: "var(--color-teal-600)",
                                borderRadius: "var(--radius-md)",
                            }}
                        >
                            <FileText size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "600", color: "var(--color-navy-800)", fontSize: "var(--font-size-base)" }}>
                                Terms_and_Conditions.pdf
                            </div>
                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                File Size: {fileInfo.sizeKb} KB &middot; Last Modified: {fileInfo.lastModified}
                            </div>
                        </div>
                        <div>
                            <a
                                href="/Terms_and_Conditions.pdf"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn--outline btn--sm"
                            >
                                View PDF
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="admin-empty" style={{ margin: 0, padding: "2rem" }}>
                        <AlertCircle size={32} style={{ margin: "0 auto 0.75rem", color: "var(--color-warning)" }} />
                        <p style={{ fontWeight: "500", color: "var(--color-navy-800)" }}>No Active Legal Terms Document Found</p>
                        <p style={{ fontSize: "var(--font-size-xs)", marginTop: "0.25rem" }}>
                            Please upload a Terms & Conditions PDF document to avoid errors during checkout.
                        </p>
                    </div>
                )}
            </div>

            <div className="admin-card" style={{ marginTop: "1.5rem" }}>
                <h2 className="admin-card__title">Upload Document Override</h2>
                <form onSubmit={handleUpload}>
                    <p className="admin-card__desc">
                        Select a new PDF document to overwrite the existing Terms & Conditions. This file will be linked on the storefront and appended to invoices.
                    </p>

                    <div style={{ margin: "1.5rem 0" }}>
                        <label
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyItems: "center",
                                padding: "2rem",
                                border: "2px dashed var(--color-gray-300)",
                                borderRadius: "var(--radius-xl)",
                                cursor: "pointer",
                                background: selectedFile ? "var(--color-teal-50)" : "var(--color-gray-50)",
                                borderColor: selectedFile ? "var(--color-teal-400)" : "var(--color-gray-300)",
                                transition: "all var(--transition-base)",
                            }}
                        >
                            <Upload size={36} style={{ color: selectedFile ? "var(--color-teal-600)" : "var(--color-gray-400)", marginBottom: "0.5rem" }} />
                            {selectedFile ? (
                                <div style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "600", color: "var(--color-teal-700)" }}>
                                        {selectedFile.name}
                                    </span>
                                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                        Ready to upload &middot; {Math.round((selectedFile.size / 1024) * 10) / 10} KB
                                    </p>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "500", color: "var(--color-navy-800)" }}>
                                        Click to choose or drag PDF file here
                                    </span>
                                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                        PDF format only (Max 10MB)
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                        </label>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? "Uploading PDF..." : "Upload Legal Asset"}
                        </button>
                        {selectedFile && (
                            <button
                                type="button"
                                onClick={() => setSelectedFile(null)}
                                className="btn btn--secondary"
                                disabled={uploading}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
