"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface HeroImage {
  id: string;
  imageUrl: string;
  filename: string;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  heroImages: HeroImage[];
}

interface Props {
  categories: Category[];
}

export default function HeroImageManager({ categories }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingBg, setUpdatingBg] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (categoryId: string, file: File) => {
    setUploading(categoryId);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/admin/hero-images/${categoryId}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage({ id: categoryId, text: "Image uploaded and set as active!", type: "success" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ id: categoryId, text: data.error || "Upload failed", type: "error" });
      }
    } catch {
      setMessage({ id: categoryId, text: "Network error", type: "error" });
    } finally {
      setUploading(null);
      const input = fileInputRefs.current[categoryId];
      if (input) input.value = "";
    }
  };

  const handleToggleActive = async (imageId: string, categoryId: string, currentStatus: boolean) => {
    setToggling(imageId);

    try {
      const res = await fetch(`/api/admin/hero-images/${imageId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ id: categoryId, text: data.error || "Failed to update", type: "error" });
      }
    } catch {
      setMessage({ id: categoryId, text: "Network error", type: "error" });
    } finally {
      setToggling(null);
    }
  };

  const handleSetBackground = async (categoryId: string, url: string | null) => {
    setUpdatingBg(categoryId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (res.ok) {
        setMessage({
          id: categoryId,
          text: url ? "Header background set successfully!" : "Background cleared (using default active image).",
          type: "success"
        });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ id: categoryId, text: data.error || "Failed to update background", type: "error" });
      }
    } catch {
      setMessage({ id: categoryId, text: "Network error", type: "error" });
    } finally {
      setUpdatingBg(null);
    }
  };

  const handleDelete = async (imageId: string, categoryId: string) => {
    if (!confirm("Are you sure you want to delete this hero image?")) return;
    setDeleting(imageId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/hero-images/${imageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ id: categoryId, text: "Image deleted successfully!", type: "success" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ id: categoryId, text: data.error || "Delete failed", type: "error" });
      }
    } catch {
      setMessage({ id: categoryId, text: "Network error", type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  // The active background is either the explicitly set imageUrl or the first active hero image
  const getSelectedBgUrl = (cat: Category) => {
    return cat.imageUrl || cat.heroImages.find((img) => img.isActive)?.imageUrl || "";
  };

  return (
    <div className="hero-manager">
      {categories.map((cat) => {
        const activeBg = getSelectedBgUrl(cat);
        const hasImages = cat.heroImages.length > 0;
        const limitReached = cat.heroImages.length >= 6;

        return (
          <div key={cat.id} className="hero-manager__item">
            {/* Active image preview */}
            <div className="hero-manager__preview">
              {activeBg ? (
                <img
                  src={activeBg}
                  alt={`Active hero image preview for ${cat.name}`}
                  className="hero-manager__image"
                />
              ) : (
                <div className="hero-manager__placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{hasImages ? "No images enabled" : "No images uploaded"}</span>
                </div>
              )}
            </div>

            <div className="hero-manager__info">
              <div className="hero-manager__header">
                <div>
                  <h3 className="hero-manager__name">{cat.name}</h3>
                  <p className="hero-manager__slug">
                    {cat.heroImages.length}/6 images uploaded
                    {cat.imageUrl ? " · Custom Header Bg Set" : ""}
                  </p>
                </div>
              </div>

              {message?.id === cat.id && (
                <div className={`hero-manager__msg hero-manager__msg--${message.type}`}>
                  {message.text}
                </div>
              )}

              {/* Image thumbnails with toggles and background selection */}
              {cat.heroImages.length > 0 && (
                <div className="hero-manager__grid">
                  {cat.heroImages.map((img) => {
                    const isBg = cat.imageUrl === img.imageUrl;
                    return (
                      <div key={img.id} className={`hero-manager__thumb-card ${isBg ? "hero-manager__thumb-card--is-bg" : ""}`}>
                        <div className="hero-manager__thumb-media">
                          <img
                            src={img.imageUrl}
                            alt={img.filename}
                            className="hero-manager__thumb-img"
                          />
                          {isBg && (
                            <div className="hero-manager__thumb-bg-badge">
                              Header Bg
                            </div>
                          )}
                        </div>
                        <div className="hero-manager__thumb-controls">
                          {/* Toggle switch */}
                          <label className="toggle" title={img.isActive ? "Disable image in carousel" : "Enable image in carousel"}>
                            <input
                              type="checkbox"
                              className="toggle__input"
                              checked={img.isActive}
                              onChange={() => handleToggleActive(img.id, cat.id, img.isActive)}
                              disabled={toggling === img.id}
                            />
                            <span className="toggle__slider"></span>
                          </label>
                          <span className={`hero-manager__status-text ${img.isActive ? "active" : ""}`}>
                            {img.isActive ? "Active" : "Off"}
                          </span>
                          
                          {/* Set Background Button */}
                          <button
                            type="button"
                            className={`hero-manager__bg-btn ${isBg ? "active" : ""}`}
                            onClick={() => handleSetBackground(cat.id, isBg ? null : img.imageUrl)}
                            disabled={updatingBg === cat.id}
                            title={isBg ? "Remove as category header background" : "Set as category header background"}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={isBg ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="hero-manager__delete-btn"
                            onClick={() => handleDelete(img.id, cat.id)}
                            disabled={deleting === img.id}
                            title="Delete image"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="hero-manager__actions">
                <input
                  ref={(el) => { fileInputRefs.current[cat.id] = el; }}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id={`hero-upload-${cat.id}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(cat.id, file);
                  }}
                />
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={uploading === cat.id || limitReached}
                  onClick={() => fileInputRefs.current[cat.id]?.click()}
                >
                  {uploading === cat.id ? "Uploading..." : limitReached ? "Limit Reached (6/6)" : "Add Image"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
