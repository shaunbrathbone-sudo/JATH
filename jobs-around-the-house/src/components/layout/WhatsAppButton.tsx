import React from "react";
import { WhatsAppIcon } from "@/components/ui/Icons";

const WhatsAppButton = () => {
    return (
        <a
            href="https://wa.me/447000000000?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20your%20services."
            className="whatsapp-btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
        >
            <WhatsAppIcon size={20} />
            <span>Chat on WhatsApp</span>
        </a>
    );
};

export default WhatsAppButton;
