/**
 * Database Seed Script for Jobs Around The House
 *
 * Populates: categories, products, workflows, steps, options, pricing rules,
 * global pricing variables, and an admin user.
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...\n");

    // --- Clear existing data (order matters for FK constraints) ---
    await prisma.bookingItemPhoto.deleteMany();
    await prisma.bookingItemConfig.deleteMany();
    await prisma.bookingItem.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.stepOption.deleteMany();
    await prisma.workflowStep.deleteMany();
    await prisma.pricingRule.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.productLink.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.pricingVariable.deleteMany();
    await prisma.adminUser.deleteMany();

    console.log("  ✓ Cleared existing data");

    // ========================================================
    // GLOBAL PRICING VARIABLES
    // ========================================================
    await prisma.pricingVariable.createMany({
        data: [
            {
                key: "minimum_charge",
                label: "Minimum Job Charge",
                value: 35,
                unit: "£",
                category: "labour",
                description: "Minimum charge for any job",
            },
            {
                key: "deposit_percentage",
                label: "Deposit Percentage",
                value: 50,
                unit: "%",
                category: "labour",
                description: "Deposit required to confirm booking",
            },
            {
                key: "waste_disposal_rate",
                label: "Waste Disposal Rate",
                value: 15,
                unit: "£",
                category: "waste",
                description: "Per bag/load waste disposal",
            },
            {
                key: "difficult_access_multiplier",
                label: "Difficult Access Surcharge",
                value: 1.15,
                unit: "multiplier",
                category: "labour",
                description: "15% surcharge for difficult access",
            },
            {
                key: "weekend_multiplier",
                label: "Weekend Rate Multiplier",
                value: 1.25,
                unit: "multiplier",
                category: "labour",
                description: "25% surcharge for weekend work",
            },
        ],
    });
    console.log("  ✓ Created pricing variables");

    // ========================================================
    // ADMIN USER
    // ========================================================
    const adminEmail =
        process.env.ADMIN_EMAIL || "admin@jobsaroundthehouse.co.uk";
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "changeme123";
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.adminUser.create({
        data: {
            email: adminEmail,
            passwordHash,
            name: "Admin",
            role: "super_admin",
        },
    });
    console.log(`  ✓ Created admin user: ${adminEmail}`);

    // ========================================================
    // CATEGORIES & PRODUCTS WITH WORKFLOWS
    // ========================================================

    // --- 1. JET WASHING ---
    const catJetWash = await prisma.category.create({
        data: {
            name: "Jet Washing",
            slug: "jet-washing",
            description:
                "Professional pressure washing for driveways, patios, decking and more.",
            icon: "jet-washing",
            sortOrder: 1,
        },
    });

    // Driveway Jet Wash
    const prodDriveway = await prisma.product.create({
        data: {
            categoryId: catJetWash.id,
            name: "Driveway Jet Wash",
            slug: "driveway-jet-wash",
            description:
                "Professional pressure washing for driveways. We use commercial-grade equipment to restore your driveway to its original condition.",
            shortDescription: "Restore your driveway to its original condition",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfDriveway = await prisma.workflow.create({
        data: {
            productId: prodDriveway.id,
            name: "Driveway Jet Wash Configuration",
        },
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfDriveway.id,
            label: "Driveway Area",
            fieldType: "number",
            fieldKey: "area_sqm",
            helpText:
                "Estimate the total area of your driveway in square metres. A typical single driveway is around 15-25m².",
            unit: "m²",
            validationRules: JSON.stringify({ min: 5, max: 200 }),
            sortOrder: 1,
        },
    });

    const stepDriveSurface = await prisma.workflowStep.create({
        data: {
            workflowId: wfDriveway.id,
            label: "Surface Type",
            fieldType: "select",
            fieldKey: "surface_type",
            helpText: "What material is your driveway made from?",
            sortOrder: 2,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepDriveSurface.id,
                label: "Block Paving",
                value: "block_paving",
                sortOrder: 1,
            },
            {
                stepId: stepDriveSurface.id,
                label: "Concrete",
                value: "concrete",
                sortOrder: 2,
            },
            {
                stepId: stepDriveSurface.id,
                label: "Tarmac",
                value: "tarmac",
                sortOrder: 3,
            },
            {
                stepId: stepDriveSurface.id,
                label: "Natural Stone",
                value: "natural_stone",
                description: "Flagstone, sandstone, etc.",
                sortOrder: 4,
            },
        ],
    });

    const stepDriveAccess = await prisma.workflowStep.create({
        data: {
            workflowId: wfDriveway.id,
            label: "Access",
            fieldType: "select",
            fieldKey: "access",
            helpText:
                "How easy is it to access your driveway with our equipment?",
            sortOrder: 3,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepDriveAccess.id,
                label: "Easy — Direct access from road",
                value: "easy",
                sortOrder: 1,
            },
            {
                stepId: stepDriveAccess.id,
                label: "Moderate — Through a gate or side passage",
                value: "moderate",
                sortOrder: 2,
            },
            {
                stepId: stepDriveAccess.id,
                label: "Difficult — Narrow access, steps or obstacles",
                value: "difficult",
                sortOrder: 3,
            },
        ],
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfDriveway.id,
                ruleType: "per_unit",
                fieldKey: "area_sqm",
                rate: 3.5,
                description: "£3.50 per m²",
            },
            {
                workflowId: wfDriveway.id,
                ruleType: "conditional",
                fieldKey: "surface_type",
                condition: JSON.stringify({
                    field: "surface_type",
                    value: "natural_stone",
                }),
                multiplier: 1.2,
                description: "Natural stone (+20%)",
            },
            {
                workflowId: wfDriveway.id,
                ruleType: "conditional",
                fieldKey: "access",
                condition: JSON.stringify({
                    field: "access",
                    value: "moderate",
                }),
                multiplier: 1.1,
                description: "Moderate access (+10%)",
            },
            {
                workflowId: wfDriveway.id,
                ruleType: "conditional",
                fieldKey: "access",
                condition: JSON.stringify({
                    field: "access",
                    value: "difficult",
                }),
                multiplier: 1.2,
                description: "Difficult access (+20%)",
            },
        ],
    });

    // Patio Jet Wash
    const prodPatio = await prisma.product.create({
        data: {
            categoryId: catJetWash.id,
            name: "Patio Jet Wash",
            slug: "patio-jet-wash",
            description:
                "Professional patio cleaning to remove algae, moss, and dirt. We'll restore your patio to its original beauty.",
            shortDescription: "Make your patio look brand new",
            pricingType: "workflow",
            sortOrder: 2,
        },
    });

    const wfPatio = await prisma.workflow.create({
        data: { productId: prodPatio.id, name: "Patio Jet Wash Configuration" },
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfPatio.id,
            label: "Patio Area",
            fieldType: "number",
            fieldKey: "area_sqm",
            helpText:
                "Estimate the total patio area in square metres. A typical back patio is 10-20m².",
            unit: "m²",
            validationRules: JSON.stringify({ min: 3, max: 150 }),
            sortOrder: 1,
        },
    });

    const stepPatioAccess = await prisma.workflowStep.create({
        data: {
            workflowId: wfPatio.id,
            label: "Access",
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access your patio?",
            sortOrder: 2,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepPatioAccess.id,
                label: "Easy — Through house or direct garden access",
                value: "easy",
                sortOrder: 1,
            },
            {
                stepId: stepPatioAccess.id,
                label: "Moderate — Through a side gate",
                value: "moderate",
                sortOrder: 2,
            },
            {
                stepId: stepPatioAccess.id,
                label: "Difficult — Narrow or restricted access",
                value: "difficult",
                sortOrder: 3,
            },
        ],
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfPatio.id,
                ruleType: "per_unit",
                fieldKey: "area_sqm",
                rate: 4.0,
                description: "£4.00 per m²",
            },
            {
                workflowId: wfPatio.id,
                ruleType: "conditional",
                fieldKey: "access",
                condition: JSON.stringify({
                    field: "access",
                    value: "moderate",
                }),
                multiplier: 1.1,
                description: "Moderate access (+10%)",
            },
            {
                workflowId: wfPatio.id,
                ruleType: "conditional",
                fieldKey: "access",
                condition: JSON.stringify({
                    field: "access",
                    value: "difficult",
                }),
                multiplier: 1.2,
                description: "Difficult access (+20%)",
            },
        ],
    });

    console.log("  ✓ Created Jet Washing category with 2 products");

    // --- 2. SHED SERVICES ---
    const catShed = await prisma.category.create({
        data: {
            name: "Shed Services",
            slug: "shed-services",
            description:
                "From shed removal and disposal to building new sheds and summer houses.",
            icon: "shed-services",
            sortOrder: 2,
        },
    });

    // Shed Removal
    const prodShedRemoval = await prisma.product.create({
        data: {
            categoryId: catShed.id,
            name: "Shed Removal & Disposal",
            slug: "shed-removal",
            description:
                "We'll dismantle and remove your old shed, including responsible waste disposal. Base removal available as an add-on.",
            shortDescription: "Out with the old — we handle everything",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfShedRemoval = await prisma.workflow.create({
        data: {
            productId: prodShedRemoval.id,
            name: "Shed Removal Configuration",
        },
    });

    const stepShedSize = await prisma.workflowStep.create({
        data: {
            workflowId: wfShedRemoval.id,
            label: "Shed Size",
            fieldType: "select",
            fieldKey: "shed_size",
            helpText: "Approximate size of the shed to be removed.",
            sortOrder: 1,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepShedSize.id,
                label: "Small (up to 6×4 ft)",
                value: "small",
                sortOrder: 1,
            },
            {
                stepId: stepShedSize.id,
                label: "Medium (6×4 to 8×6 ft)",
                value: "medium",
                sortOrder: 2,
            },
            {
                stepId: stepShedSize.id,
                label: "Large (8×6 to 10×8 ft)",
                value: "large",
                sortOrder: 3,
            },
            {
                stepId: stepShedSize.id,
                label: "Extra Large (over 10×8 ft)",
                value: "xlarge",
                sortOrder: 4,
            },
        ],
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfShedRemoval.id,
            label: "Remove Concrete Base?",
            fieldType: "boolean",
            fieldKey: "remove_base",
            helpText:
                "Do you want us to break up and remove the concrete base as well?",
            sortOrder: 2,
        },
    });

    const stepShedAccess = await prisma.workflowStep.create({
        data: {
            workflowId: wfShedRemoval.id,
            label: "Access",
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the shed location?",
            sortOrder: 3,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepShedAccess.id,
                label: "Easy — Direct access",
                value: "easy",
                sortOrder: 1,
            },
            {
                stepId: stepShedAccess.id,
                label: "Moderate — Through gate",
                value: "moderate",
                sortOrder: 2,
            },
            {
                stepId: stepShedAccess.id,
                label: "Difficult — Narrow or restricted",
                value: "difficult",
                sortOrder: 3,
            },
        ],
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfShedRemoval.id,
                ruleType: "conditional",
                fieldKey: "shed_size",
                condition: JSON.stringify({
                    field: "shed_size",
                    value: "small",
                }),
                rate: 150,
                description: "Small shed removal: £150",
            },
            {
                workflowId: wfShedRemoval.id,
                ruleType: "conditional",
                fieldKey: "shed_size",
                condition: JSON.stringify({
                    field: "shed_size",
                    value: "medium",
                }),
                rate: 225,
                description: "Medium shed removal: £225",
            },
            {
                workflowId: wfShedRemoval.id,
                ruleType: "conditional",
                fieldKey: "shed_size",
                condition: JSON.stringify({
                    field: "shed_size",
                    value: "large",
                }),
                rate: 325,
                description: "Large shed removal: £325",
            },
            {
                workflowId: wfShedRemoval.id,
                ruleType: "conditional",
                fieldKey: "shed_size",
                condition: JSON.stringify({
                    field: "shed_size",
                    value: "xlarge",
                }),
                rate: 450,
                description: "XL shed removal: £450",
            },
            {
                workflowId: wfShedRemoval.id,
                ruleType: "conditional",
                fieldKey: "remove_base",
                condition: JSON.stringify({
                    field: "remove_base",
                    value: "true",
                }),
                rate: 120,
                description: "Concrete base removal: +£120",
            },
            {
                workflowId: wfShedRemoval.id,
                ruleType: "conditional",
                fieldKey: "access",
                condition: JSON.stringify({
                    field: "access",
                    value: "difficult",
                }),
                multiplier: 1.15,
                description: "Difficult access (+15%)",
            },
        ],
    });

    console.log("  ✓ Created Shed Services category");

    // --- 3. TECH INSTALLATION ---
    const catTech = await prisma.category.create({
        data: {
            name: "Tech Installation",
            slug: "tech-installation",
            description:
                "TV mounting, home network setup, smart home devices and more.",
            icon: "tech-installation",
            sortOrder: 3,
        },
    });

    const prodTVMount = await prisma.product.create({
        data: {
            categoryId: catTech.id,
            name: "TV Wall Mounting",
            slug: "tv-wall-mount",
            description:
                "Professional TV wall mounting with optional cable hiding. We supply the bracket or use yours.",
            shortDescription: "Securely mounted, cables hidden",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfTV = await prisma.workflow.create({
        data: { productId: prodTVMount.id, name: "TV Mount Configuration" },
    });

    const stepTVSize = await prisma.workflowStep.create({
        data: {
            workflowId: wfTV.id,
            label: "TV Size",
            fieldType: "select",
            fieldKey: "tv_size",
            helpText: "What size is your TV?",
            sortOrder: 1,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepTVSize.id,
                label: 'Up to 32"',
                value: "small",
                sortOrder: 1,
            },
            {
                stepId: stepTVSize.id,
                label: '33" – 55"',
                value: "medium",
                sortOrder: 2,
            },
            {
                stepId: stepTVSize.id,
                label: '56" – 75"',
                value: "large",
                sortOrder: 3,
            },
            {
                stepId: stepTVSize.id,
                label: 'Over 75"',
                value: "xlarge",
                sortOrder: 4,
            },
        ],
    });

    const stepWallType = await prisma.workflowStep.create({
        data: {
            workflowId: wfTV.id,
            label: "Wall Type",
            fieldType: "select",
            fieldKey: "wall_type",
            helpText: "What type of wall are you mounting on?",
            sortOrder: 2,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepWallType.id,
                label: "Brick / Concrete",
                value: "brick",
                sortOrder: 1,
            },
            {
                stepId: stepWallType.id,
                label: "Plasterboard (Stud Wall)",
                value: "plasterboard",
                description: "Requires special fixings",
                sortOrder: 2,
            },
            {
                stepId: stepWallType.id,
                label: "Not Sure",
                value: "unsure",
                sortOrder: 3,
            },
        ],
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfTV.id,
            label: "Hide Cables?",
            fieldType: "boolean",
            fieldKey: "hide_cables",
            helpText:
                "We can route cables through the wall or use a cable cover for a clean finish.",
            sortOrder: 3,
        },
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfTV.id,
                ruleType: "conditional",
                fieldKey: "tv_size",
                condition: JSON.stringify({ field: "tv_size", value: "small" }),
                rate: 45,
                description: "Small TV mount: £45",
            },
            {
                workflowId: wfTV.id,
                ruleType: "conditional",
                fieldKey: "tv_size",
                condition: JSON.stringify({
                    field: "tv_size",
                    value: "medium",
                }),
                rate: 65,
                description: "Medium TV mount: £65",
            },
            {
                workflowId: wfTV.id,
                ruleType: "conditional",
                fieldKey: "tv_size",
                condition: JSON.stringify({ field: "tv_size", value: "large" }),
                rate: 85,
                description: "Large TV mount: £85",
            },
            {
                workflowId: wfTV.id,
                ruleType: "conditional",
                fieldKey: "tv_size",
                condition: JSON.stringify({
                    field: "tv_size",
                    value: "xlarge",
                }),
                rate: 110,
                description: "XL TV mount: £110",
            },
            {
                workflowId: wfTV.id,
                ruleType: "conditional",
                fieldKey: "wall_type",
                condition: JSON.stringify({
                    field: "wall_type",
                    value: "plasterboard",
                }),
                rate: 20,
                description: "Plasterboard fixings: +£20",
            },
            {
                workflowId: wfTV.id,
                ruleType: "conditional",
                fieldKey: "hide_cables",
                condition: JSON.stringify({
                    field: "hide_cables",
                    value: "true",
                }),
                rate: 25,
                description: "Cable hiding: +£25",
            },
        ],
    });

    console.log("  ✓ Created Tech Installation category");

    // --- 4. FENCING ---
    const catFencing = await prisma.category.create({
        data: {
            name: "Fencing",
            slug: "fencing",
            description:
                "New fence panels, fence repairs, gate fitting and post replacement.",
            icon: "fencing",
            sortOrder: 4,
        },
    });

    const prodFence = await prisma.product.create({
        data: {
            categoryId: catFencing.id,
            name: "Fence Panel Replacement",
            slug: "fence-panel-replacement",
            description:
                "Replace damaged or worn fence panels. We supply standard 6ft panels or you can provide your own.",
            shortDescription: "Replace old or damaged fence panels",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfFence = await prisma.workflow.create({
        data: {
            productId: prodFence.id,
            name: "Fence Panel Replacement Configuration",
        },
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfFence.id,
            label: "Number of Panels",
            fieldType: "number",
            fieldKey: "num_panels",
            helpText: "How many fence panels need replacing?",
            unit: "panels",
            validationRules: JSON.stringify({ min: 1, max: 30 }),
            sortOrder: 1,
        },
    });

    const stepFenceType = await prisma.workflowStep.create({
        data: {
            workflowId: wfFence.id,
            label: "Panel Type",
            fieldType: "select",
            fieldKey: "panel_type",
            helpText: "What type of fence panel?",
            sortOrder: 2,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepFenceType.id,
                label: "Standard Lap Panel (6×6 ft)",
                value: "standard_lap",
                sortOrder: 1,
            },
            {
                stepId: stepFenceType.id,
                label: "Heavy Duty Lap Panel",
                value: "heavy_lap",
                sortOrder: 2,
            },
            {
                stepId: stepFenceType.id,
                label: "Closeboard (Featheredge)",
                value: "closeboard",
                sortOrder: 3,
            },
        ],
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfFence.id,
            label: "Posts Need Replacing?",
            fieldType: "boolean",
            fieldKey: "replace_posts",
            helpText: "Do any concrete or wooden posts need replacing too?",
            sortOrder: 3,
        },
    });

    const stepFenceAccess = await prisma.workflowStep.create({
        data: {
            workflowId: wfFence.id,
            label: "Access",
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the fence line?",
            sortOrder: 4,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepFenceAccess.id,
                label: "Easy",
                value: "easy",
                sortOrder: 1,
            },
            {
                stepId: stepFenceAccess.id,
                label: "Moderate",
                value: "moderate",
                sortOrder: 2,
            },
            {
                stepId: stepFenceAccess.id,
                label: "Difficult",
                value: "difficult",
                sortOrder: 3,
            },
        ],
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfFence.id,
                ruleType: "per_unit",
                fieldKey: "num_panels",
                rate: 65,
                description: "£65 per panel (supplied & fitted)",
            },
            {
                workflowId: wfFence.id,
                ruleType: "conditional",
                fieldKey: "panel_type",
                condition: JSON.stringify({
                    field: "panel_type",
                    value: "heavy_lap",
                }),
                multiplier: 1.15,
                description: "Heavy duty panels (+15%)",
            },
            {
                workflowId: wfFence.id,
                ruleType: "conditional",
                fieldKey: "panel_type",
                condition: JSON.stringify({
                    field: "panel_type",
                    value: "closeboard",
                }),
                multiplier: 1.35,
                description: "Closeboard panels (+35%)",
            },
            {
                workflowId: wfFence.id,
                ruleType: "conditional",
                fieldKey: "replace_posts",
                condition: JSON.stringify({
                    field: "replace_posts",
                    value: "true",
                }),
                rate: 35,
                description: "Post replacement per panel: +£35",
            },
            {
                workflowId: wfFence.id,
                ruleType: "conditional",
                fieldKey: "access",
                condition: JSON.stringify({
                    field: "access",
                    value: "difficult",
                }),
                multiplier: 1.15,
                description: "Difficult access (+15%)",
            },
        ],
    });

    console.log("  ✓ Created Fencing category");

    // --- 5. FLAT-PACK ASSEMBLY ---
    const catFlatPack = await prisma.category.create({
        data: {
            name: "Flat-Pack Assembly",
            slug: "flat-pack-assembly",
            description: "Furniture assembly, shelving, wardrobes and more.",
            icon: "flat-pack-assembly",
            sortOrder: 5,
        },
    });

    const prodFlatPack = await prisma.product.create({
        data: {
            categoryId: catFlatPack.id,
            name: "Flat-Pack Assembly",
            slug: "flat-pack-assembly",
            description:
                "We'll assemble your flat-pack furniture quickly and correctly. Wardrobes, desks, beds, shelving — you name it.",
            shortDescription: "Built right, first time",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfFlatPack = await prisma.workflow.create({
        data: {
            productId: prodFlatPack.id,
            name: "Flat-Pack Assembly Configuration",
        },
    });

    const stepItemType = await prisma.workflowStep.create({
        data: {
            workflowId: wfFlatPack.id,
            label: "Item Type",
            fieldType: "select",
            fieldKey: "item_type",
            helpText: "What type of furniture needs assembling?",
            sortOrder: 1,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepItemType.id,
                label: "Small (Shelving, Side Table, TV Unit)",
                value: "small",
                sortOrder: 1,
            },
            {
                stepId: stepItemType.id,
                label: "Medium (Desk, Bookcase, Chest of Drawers)",
                value: "medium",
                sortOrder: 2,
            },
            {
                stepId: stepItemType.id,
                label: "Large (Wardrobe, Bed Frame)",
                value: "large",
                sortOrder: 3,
            },
            {
                stepId: stepItemType.id,
                label: "Extra Large (PAX System, Fitted Wardrobe)",
                value: "xlarge",
                sortOrder: 4,
            },
        ],
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfFlatPack.id,
            label: "Number of Items",
            fieldType: "number",
            fieldKey: "num_items",
            helpText: "How many items need assembling?",
            unit: "items",
            validationRules: JSON.stringify({ min: 1, max: 10 }),
            sortOrder: 2,
        },
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfFlatPack.id,
                ruleType: "conditional",
                fieldKey: "item_type",
                condition: JSON.stringify({
                    field: "item_type",
                    value: "small",
                }),
                rate: 35,
                description: "Small item: £35",
            },
            {
                workflowId: wfFlatPack.id,
                ruleType: "conditional",
                fieldKey: "item_type",
                condition: JSON.stringify({
                    field: "item_type",
                    value: "medium",
                }),
                rate: 55,
                description: "Medium item: £55",
            },
            {
                workflowId: wfFlatPack.id,
                ruleType: "conditional",
                fieldKey: "item_type",
                condition: JSON.stringify({
                    field: "item_type",
                    value: "large",
                }),
                rate: 85,
                description: "Large item: £85",
            },
            {
                workflowId: wfFlatPack.id,
                ruleType: "conditional",
                fieldKey: "item_type",
                condition: JSON.stringify({
                    field: "item_type",
                    value: "xlarge",
                }),
                rate: 120,
                description: "XL item: £120",
            },
        ],
    });

    console.log("  ✓ Created Flat-Pack Assembly category");

    // --- 6. GARDEN & CLEARANCE ---
    const catGarden = await prisma.category.create({
        data: {
            name: "Garden & Clearance",
            slug: "garden-clearance",
            description:
                "Garden tidying, clearance, hedge trimming and general outdoor maintenance.",
            icon: "garden-clearance",
            sortOrder: 6,
        },
    });

    const prodGarden = await prisma.product.create({
        data: {
            categoryId: catGarden.id,
            name: "Garden Clearance",
            slug: "garden-clearance",
            description:
                "General garden clearance and tidying. We'll clear overgrown areas, remove green waste, and get your garden back in shape.",
            shortDescription: "Reclaim your outdoor space",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfGarden = await prisma.workflow.create({
        data: {
            productId: prodGarden.id,
            name: "Garden Clearance Configuration",
        },
    });

    const stepGardenSize = await prisma.workflowStep.create({
        data: {
            workflowId: wfGarden.id,
            label: "Garden Size",
            fieldType: "select",
            fieldKey: "garden_size",
            helpText: "How large is the area that needs clearing?",
            sortOrder: 1,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepGardenSize.id,
                label: "Small — Single flower bed or small area",
                value: "small",
                sortOrder: 1,
            },
            {
                stepId: stepGardenSize.id,
                label: "Medium — Half a typical garden",
                value: "medium",
                sortOrder: 2,
            },
            {
                stepId: stepGardenSize.id,
                label: "Large — Full garden clearance",
                value: "large",
                sortOrder: 3,
            },
            {
                stepId: stepGardenSize.id,
                label: "Extra Large — Heavily overgrown",
                value: "xlarge",
                sortOrder: 4,
            },
        ],
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfGarden.id,
            label: "Include Waste Removal?",
            fieldType: "boolean",
            fieldKey: "waste_removal",
            helpText:
                "We can take all green waste away for responsible disposal.",
            sortOrder: 2,
        },
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfGarden.id,
                ruleType: "conditional",
                fieldKey: "garden_size",
                condition: JSON.stringify({
                    field: "garden_size",
                    value: "small",
                }),
                rate: 75,
                description: "Small garden: £75",
            },
            {
                workflowId: wfGarden.id,
                ruleType: "conditional",
                fieldKey: "garden_size",
                condition: JSON.stringify({
                    field: "garden_size",
                    value: "medium",
                }),
                rate: 140,
                description: "Medium garden: £140",
            },
            {
                workflowId: wfGarden.id,
                ruleType: "conditional",
                fieldKey: "garden_size",
                condition: JSON.stringify({
                    field: "garden_size",
                    value: "large",
                }),
                rate: 220,
                description: "Large garden: £220",
            },
            {
                workflowId: wfGarden.id,
                ruleType: "conditional",
                fieldKey: "garden_size",
                condition: JSON.stringify({
                    field: "garden_size",
                    value: "xlarge",
                }),
                rate: 350,
                description: "XL garden: £350",
            },
            {
                workflowId: wfGarden.id,
                ruleType: "conditional",
                fieldKey: "waste_removal",
                condition: JSON.stringify({
                    field: "waste_removal",
                    value: "true",
                }),
                rate: 45,
                description: "Waste removal: +£45",
            },
        ],
    });

    console.log("  ✓ Created Garden & Clearance category");

    // --- 7. PICTURE & MIRROR HANGING ---
    const catPicture = await prisma.category.create({
        data: {
            name: "Picture & Mirror Hanging",
            slug: "picture-hanging",
            description:
                "Professional wall mounting for pictures, mirrors, shelves and wall art.",
            icon: "picture-hanging",
            sortOrder: 7,
        },
    });

    const prodPicture = await prisma.product.create({
        data: {
            categoryId: catPicture.id,
            name: "Picture & Mirror Hanging",
            slug: "picture-mirror-hanging",
            description:
                "Professional wall mounting for pictures, mirrors, and wall art. Perfectly level, securely fixed, no mess.",
            shortDescription: "Perfectly level, securely fixed",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfPicture = await prisma.workflow.create({
        data: {
            productId: prodPicture.id,
            name: "Picture Hanging Configuration",
        },
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfPicture.id,
            label: "Number of Items",
            fieldType: "number",
            fieldKey: "num_items",
            helpText: "How many pictures, mirrors or items need hanging?",
            unit: "items",
            validationRules: JSON.stringify({ min: 1, max: 20 }),
            sortOrder: 1,
        },
    });

    const stepItemWeight = await prisma.workflowStep.create({
        data: {
            workflowId: wfPicture.id,
            label: "Heaviest Item",
            fieldType: "select",
            fieldKey: "item_weight",
            helpText:
                "What's the heaviest item? Heavy items need special fixings.",
            sortOrder: 2,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepItemWeight.id,
                label: "Light (small pictures, prints)",
                value: "light",
                sortOrder: 1,
            },
            {
                stepId: stepItemWeight.id,
                label: "Medium (large pictures, small mirrors)",
                value: "medium",
                sortOrder: 2,
            },
            {
                stepId: stepItemWeight.id,
                label: "Heavy (large mirrors, heavy art)",
                value: "heavy",
                sortOrder: 3,
            },
        ],
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfPicture.id,
                ruleType: "per_unit",
                fieldKey: "num_items",
                rate: 12,
                description: "£12 per item",
            },
            {
                workflowId: wfPicture.id,
                ruleType: "conditional",
                fieldKey: "item_weight",
                condition: JSON.stringify({
                    field: "item_weight",
                    value: "heavy",
                }),
                rate: 15,
                description: "Heavy item fixings: +£15",
            },
        ],
    });

    console.log("  ✓ Created Picture & Mirror Hanging category");

    // --- 8. GUTTERING ---
    const catGutter = await prisma.category.create({
        data: {
            name: "Guttering Services",
            slug: "guttering",
            description: "Gutter cleaning, washing, and minor repairs.",
            icon: "guttering",
            sortOrder: 8,
        },
    });

    const prodGutter = await prisma.product.create({
        data: {
            categoryId: catGutter.id,
            name: "Gutter Cleaning",
            slug: "gutter-cleaning",
            description:
                "Professional gutter cleaning to prevent blockages and water damage. We clear all debris and flush the system.",
            shortDescription: "Prevent blockages and water damage",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfGutter = await prisma.workflow.create({
        data: {
            productId: prodGutter.id,
            name: "Gutter Cleaning Configuration",
        },
    });

    const stepPropertyType = await prisma.workflowStep.create({
        data: {
            workflowId: wfGutter.id,
            label: "Property Type",
            fieldType: "select",
            fieldKey: "property_type",
            helpText: "What type of property?",
            sortOrder: 1,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepPropertyType.id,
                label: "Terraced House",
                value: "terraced",
                sortOrder: 1,
            },
            {
                stepId: stepPropertyType.id,
                label: "Semi-Detached",
                value: "semi",
                sortOrder: 2,
            },
            {
                stepId: stepPropertyType.id,
                label: "Detached",
                value: "detached",
                sortOrder: 3,
            },
            {
                stepId: stepPropertyType.id,
                label: "Bungalow",
                value: "bungalow",
                sortOrder: 4,
            },
        ],
    });

    const stepStoreys = await prisma.workflowStep.create({
        data: {
            workflowId: wfGutter.id,
            label: "Number of Storeys",
            fieldType: "select",
            fieldKey: "storeys",
            helpText: "How many storeys does your property have?",
            sortOrder: 2,
        },
    });

    await prisma.stepOption.createMany({
        data: [
            {
                stepId: stepStoreys.id,
                label: "1 Storey (Bungalow)",
                value: "1",
                sortOrder: 1,
            },
            {
                stepId: stepStoreys.id,
                label: "2 Storeys",
                value: "2",
                sortOrder: 2,
            },
            {
                stepId: stepStoreys.id,
                label: "3 Storeys",
                value: "3",
                sortOrder: 3,
            },
        ],
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfGutter.id,
                ruleType: "conditional",
                fieldKey: "property_type",
                condition: JSON.stringify({
                    field: "property_type",
                    value: "terraced",
                }),
                rate: 65,
                description: "Terraced: £65",
            },
            {
                workflowId: wfGutter.id,
                ruleType: "conditional",
                fieldKey: "property_type",
                condition: JSON.stringify({
                    field: "property_type",
                    value: "semi",
                }),
                rate: 85,
                description: "Semi-detached: £85",
            },
            {
                workflowId: wfGutter.id,
                ruleType: "conditional",
                fieldKey: "property_type",
                condition: JSON.stringify({
                    field: "property_type",
                    value: "detached",
                }),
                rate: 120,
                description: "Detached: £120",
            },
            {
                workflowId: wfGutter.id,
                ruleType: "conditional",
                fieldKey: "property_type",
                condition: JSON.stringify({
                    field: "property_type",
                    value: "bungalow",
                }),
                rate: 55,
                description: "Bungalow: £55",
            },
            {
                workflowId: wfGutter.id,
                ruleType: "conditional",
                fieldKey: "storeys",
                condition: JSON.stringify({ field: "storeys", value: "3" }),
                rate: 40,
                description: "3 storey surcharge: +£40",
            },
        ],
    });

    console.log("  ✓ Created Guttering Services category");

    // --- 9. GENERAL DIY ---
    const catDIY = await prisma.category.create({
        data: {
            name: "General DIY",
            slug: "general-diy",
            description:
                "Odd jobs, repairs and those tasks you never get round to.",
            icon: "general-diy",
            sortOrder: 9,
        },
    });

    const prodDIY = await prisma.product.create({
        data: {
            categoryId: catDIY.id,
            name: "General DIY & Repairs",
            slug: "general-diy",
            description:
                "From door hanging to sealant work, curtain rails to lock fitting. Tell us what you need and we'll give you an hourly rate.",
            shortDescription: "No job too small",
            pricingType: "workflow",
            sortOrder: 1,
        },
    });

    const wfDIY = await prisma.workflow.create({
        data: { productId: prodDIY.id, name: "General DIY Configuration" },
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfDIY.id,
            label: "Estimated Hours",
            fieldType: "number",
            fieldKey: "estimated_hours",
            helpText:
                "How many hours do you think the job will take? Minimum 1 hour. We'll confirm the time when we see the job.",
            unit: "hours",
            validationRules: JSON.stringify({ min: 1, max: 8 }),
            sortOrder: 1,
        },
    });

    await prisma.workflowStep.create({
        data: {
            workflowId: wfDIY.id,
            label: "Job Description",
            fieldType: "text",
            fieldKey: "job_description",
            helpText:
                "Briefly describe what you need doing so we can come prepared with the right tools.",
            sortOrder: 2,
        },
    });

    await prisma.pricingRule.createMany({
        data: [
            {
                workflowId: wfDIY.id,
                ruleType: "per_unit",
                fieldKey: "estimated_hours",
                rate: 35,
                description: "£35 per hour",
            },
        ],
    });

    console.log("  ✓ Created General DIY category");

    console.log("\n✅ Database seeded successfully!");
    console.log(`   → 9 categories`);
    console.log(`   → 10 products with workflows`);
    console.log(`   → Admin: ${adminEmail}`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
