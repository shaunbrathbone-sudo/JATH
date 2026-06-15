"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    title: string;
    sku: string;
    description: string | null;
    basePrice: number;
    vatRate: number;
    stockQuantity: number;
    productType: string;
    isActive: boolean;
    sortOrder: number;
    categoryId: number;
}

interface Props {
    product: Product;
    categories: Category[];
}

export default function ProductDetailsEditor({ product, categories }: Props) {
    const router = useRouter();
    const [title, setTitle] = useState(product.title);
    const [sku, setSku] = useState(product.sku);
    const [description, setDescription] = useState(product.description || "");
    const [basePrice, setBasePrice] = useState(product.basePrice);
    const [vatRate, setVatRate] = useState(product.vatRate);
    const [stockQuantity, setStockQuantity] = useState(product.stockQuantity);
    const [productType, setProductType] = useState(product.productType);
    const [isActive, setIsActive] = useState(product.isActive);
    const [sortOrder, setSortOrder] = useState(product.sortOrder);
    const [categoryId, setCategoryId] = useState(product.categoryId);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError(null);

        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    sku,
                    description,
                    basePrice,
                    vatRate,
                    stockQuantity,
                    productType,
                    isActive,
                    sortOrder,
                    categoryId,
                }),
            });

            if (res.ok) {
                setSaved(true);
                router.refresh();
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update product details.");
            }
        } catch {
            setError("A network error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="product-details-editor">
            {error && (
                <div className="sg-manager__alert sg-manager__alert--error" style={{ marginBottom: "1.5rem" }}>
                    {error}
                </div>
            )}

            <div className="admin-card">
                <h2 className="admin-card__title">General Information</h2>
                <div className="sg-manager__form-grid">
                    <div className="sg-manager__field">
                        <label htmlFor="prod-title">Service Title *</label>
                        <input
                            id="prod-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g. Traditional Pent Shed Installation"
                        />
                    </div>

                    <div className="sg-manager__field">
                        <label htmlFor="prod-sku">SKU Code *</label>
                        <input
                            id="prod-sku"
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            required
                            placeholder="e.g. SHED-PENT-001"
                        />
                    </div>

                    <div className="sg-manager__field">
                        <label htmlFor="prod-category">Category *</label>
                        <select
                            id="prod-category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                            required
                        >
                            <option value="">— Select Category —</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sg-manager__field">
                        <label htmlFor="prod-type">Product Type *</label>
                        <select
                            id="prod-type"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            required
                        >
                            <option value="standard">Standard Catalog Product</option>
                            <option value="workflow_parent">Interactive Workflow Parent</option>
                            <option value="virtual_bundle">Virtual Composite Bundle</option>
                        </select>
                    </div>

                    <div className="sg-manager__field sg-manager__field--full">
                        <label htmlFor="prod-desc">Description</label>
                        <textarea
                            id="prod-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Enter service details, features, inclusions, and exclusions..."
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: "1.5rem" }}>
                <h2 className="admin-card__title">Pricing, VAT & Logistics</h2>
                <div className="sg-manager__form-grid">
                    <div className="sg-manager__field">
                        <label htmlFor="prod-price">Base Price (£ Gross/VAT-inclusive) *</label>
                        <input
                            id="prod-price"
                            type="number"
                            step="0.01"
                            value={basePrice}
                            onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                            required
                            placeholder="e.g. 500.00"
                        />
                    </div>

                    <div className="sg-manager__field">
                        <label htmlFor="prod-vat">VAT Rate (%) *</label>
                        <input
                            id="prod-vat"
                            type="number"
                            step="0.01"
                            value={vatRate}
                            onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                            required
                            placeholder="e.g. 20.00"
                        />
                    </div>

                    <div className="sg-manager__field">
                        <label htmlFor="prod-stock">Stock / Assembly Capacity *</label>
                        <input
                            id="prod-stock"
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                            required
                            placeholder="e.g. 50"
                        />
                    </div>

                    <div className="sg-manager__field">
                        <label htmlFor="prod-sort">Sort Order Rank *</label>
                        <input
                            id="prod-sort"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                            required
                            placeholder="e.g. 1"
                        />
                    </div>

                    <div className="sg-manager__field" style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "100%", paddingTop: "1.5rem" }}>
                        <input
                            id="prod-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{ width: "auto", margin: 0 }}
                        />
                        <label htmlFor="prod-active" style={{ cursor: "pointer" }}>Is Active and visible on Storefront</label>
                    </div>
                </div>
            </div>

            <div className="pricing-editor__actions" style={{ marginTop: "2rem" }}>
                <button
                    type="submit"
                    className="btn btn--primary btn--lg"
                    disabled={saving}
                >
                    {saving ? "Saving Changes..." : "Save Product Details"}
                </button>
                <Link
                    href="/admin/services"
                    className="btn btn--ghost btn--lg"
                    style={{ marginLeft: "1rem" }}
                >
                    Cancel
                </Link>
                {saved && (
                    <span className="pricing-editor__saved" style={{ marginLeft: "1rem" }}>
                        ✓ Details saved successfully
                    </span>
                )}
            </div>
        </form>
    );
}
