/**
 * Reusable SVG icon components for Jobs Around The House.
 * Centralised to avoid repetition and ensure consistency.
 */

import React from "react";
import {
    Home,
    Tv,
    Wrench,
    Leaf,
    Image as LucideImage,
    Droplets,
    Settings,
    ArrowRight,
    Check,
    CheckCircle,
    MapPin,
    CreditCard,
    Shield,
    Clock,
    Mail,
    Menu,
    X,
    Warehouse,
} from "lucide-react";

type IconProps = {
    size?: number;
    className?: string;
    color?: string;
    strokeWidth?: number;
};

const HomeIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Home
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const JetWashIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
    </svg>
);

const ShedIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Warehouse
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const TvIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Tv
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const FenceIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <rect
            x="3"
            y="3"
            width="7"
            height="18"
            rx="1"
        />
        <rect
            x="14"
            y="3"
            width="7"
            height="18"
            rx="1"
        />
        <line
            x1="3"
            y1="12"
            x2="10"
            y2="12"
        />
        <line
            x1="14"
            y1="12"
            x2="21"
            y2="12"
        />
    </svg>
);

const WrenchIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Wrench
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const LeafIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Leaf
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const ImageIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <LucideImage
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const DropletIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Droplets
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const GearIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Settings
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const ArrowRightIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2.5,
}: IconProps = {}) => (
    <ArrowRight
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const CheckIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2.5,
}: IconProps = {}) => (
    <Check
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const CheckCircleIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <CheckCircle
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const MapPinIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <MapPin
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const CreditCardIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <CreditCard
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const ShieldIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Shield
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const ClockIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Clock
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const MailIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Mail
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const MenuIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <Menu
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const XIcon = ({
    size = 24,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <X
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
    />
);

const FacebookIcon = ({ size = 16, className }: IconProps = {}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = ({
    size = 16,
    className,
    color,
    strokeWidth = 2,
}: IconProps = {}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            ry="5"
        />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line
            x1="17.5"
            y1="6.5"
            x2="17.51"
            y2="6.5"
        />
    </svg>
);

const WhatsAppIcon = ({ size = 20, className }: IconProps = {}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
);

const serviceIcons: Record<string, (props?: IconProps) => React.ReactNode> = {
    "jet-washing": JetWashIcon,
    "shed-services": ShedIcon,
    "tech-installation": TvIcon,
    fencing: FenceIcon,
    "flat-pack-assembly": WrenchIcon,
    "garden-clearance": LeafIcon,
    "picture-hanging": ImageIcon,
    guttering: DropletIcon,
    "general-diy": GearIcon,
};

export {
    HomeIcon,
    JetWashIcon,
    ShedIcon,
    TvIcon,
    FenceIcon,
    WrenchIcon,
    LeafIcon,
    ImageIcon,
    DropletIcon,
    GearIcon,
    ArrowRightIcon,
    CheckIcon,
    CheckCircleIcon,
    MapPinIcon,
    CreditCardIcon,
    ShieldIcon,
    ClockIcon,
    MailIcon,
    MenuIcon,
    XIcon,
    FacebookIcon,
    InstagramIcon,
    WhatsAppIcon,
    serviceIcons,
};

export type { IconProps };
