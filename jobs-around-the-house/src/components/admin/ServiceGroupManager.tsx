"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
    _count: { products: number };
}

interface GroupItem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    sortOrder: number;
    categories: CategoryItem[];
}

interface Props {
    groups: GroupItem[];
    ungrouped: CategoryItem[];
}

export default function ServiceGroupManager({ groups, ungrouped }: Props) {
    const router = useRouter();
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState<string | null>(null);
    const [editingGroup, setEditingGroup] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    // --- Group CRUD ---
    const handleAddGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            const res = await fetch("/api/admin/service-groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    description: fd.get("description"),
                    sortOrder: Number(fd.get("sortOrder") || 0),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({
                    text: `Group "${data.name}" created!`,
                    type: "success",
                });
                setShowAddGroup(false);
                router.refresh();
            } else {
                setMessage({ text: data.error, type: "error" });
            }
        } catch {
            setMessage({ text: "Network error", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEditGroup = async (
        e: React.FormEvent<HTMLFormElement>,
        groupId: string,
    ) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            const res = await fetch(`/api/admin/service-groups/${groupId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    description: fd.get("description"),
                    sortOrder: Number(fd.get("sortOrder") || 0),
                    isActive: fd.get("isActive") === "on",
                }),
            });
            if (res.ok) {
                setEditingGroup(null);
                router.refresh();
            }
        } catch {
            setMessage({ text: "Failed to update group", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (groupId: string, name: string) => {
        if (
            !confirm(
                `Delete "${name}"? This only works if no categories are assigned.`,
            )
        )
            return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/service-groups/${groupId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({
                    text: `Group "${name}" deleted`,
                    type: "success",
                });
                router.refresh();
            } else {
                setMessage({ text: data.error, type: "error" });
            }
        } catch {
            setMessage({ text: "Failed to delete", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // --- Category CRUD ---
    const handleAddCategory = async (
        e: React.FormEvent<HTMLFormElement>,
        groupId: string,
    ) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    description: fd.get("description"),
                    groupId,
                    sortOrder: Number(fd.get("sortOrder") || 0),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({
                    text: `Category "${data.name}" created!`,
                    type: "success",
                });
                setShowAddCategory(null);
                router.refresh();
            } else {
                setMessage({ text: data.error, type: "error" });
            }
        } catch {
            setMessage({ text: "Network error", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async (
        e: React.FormEvent<HTMLFormElement>,
        catId: string,
    ) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            const res = await fetch(`/api/admin/categories/${catId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    description: fd.get("description"),
                    groupId: fd.get("groupId") || null,
                    sortOrder: Number(fd.get("sortOrder") || 0),
                    isActive: fd.get("isActive") === "on",
                }),
            });
            if (res.ok) {
                setEditingCategory(null);
                router.refresh();
            }
        } catch {
            setMessage({ text: "Failed to update", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (catId: string, name: string) => {
        if (
            !confirm(
                `Delete "${name}"? Only works if no products are attached.`,
            )
        )
            return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/categories/${catId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: `"${name}" deleted`, type: "success" });
                router.refresh();
            } else {
                setMessage({ text: data.error, type: "error" });
            }
        } catch {
            setMessage({ text: "Failed to delete", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const allGroups = groups; // for the move dropdown

    return (
        <div className="sg-manager">
            {message && (
                <div
                    className={`sg-manager__alert sg-manager__alert--${message.type}`}
                >
                    {message.text}
                    <button
                        onClick={() => setMessage(null)}
                        className="sg-manager__alert-close"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Add Group Button */}
            <div className="sg-manager__toolbar">
                <button
                    className="btn btn--primary btn--sm"
                    onClick={() => setShowAddGroup(!showAddGroup)}
                >
                    {showAddGroup ? "Cancel" : "+ Add Service Group"}
                </button>
            </div>

            {/* Add Group Form */}
            {showAddGroup && (
                <form
                    className="sg-manager__form"
                    onSubmit={handleAddGroup}
                >
                    <h3 className="sg-manager__form-title">
                        New Service Group
                    </h3>
                    <div className="sg-manager__form-grid">
                        <div className="sg-manager__field">
                            <label htmlFor="group-name">Name *</label>
                            <input
                                id="group-name"
                                name="name"
                                required
                                placeholder="e.g. Cleaning Services"
                            />
                        </div>
                        <div className="sg-manager__field">
                            <label htmlFor="group-sort">Sort Order</label>
                            <input
                                id="group-sort"
                                name="sortOrder"
                                type="number"
                                defaultValue={0}
                            />
                        </div>
                        <div className="sg-manager__field sg-manager__field--full">
                            <label htmlFor="group-desc">Description</label>
                            <textarea
                                id="group-desc"
                                name="description"
                                rows={2}
                                placeholder="Brief description shown on the website"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn--primary btn--sm"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Group"}
                    </button>
                </form>
            )}

            {/* Groups */}
            {groups.map((group) => (
                <div
                    key={group.id}
                    className={`sg-manager__group ${!group.isActive ? "sg-manager__group--inactive" : ""}`}
                >
                    <div className="sg-manager__group-header">
                        {editingGroup === group.id ?
                            <form
                                className="sg-manager__inline-form"
                                onSubmit={(e) => handleEditGroup(e, group.id)}
                            >
                                <input
                                    name="name"
                                    defaultValue={group.name}
                                    required
                                    className="sg-manager__inline-input"
                                />
                                <textarea
                                    name="description"
                                    defaultValue={group.description || ""}
                                    rows={1}
                                    className="sg-manager__inline-input"
                                />
                                <input
                                    name="sortOrder"
                                    type="number"
                                    defaultValue={group.sortOrder}
                                    className="sg-manager__inline-input sg-manager__inline-input--sm"
                                />
                                <label className="sg-manager__inline-check">
                                    <input
                                        name="isActive"
                                        type="checkbox"
                                        defaultChecked={group.isActive}
                                    />{" "}
                                    Active
                                </label>
                                <button
                                    type="submit"
                                    className="btn btn--primary btn--xs"
                                    disabled={loading}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--xs"
                                    onClick={() => setEditingGroup(null)}
                                >
                                    Cancel
                                </button>
                            </form>
                        :   <>
                                <div>
                                    <h2 className="sg-manager__group-name">
                                        {group.name}
                                        {!group.isActive && (
                                            <span className="sg-manager__badge sg-manager__badge--off">
                                                Hidden
                                            </span>
                                        )}
                                    </h2>
                                    <p className="sg-manager__group-desc">
                                        {group.description}
                                    </p>
                                    <p className="sg-manager__group-meta">
                                        {group.categories.length} categories ·
                                        Sort: {group.sortOrder}
                                    </p>
                                </div>
                                <div className="sg-manager__group-actions">
                                    <button
                                        className="btn btn--ghost btn--xs"
                                        onClick={() =>
                                            setEditingGroup(group.id)
                                        }
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn--ghost btn--xs btn--danger"
                                        onClick={() =>
                                            handleDeleteGroup(
                                                group.id,
                                                group.name,
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        }
                    </div>

                    {/* Categories in this group */}
                    <div className="sg-manager__categories">
                        {group.categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`sg-manager__cat ${!cat.isActive ? "sg-manager__cat--inactive" : ""}`}
                            >
                                {editingCategory === cat.id ?
                                    <form
                                        className="sg-manager__inline-form"
                                        onSubmit={(e) =>
                                            handleEditCategory(e, cat.id)
                                        }
                                    >
                                        <input
                                            name="name"
                                            defaultValue={cat.name}
                                            required
                                            className="sg-manager__inline-input"
                                        />
                                        <textarea
                                            name="description"
                                            defaultValue={cat.description || ""}
                                            rows={1}
                                            className="sg-manager__inline-input"
                                        />
                                        <select
                                            name="groupId"
                                            defaultValue={group.id}
                                            className="sg-manager__inline-input"
                                        >
                                            <option value="">
                                                — No Group —
                                            </option>
                                            {allGroups.map((g) => (
                                                <option
                                                    key={g.id}
                                                    value={g.id}
                                                >
                                                    {g.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            name="sortOrder"
                                            type="number"
                                            defaultValue={cat.sortOrder}
                                            className="sg-manager__inline-input sg-manager__inline-input--sm"
                                        />
                                        <label className="sg-manager__inline-check">
                                            <input
                                                name="isActive"
                                                type="checkbox"
                                                defaultChecked={cat.isActive}
                                            />{" "}
                                            Active
                                        </label>
                                        <button
                                            type="submit"
                                            className="btn btn--primary btn--xs"
                                            disabled={loading}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--xs"
                                            onClick={() =>
                                                setEditingCategory(null)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                :   <>
                                        <div className="sg-manager__cat-info">
                                            <span className="sg-manager__cat-name">
                                                {cat.name}
                                            </span>
                                            {!cat.isActive && (
                                                <span className="sg-manager__badge sg-manager__badge--off">
                                                    Hidden
                                                </span>
                                            )}
                                            <span className="sg-manager__cat-meta">
                                                {cat._count.products} products ·
                                                /{cat.slug}
                                            </span>
                                        </div>
                                        <div className="sg-manager__cat-actions">
                                            <button
                                                className="btn btn--ghost btn--xs"
                                                onClick={() =>
                                                    setEditingCategory(cat.id)
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn--ghost btn--xs btn--danger"
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        cat.id,
                                                        cat.name,
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                }
                            </div>
                        ))}

                        {/* Add Category */}
                        {showAddCategory === group.id ?
                            <form
                                className="sg-manager__form sg-manager__form--inline"
                                onSubmit={(e) => handleAddCategory(e, group.id)}
                            >
                                <div className="sg-manager__form-grid">
                                    <div className="sg-manager__field">
                                        <label>Name *</label>
                                        <input
                                            name="name"
                                            required
                                            placeholder="e.g. Window Cleaning"
                                        />
                                    </div>
                                    <div className="sg-manager__field">
                                        <label>Sort Order</label>
                                        <input
                                            name="sortOrder"
                                            type="number"
                                            defaultValue={0}
                                        />
                                    </div>
                                    <div className="sg-manager__field sg-manager__field--full">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            rows={2}
                                            placeholder="Brief description"
                                        />
                                    </div>
                                </div>
                                <div className="sg-manager__form-buttons">
                                    <button
                                        type="submit"
                                        className="btn btn--primary btn--xs"
                                        disabled={loading}
                                    >
                                        {loading ?
                                            "Creating..."
                                        :   "Create Category"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn--ghost btn--xs"
                                        onClick={() => setShowAddCategory(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        :   <button
                                className="sg-manager__add-cat"
                                onClick={() => setShowAddCategory(group.id)}
                            >
                                + Add Category to {group.name}
                            </button>
                        }
                    </div>
                </div>
            ))}

            {/* Ungrouped categories */}
            {ungrouped.length > 0 && (
                <div className="sg-manager__group sg-manager__group--ungrouped">
                    <div className="sg-manager__group-header">
                        <div>
                            <h2 className="sg-manager__group-name">
                                Ungrouped Categories
                            </h2>
                            <p className="sg-manager__group-desc">
                                Categories not assigned to any group. Edit them
                                to assign a group.
                            </p>
                        </div>
                    </div>
                    <div className="sg-manager__categories">
                        {ungrouped.map((cat) => (
                            <div
                                key={cat.id}
                                className="sg-manager__cat"
                            >
                                {editingCategory === cat.id ?
                                    <form
                                        className="sg-manager__inline-form"
                                        onSubmit={(e) =>
                                            handleEditCategory(e, cat.id)
                                        }
                                    >
                                        <input
                                            name="name"
                                            defaultValue={cat.name}
                                            required
                                            className="sg-manager__inline-input"
                                        />
                                        <select
                                            name="groupId"
                                            defaultValue=""
                                            className="sg-manager__inline-input"
                                        >
                                            <option value="">
                                                — No Group —
                                            </option>
                                            {allGroups.map((g) => (
                                                <option
                                                    key={g.id}
                                                    value={g.id}
                                                >
                                                    {g.name}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="sg-manager__inline-check">
                                            <input
                                                name="isActive"
                                                type="checkbox"
                                                defaultChecked={cat.isActive}
                                            />{" "}
                                            Active
                                        </label>
                                        <button
                                            type="submit"
                                            className="btn btn--primary btn--xs"
                                            disabled={loading}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--xs"
                                            onClick={() =>
                                                setEditingCategory(null)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                :   <>
                                        <div className="sg-manager__cat-info">
                                            <span className="sg-manager__cat-name">
                                                {cat.name}
                                            </span>
                                            <span className="sg-manager__cat-meta">
                                                {cat._count.products} products
                                            </span>
                                        </div>
                                        <div className="sg-manager__cat-actions">
                                            <button
                                                className="btn btn--ghost btn--xs"
                                                onClick={() =>
                                                    setEditingCategory(cat.id)
                                                }
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </>
                                }
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
