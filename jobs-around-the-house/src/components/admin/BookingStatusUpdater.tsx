"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    bookingId: string;
    currentStatus: string;
    currentPaymentStatus: string;
}

const statuses = [
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "confirmed", label: "Confirmed", color: "#3b82f6" },
    { value: "in_progress", label: "In Progress", color: "#8b5cf6" },
    { value: "completed", label: "Completed", color: "#10b981" },
    { value: "cancelled", label: "Cancelled", color: "#ef4444" },
];

const paymentStatuses = [
    { value: "unpaid", label: "Unpaid" },
    { value: "deposit_paid", label: "Deposit Paid" },
    { value: "paid", label: "Fully Paid" },
    { value: "refunded", label: "Refunded" },
];

export default function BookingStatusUpdater({
    bookingId,
    currentStatus,
    currentPaymentStatus,
}: Props) {
    const router = useRouter();
    const [status, setStatus] = useState(currentStatus);
    const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const hasChanges =
        status !== currentStatus || paymentStatus !== currentPaymentStatus;

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, paymentStatus }),
            });

            if (res.ok) {
                setSaved(true);
                router.refresh();
                setTimeout(() => setSaved(false), 2000);
            }
        } catch {
            // Silently fail
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="status-updater">
            <div className="status-updater__row">
                <label className="status-updater__label">Booking Status</label>
                <div className="status-updater__options">
                    {statuses.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            className={`status-updater__btn ${status === s.value ? "status-updater__btn--active" : ""}`}
                            style={
                                status === s.value ?
                                    {
                                        borderColor: s.color,
                                        background: `${s.color}15`,
                                        color: s.color,
                                    }
                                :   {}
                            }
                            onClick={() => setStatus(s.value)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="status-updater__row">
                <label className="status-updater__label">Payment Status</label>
                <div className="status-updater__options">
                    {paymentStatuses.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            className={`status-updater__btn ${paymentStatus === s.value ? "status-updater__btn--active" : ""}`}
                            onClick={() => setPaymentStatus(s.value)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {hasChanges && (
                <div className="status-updater__actions">
                    <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    {saved && (
                        <span className="status-updater__saved">✓ Saved</span>
                    )}
                </div>
            )}
        </div>
    );
}
