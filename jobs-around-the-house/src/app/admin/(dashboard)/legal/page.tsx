import { stat } from "fs/promises";
import path from "path";
import LegalAssetEditor from "@/components/admin/LegalAssetEditor";

export default async function AdminLegalPage() {
    const pdfPath = path.join(process.cwd(), "public", "Terms_and_Conditions.pdf");

    let fileInfo = {
        exists: false,
        sizeKb: 0,
        lastModified: null as string | null,
    };

    try {
        const stats = await stat(pdfPath);
        fileInfo = {
            exists: true,
            sizeKb: Math.round((stats.size / 1024) * 10) / 10,
            lastModified: stats.mtime.toLocaleString("en-GB"),
        };
    } catch {
        // File does not exist
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Legal Asset Manager</h1>
                <p className="admin-page__subtitle">
                    Upload and manage the master Terms & Conditions PDF document that is referenced on the checkout page.
                </p>
            </div>

            <LegalAssetEditor initialFileInfo={fileInfo} />
        </div>
    );
}
