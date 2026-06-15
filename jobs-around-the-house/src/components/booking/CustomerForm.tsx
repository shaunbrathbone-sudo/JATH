"use client";

import React from "react";

type CustomerData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postcode: string;
    preferredDate: string;
    preferredTime: string;
    notes: string;
};

type CustomerFormProps = {
    data: CustomerData;
    onChange: (data: CustomerData) => void;
};

const CustomerForm = ({ data, onChange }: CustomerFormProps) => {
    const update = (field: keyof CustomerData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    // Generate date options (next 30 days, excluding Sundays)
    const dateOptions: { value: string; label: string }[] = [];
    const today = new Date();
    for (let i = 2; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        if (d.getDay() === 0) continue; // Skip Sundays
        const value = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
        dateOptions.push({ value, label });
    }

    return (
        <div className="customer-form">
            <div className="customer-form__section">
                <h3 className="customer-form__section-title">
                    Contact Information
                </h3>
                <div className="customer-form__row">
                    <div className="form-group">
                        <label
                            className="form-group__label form-group__label--required"
                            htmlFor="cf-firstName"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="cf-firstName"
                            className="form-group__input"
                            value={data.firstName}
                            onChange={(e) =>
                                update("firstName", e.target.value)
                            }
                            autoComplete="given-name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label
                            className="form-group__label form-group__label--required"
                            htmlFor="cf-lastName"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="cf-lastName"
                            className="form-group__input"
                            value={data.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                            autoComplete="family-name"
                            required
                        />
                    </div>
                </div>
                <div className="customer-form__row">
                    <div className="form-group">
                        <label
                            className="form-group__label form-group__label--required"
                            htmlFor="cf-email"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="cf-email"
                            className="form-group__input"
                            value={data.email}
                            onChange={(e) => update("email", e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label
                            className="form-group__label"
                            htmlFor="cf-phone"
                        >
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="cf-phone"
                            className="form-group__input"
                            value={data.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            autoComplete="tel"
                            placeholder="07xxx xxxxxx"
                        />
                    </div>
                </div>
            </div>

            <div className="customer-form__section">
                <h3 className="customer-form__section-title">Address</h3>
                <p className="customer-form__section-help">
                    Where should we carry out the work?
                </p>
                <div className="form-group">
                    <label
                        className="form-group__label"
                        htmlFor="cf-address1"
                    >
                        Address Line 1
                    </label>
                    <input
                        type="text"
                        id="cf-address1"
                        className="form-group__input"
                        value={data.addressLine1}
                        onChange={(e) => update("addressLine1", e.target.value)}
                        autoComplete="address-line1"
                    />
                </div>
                <div className="form-group">
                    <label
                        className="form-group__label"
                        htmlFor="cf-address2"
                    >
                        Address Line 2
                    </label>
                    <input
                        type="text"
                        id="cf-address2"
                        className="form-group__input"
                        value={data.addressLine2}
                        onChange={(e) => update("addressLine2", e.target.value)}
                        autoComplete="address-line2"
                    />
                </div>
                <div className="customer-form__row">
                    <div className="form-group">
                        <label
                            className="form-group__label"
                            htmlFor="cf-city"
                        >
                            City
                        </label>
                        <input
                            type="text"
                            id="cf-city"
                            className="form-group__input"
                            value={data.city}
                            onChange={(e) => update("city", e.target.value)}
                            autoComplete="address-level2"
                            placeholder="Leicester"
                        />
                    </div>
                    <div className="form-group">
                        <label
                            className="form-group__label"
                            htmlFor="cf-postcode"
                        >
                            Postcode
                        </label>
                        <input
                            type="text"
                            id="cf-postcode"
                            className="form-group__input"
                            value={data.postcode}
                            onChange={(e) => update("postcode", e.target.value)}
                            autoComplete="postal-code"
                            placeholder="LE1 1AA"
                        />
                    </div>
                </div>
            </div>

            <div className="customer-form__section">
                <h3 className="customer-form__section-title">
                    Preferred Date & Time
                </h3>
                <div className="customer-form__row">
                    <div className="form-group">
                        <label
                            className="form-group__label"
                            htmlFor="cf-date"
                        >
                            Preferred Date
                        </label>
                        <select
                            id="cf-date"
                            className="form-group__select"
                            value={data.preferredDate}
                            onChange={(e) =>
                                update("preferredDate", e.target.value)
                            }
                        >
                            <option value="">No preference</option>
                            {dateOptions.map((d) => (
                                <option
                                    key={d.value}
                                    value={d.value}
                                >
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label
                            className="form-group__label"
                            htmlFor="cf-time"
                        >
                            Preferred Time
                        </label>
                        <select
                            id="cf-time"
                            className="form-group__select"
                            value={data.preferredTime}
                            onChange={(e) =>
                                update("preferredTime", e.target.value)
                            }
                        >
                            <option value="">No preference</option>
                            <option value="morning">
                                Morning (8am – 12pm)
                            </option>
                            <option value="afternoon">
                                Afternoon (12pm – 4pm)
                            </option>
                            <option value="evening">Evening (4pm – 6pm)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="customer-form__section">
                <div className="form-group">
                    <label
                        className="form-group__label"
                        htmlFor="cf-notes"
                    >
                        Additional Notes
                    </label>
                    <textarea
                        id="cf-notes"
                        className="form-group__textarea"
                        value={data.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        rows={3}
                        placeholder="Anything else we should know? Access codes, parking info, etc."
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerForm;
export type { CustomerData };
