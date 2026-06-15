import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding unified JATH database...\n");

    // --- Clear existing data (order matters for FK constraints) ---
    await prisma.heroImage.deleteMany();
    await prisma.orderWorkflowResponse.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.stepOption.deleteMany();
    await prisma.workflowStep.deleteMany();
    await prisma.bundleComponent.deleteMany();
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
            {
                key: "loyalty_accrual_rate",
                label: "Loyalty Accrual Rate",
                value: 1,
                unit: "points/£",
                category: "loyalty",
                description: "Points accrued per £1 spent",
            },
            {
                key: "loyalty_redemption_rate",
                label: "Loyalty Redemption Rate",
                value: 0.01,
                unit: "£/point",
                category: "loyalty",
                description: "Discount value in pounds per point redeemed (e.g. 0.01 = 1p)",
            },
        ],
    });
    console.log("  ✓ Created pricing variables");

    // ========================================================
    // ADMIN USER
    // ========================================================
    const adminEmail = process.env.ADMIN_EMAIL || "admin@jobsaroundthehouse.co.uk";
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "changeme123";
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.adminUser.create({
        data: {
            email: adminEmail,
            passwordHash,
            name: "Admin User",
            role: "super_admin",
        },
    });
    console.log(`  ✓ Created admin user: ${adminEmail}`);

    // ========================================================
    // SERVICE GROUPS (Top-Level Categories)
    // ========================================================
    const groupCleaning = await prisma.category.create({
        data: {
            name: "Cleaning Services",
            slug: "cleaning-services",
            description: "Professional cleaning for driveways, patios, windows, gutters and outdoor surfaces.",
            sortOrder: 1,
        },
    });

    const groupGarden = await prisma.category.create({
        data: {
            name: "Garden Services",
            slug: "garden-services",
            description: "Fencing, garden clearance, shed builds and outdoor maintenance to transform your garden.",
            sortOrder: 2,
        },
    });

    const groupHome = await prisma.category.create({
        data: {
            name: "Home Services",
            slug: "home-services",
            description: "Flat-pack assembly, picture hanging, shelving and general DIY around the house.",
            sortOrder: 3,
        },
    });

    const groupTech = await prisma.category.create({
        data: {
            name: "Tech Installation",
            slug: "tech-installation-group",
            description: "TV wall mounting, home networking, smart home devices and tech setup by professionals.",
            sortOrder: 4,
        },
    });
    console.log("  ✓ Created service groups");

    // ========================================================
    // CHILD CATEGORIES
    // ========================================================
    // 1. Cleaning Group
    const catJetWash = await prisma.category.create({
        data: {
            name: "Jet Washing",
            slug: "jet-washing",
            description: "Professional pressure washing for driveways, patios, decking and more.",
            parentId: groupCleaning.id,
            sortOrder: 1,
        },
    });

    const catGuttering = await prisma.category.create({
        data: {
            name: "Guttering Services",
            slug: "guttering",
            description: "Gutter cleaning, washing, and minor repairs.",
            parentId: groupCleaning.id,
            sortOrder: 2,
        },
    });

    // 2. Garden Group
    const catFencing = await prisma.category.create({
        data: {
            name: "Fencing",
            slug: "fencing",
            description: "New fence panels, fence repairs, gate fitting and post replacement.",
            parentId: groupGarden.id,
            sortOrder: 1,
        },
    });

    const catGardenClearance = await prisma.category.create({
        data: {
            name: "Garden & Clearance",
            slug: "garden-clearance",
            description: "Garden tidying, clearance, hedge trimming and general outdoor maintenance.",
            parentId: groupGarden.id,
            sortOrder: 2,
        },
    });

    const catShedServices = await prisma.category.create({
        data: {
            name: "Shed Services",
            slug: "shed-services",
            description: "From shed removal and disposal to building new sheds and summer houses.",
            parentId: groupGarden.id,
            sortOrder: 3,
        },
    });

    const catInstallationServices = await prisma.category.create({
        data: {
            name: "Installation & Services",
            slug: "installation-services",
            description: "Professional assembly, ground base preparation, and related handyman services.",
            parentId: groupGarden.id,
            sortOrder: 4,
        },
    });

    // 3. Home Group
    const catFlatPack = await prisma.category.create({
        data: {
            name: "Flat-Pack Assembly",
            slug: "flat-pack-assembly",
            description: "Furniture assembly, shelving, wardrobes and more.",
            parentId: groupHome.id,
            sortOrder: 1,
        },
    });

    const catPictureHanging = await prisma.category.create({
        data: {
            name: "Picture & Mirror Hanging",
            slug: "picture-hanging",
            description: "Professional wall mounting for pictures, mirrors, shelves and wall art.",
            parentId: groupHome.id,
            sortOrder: 2,
        },
    });

    const catGeneralDiy = await prisma.category.create({
        data: {
            name: "General DIY",
            slug: "general-diy",
            description: "Odd jobs, repairs and those tasks you never get round to.",
            parentId: groupHome.id,
            sortOrder: 3,
        },
    });

    // 4. Tech Group
    const catTechInstallation = await prisma.category.create({
        data: {
            name: "Tech Installation",
            slug: "tech-installation",
            description: "TV mounting, home network setup, smart home devices and more.",
            parentId: groupTech.id,
            sortOrder: 1,
        },
    });
    console.log("  ✓ Created child categories");

    // ========================================================
    // HERO IMAGES FOR THE CAROUSEL
    // ========================================================
    const heroImageSeedData = [
        { cat: catJetWash, urls: ["/hero/jet-washing.png", "/hero/jw-patio.png", "/hero/jw-decking.png"] },
        { cat: catGuttering, urls: ["/hero/guttering.png", "/hero/gutter-clean.png", "/hero/gutter-repair.png"] },
        { cat: catFencing, urls: ["/hero/fencing.png", "/hero/fence-repair.png", "/hero/fence-gate.png"] },
        { cat: catGardenClearance, urls: ["/hero/garden-clearance.png", "/hero/garden-waste.png", "/hero/garden-hedge.png"] },
        { cat: catShedServices, urls: ["/hero/shed-services.png", "/hero/shed-build.png", "/hero/shed-base.png"] },
        { cat: catFlatPack, urls: ["/hero/flat-pack-assembly.png", "/hero/flatpack-desk.png", "/hero/flatpack-bookshelf.png"] },
        { cat: catPictureHanging, urls: ["/hero/picture-hanging.png", "/hero/picture-mirror.png", "/hero/picture-gallery.png"] },
        { cat: catGeneralDiy, urls: ["/hero/general-diy.png", "/hero/diy-door.png", "/hero/diy-shelving.png"] },
        { cat: catTechInstallation, urls: ["/hero/tech-installation.png", "/hero/tech-smart-home.png", "/hero/tech-soundbar.png"] },
    ];

    for (const data of heroImageSeedData) {
        for (const url of data.urls) {
            await prisma.heroImage.create({
                data: {
                    categoryId: data.cat.id,
                    imageUrl: url,
                    filename: url.split("/").pop() || "",
                    isActive: true,
                },
            });
        }
    }
    console.log("  ✓ Populated hero images for homepage carousel");

    // ========================================================
    // PRODUCTS: STANDALONE & SERVICE
    // ========================================================
    const prodStoneBase = await prisma.product.create({
        data: {
            categoryId: catInstallationServices.id,
            sku: "Stone-Base-001",
            slug: "stone-base-001",
            title: "Stone Base Installation",
            description: "Preparation of ground and installation of gravel/stone sub-base for sheds.",
            basePrice: 250.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "standard",
        },
    });

    const prodLabor = await prisma.product.create({
        data: {
            categoryId: catInstallationServices.id,
            sku: "Labor-001",
            slug: "labor-001",
            title: "Standard Installation Labor",
            description: "Shed assembly and building labor.",
            basePrice: 150.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "standard",
        },
    });
    console.log("  ✓ Created standalone/upsell products");

    // ========================================================
    // WORKFLOW PRODUCTS
    // ========================================================

    // --- 1. JET WASHING ---
    const prodDriveway = await prisma.product.create({
        data: {
            categoryId: catJetWash.id,
            sku: "JW-DRIVE-001",
            slug: "driveway-jet-wash",
            title: "Driveway Jet Wash",
            description: "Professional pressure washing for driveways. We use commercial-grade equipment to restore your driveway to its original condition.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepDriveArea = await prisma.workflowStep.create({
        data: {
            parentProductId: prodDriveway.id,
            stepName: "Step 1: Estimate Driveway Area",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "number",
            fieldKey: "area_sqm",
            helpText: "Estimate the total area of your driveway in square metres. A typical single driveway is around 15-25m².",
            unit: "m²",
            validationRules: JSON.stringify({ min: 5, max: 200 }),
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepDriveArea.id,
            label: "Driveway Jet Wash (per m²)",
            value: "*",
            priceModifier: 3.50,
            optionValueFlag: "driveway_rate",
        },
    });

    const stepDriveSurface = await prisma.workflowStep.create({
        data: {
            parentProductId: prodDriveway.id,
            stepName: "Step 2: Surface Type",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "surface_type",
            helpText: "What material is your driveway made from?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepDriveSurface.id, label: "Block Paving", value: "block_paving", priceModifier: 0, optionValueFlag: "block_paving" },
            { stepId: stepDriveSurface.id, label: "Concrete", value: "concrete", priceModifier: 0, optionValueFlag: "concrete" },
            { stepId: stepDriveSurface.id, label: "Tarmac", value: "tarmac", priceModifier: 0, optionValueFlag: "tarmac" },
            { stepId: stepDriveSurface.id, label: "Natural Stone (+£50.00 surcharge)", value: "natural_stone", priceModifier: 50.00, optionValueFlag: "natural_stone" },
        ],
    });

    const stepDriveAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodDriveway.id,
            stepName: "Step 3: Access Options",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access your driveway with our equipment?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepDriveAccess.id, label: "Easy — Direct access from road", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepDriveAccess.id, label: "Moderate — Through a gate or side passage", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepDriveAccess.id, label: "Difficult — Narrow access, steps or obstacles (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    const prodPatio = await prisma.product.create({
        data: {
            categoryId: catJetWash.id,
            sku: "JW-PATIO-001",
            slug: "patio-jet-wash",
            title: "Patio Jet Wash",
            description: "Professional patio cleaning to remove algae, moss, and dirt. We'll restore your patio to its original beauty.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepPatioArea = await prisma.workflowStep.create({
        data: {
            parentProductId: prodPatio.id,
            stepName: "Step 1: Estimate Patio Area",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "number",
            fieldKey: "area_sqm",
            helpText: "Estimate the total patio area in square metres. A typical back patio is 10-20m².",
            unit: "m²",
            validationRules: JSON.stringify({ min: 3, max: 150 }),
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepPatioArea.id,
            label: "Patio Jet Wash (per m²)",
            value: "*",
            priceModifier: 4.00,
            optionValueFlag: "patio_rate",
        },
    });

    const stepPatioAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodPatio.id,
            stepName: "Step 2: Access Options",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access your patio?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepPatioAccess.id, label: "Easy — Through house or direct garden access", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepPatioAccess.id, label: "Moderate — Through a side gate", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepPatioAccess.id, label: "Difficult — Narrow or restricted access (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    // --- 2. GUTTERING ---
    const prodGutter = await prisma.product.create({
        data: {
            categoryId: catGuttering.id,
            sku: "GUT-CLEAN-001",
            slug: "gutter-cleaning",
            title: "Gutter Cleaning",
            description: "Professional gutter cleaning to prevent blockages and water damage. We clear all debris and flush the system.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepGutterProp = await prisma.workflowStep.create({
        data: {
            parentProductId: prodGutter.id,
            stepName: "Step 1: Property Type",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "property_type",
            helpText: "What type of property?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepGutterProp.id, label: "Terraced House", value: "terraced", priceModifier: 65.00, optionValueFlag: "terraced" },
            { stepId: stepGutterProp.id, label: "Semi-Detached", value: "semi", priceModifier: 85.00, optionValueFlag: "semi" },
            { stepId: stepGutterProp.id, label: "Detached House", value: "detached", priceModifier: 120.00, optionValueFlag: "detached" },
            { stepId: stepGutterProp.id, label: "Bungalow", value: "bungalow", priceModifier: 55.00, optionValueFlag: "bungalow" },
        ],
    });

    const stepGutterStoreys = await prisma.workflowStep.create({
        data: {
            parentProductId: prodGutter.id,
            stepName: "Step 2: Number of Storeys",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "storeys",
            helpText: "How many storeys does your property have?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepGutterStoreys.id, label: "1 Storey (Bungalow)", value: "1", priceModifier: 0.00, optionValueFlag: "storeys_1" },
            { stepId: stepGutterStoreys.id, label: "2 Storeys", value: "2", priceModifier: 0.00, optionValueFlag: "storeys_2" },
            { stepId: stepGutterStoreys.id, label: "3 Storeys (+£40.00 surcharge)", value: "3", priceModifier: 40.00, optionValueFlag: "storeys_3" },
        ],
    });

    const stepGutterAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodGutter.id,
            stepName: "Step 3: Access Options",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the gutters?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepGutterAccess.id, label: "Easy", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepGutterAccess.id, label: "Moderate", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepGutterAccess.id, label: "Difficult (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    // --- 3. FENCING ---
    const prodFence = await prisma.product.create({
        data: {
            categoryId: catFencing.id,
            sku: "FEN-REP-001",
            slug: "fence-panel-replacement",
            title: "Fence Panel Replacement",
            description: "Replace damaged or worn fence panels. We supply standard 6ft panels or you can provide your own.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepFencePanels = await prisma.workflowStep.create({
        data: {
            parentProductId: prodFence.id,
            stepName: "Step 1: Number of Panels",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "number",
            fieldKey: "num_panels",
            helpText: "How many fence panels need replacing?",
            unit: "panels",
            validationRules: JSON.stringify({ min: 1, max: 30 }),
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepFencePanels.id,
            label: "Fence Panel Supplied & Fitted (per panel)",
            value: "*",
            priceModifier: 65.00,
            optionValueFlag: "fencing_panel_rate",
        },
    });

    const stepFenceType = await prisma.workflowStep.create({
        data: {
            parentProductId: prodFence.id,
            stepName: "Step 2: Panel Type",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "panel_type",
            helpText: "What type of fence panel?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepFenceType.id, label: "Standard Lap Panel (6x6 ft)", value: "standard_lap", priceModifier: 0.00, optionValueFlag: "lap_standard" },
            { stepId: stepFenceType.id, label: "Heavy Duty Lap Panel (+£10.00 / panel)", value: "heavy_lap", priceModifier: 10.00, optionValueFlag: "lap_heavy" },
            { stepId: stepFenceType.id, label: "Closeboard (Featheredge) (+£25.00 / panel)", value: "closeboard", priceModifier: 25.00, optionValueFlag: "closeboard" },
        ],
    });

    const stepFencePosts = await prisma.workflowStep.create({
        data: {
            parentProductId: prodFence.id,
            stepName: "Step 3: Posts Need Replacing?",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "boolean",
            fieldKey: "replace_posts",
            helpText: "Do any concrete or wooden posts need replacing too?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepFencePosts.id, label: "Yes, replace posts (+£35.00 / panel)", value: "true", priceModifier: 35.00, optionValueFlag: "replace_posts_yes" },
            { stepId: stepFencePosts.id, label: "No, keep existing posts", value: "false", priceModifier: 0.00, optionValueFlag: "replace_posts_no" },
        ],
    });

    const stepFenceAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodFence.id,
            stepName: "Step 4: Access Options",
            sortOrder: 4,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the fence line?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepFenceAccess.id, label: "Easy", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepFenceAccess.id, label: "Moderate", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepFenceAccess.id, label: "Difficult (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    // --- 4. GARDEN & CLEARANCE ---
    const prodGardenClearance = await prisma.product.create({
        data: {
            categoryId: catGardenClearance.id,
            sku: "GAR-CLEAN-001",
            slug: "garden-clearance-product",
            title: "Garden Clearance",
            description: "General garden clearance and tidying. We'll clear overgrown areas, remove green waste, and get your garden back in shape.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepGardenSize = await prisma.workflowStep.create({
        data: {
            parentProductId: prodGardenClearance.id,
            stepName: "Step 1: Garden Size",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "garden_size",
            helpText: "How large is the area that needs clearing?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepGardenSize.id, label: "Small — Single flower bed or small area", value: "small", priceModifier: 75.00, optionValueFlag: "size_small" },
            { stepId: stepGardenSize.id, label: "Medium — Half a typical garden", value: "medium", priceModifier: 140.00, optionValueFlag: "size_medium" },
            { stepId: stepGardenSize.id, label: "Large — Full garden clearance", value: "large", priceModifier: 220.00, optionValueFlag: "size_large" },
            { stepId: stepGardenSize.id, label: "Extra Large — Heavily overgrown", value: "xlarge", priceModifier: 350.00, optionValueFlag: "size_xl" },
        ],
    });

    const stepGardenWaste = await prisma.workflowStep.create({
        data: {
            parentProductId: prodGardenClearance.id,
            stepName: "Step 2: Include Waste Removal?",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "boolean",
            fieldKey: "waste_removal",
            helpText: "We can take all green waste away for responsible disposal.",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepGardenWaste.id, label: "Yes, include green waste removal (+£45.00)", value: "true", priceModifier: 45.00, optionValueFlag: "waste_yes" },
            { stepId: stepGardenWaste.id, label: "No, I will handle waste disposal", value: "false", priceModifier: 0.00, optionValueFlag: "waste_no" },
        ],
    });

    const stepGardenAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodGardenClearance.id,
            stepName: "Step 3: Access Options",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the garden clearance area?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepGardenAccess.id, label: "Easy", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepGardenAccess.id, label: "Moderate", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepGardenAccess.id, label: "Difficult (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    // --- 5. SHED SERVICES ---
    const prodShedRemoval = await prisma.product.create({
        data: {
            categoryId: catShedServices.id,
            sku: "SHED-REM-001",
            slug: "shed-removal",
            title: "Shed Removal & Disposal",
            description: "We'll dismantle and remove your old shed, including responsible waste disposal. Base removal available as an add-on.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 50,
            productType: "workflow_parent",
        },
    });

    const stepRemovalSize = await prisma.workflowStep.create({
        data: {
            parentProductId: prodShedRemoval.id,
            stepName: "Step 1: Shed Size",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "shed_size",
            helpText: "Approximate size of the shed to be removed.",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepRemovalSize.id, label: "Small (up to 6x4 ft)", value: "small", priceModifier: 150.00, optionValueFlag: "size_small" },
            { stepId: stepRemovalSize.id, label: "Medium (6x4 to 8x6 ft)", value: "medium", priceModifier: 225.00, optionValueFlag: "size_medium" },
            { stepId: stepRemovalSize.id, label: "Large (8x6 to 10x8 ft)", value: "large", priceModifier: 325.00, optionValueFlag: "size_large" },
            { stepId: stepRemovalSize.id, label: "Extra Large (over 10x8 ft)", value: "xlarge", priceModifier: 450.00, optionValueFlag: "size_xl" },
        ],
    });

    const stepRemovalBase = await prisma.workflowStep.create({
        data: {
            parentProductId: prodShedRemoval.id,
            stepName: "Step 2: Remove Concrete Base?",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "boolean",
            fieldKey: "remove_base",
            helpText: "Do you want us to break up and remove the concrete base as well?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepRemovalBase.id, label: "Yes, break up and remove concrete base (+£120.00)", value: "true", priceModifier: 120.00, optionValueFlag: "remove_base_yes" },
            { stepId: stepRemovalBase.id, label: "No, leave base intact", value: "false", priceModifier: 0.00, optionValueFlag: "remove_base_no" },
        ],
    });

    const stepRemovalAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodShedRemoval.id,
            stepName: "Step 3: Access Options",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the shed location?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepRemovalAccess.id, label: "Easy", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepRemovalAccess.id, label: "Moderate", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepRemovalAccess.id, label: "Difficult (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    // Classic Wooden Pent Shed
    const prodShed = await prisma.product.create({
        data: {
            categoryId: catShedServices.id,
            sku: "Wooden-Pent-Shed",
            slug: "wooden-pent-shed",
            title: "Classic Wooden Pent Shed",
            description: "High-quality Scandinavian timber pent shed with felt roof.",
            basePrice: 500.00,
            vatRate: 20.00,
            stockQuantity: 50,
            productType: "workflow_parent",
        },
    });

    const stepSize = await prisma.workflowStep.create({
        data: {
            parentProductId: prodShed.id,
            stepName: "Step 1: Choose Shed Size",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "shed_size",
            helpText: "Select a standard size or enter custom dimensions below.",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepSize.id, label: "Standard 8x6 ft", value: "8x6", priceModifier: 0.00, optionValueFlag: "size_8x6" },
            { stepId: stepSize.id, label: "Standard 10x8 ft (+£150.00)", value: "10x8", priceModifier: 150.00, optionValueFlag: "size_10x8" },
            { stepId: stepSize.id, label: "Custom Dimensions (+£250.00)", value: "custom", priceModifier: 250.00, optionValueFlag: "size_custom" },
        ],
    });

    await prisma.workflowStep.create({
        data: {
            parentProductId: prodShed.id,
            stepName: "Step 1b: Enter Custom Dimensions (Optional)",
            sortOrder: 2,
            isMandatory: false,
            fieldType: "text",
            fieldKey: "custom_dimensions",
            helpText: "Specify width x length in meters (e.g. 3.2 x 2.4).",
            conditionalTriggerValue: "custom",
        },
    });

    const stepBase = await prisma.workflowStep.create({
        data: {
            parentProductId: prodShed.id,
            stepName: "Step 2: Do you have an existing shed base?",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "existing_base",
            helpText: "A solid, level base is required for shed construction.",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepBase.id, label: "Yes, I have an existing base", value: "yes", priceModifier: 0.00, optionValueFlag: "has_base" },
            { stepId: stepBase.id, label: "No, I need a new base installed", value: "no", priceModifier: 0.00, optionValueFlag: "no_base_supplied" },
        ],
    });

    const stepBaseUpsell = await prisma.workflowStep.create({
        data: {
            parentProductId: prodShed.id,
            stepName: "Step 2b: Choose Base Installation Service",
            sortOrder: 4,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "base_service",
            helpText: "Select base installation options linked to our catalog.",
            conditionalTriggerValue: "no",
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepBaseUpsell.id,
            productId: prodStoneBase.id,
            priceModifier: 0.00,
            optionValueFlag: "stone_base_option",
            label: "Add Stone Base Installation (+£250.00)",
            value: "stone_base",
        },
    });

    await prisma.workflowStep.create({
        data: {
            parentProductId: prodShed.id,
            stepName: "Step 3: Upload Site Photos",
            sortOrder: 5,
            isMandatory: true,
            fieldType: "photo_upload",
            fieldKey: "site_photos",
            helpText: "Upload photos of the proposed build area and access path.",
        },
    });

    // Virtual Bundle Complete Shed Package
    const prodBundle = await prisma.product.create({
        data: {
            categoryId: catShedServices.id,
            sku: "Shed-Bundle-Classic",
            slug: "shed-bundle-classic",
            title: "Complete Shed Package",
            description: "Includes Pent Shed, Stone Base, and installation labor.",
            basePrice: 900.00,
            vatRate: 20.00,
            stockQuantity: 20,
            productType: "virtual_bundle",
        },
    });

    await prisma.bundleComponent.createMany({
        data: [
            { bundleProductId: prodBundle.id, componentProductId: prodShed.id, quantity: 1 },
            { bundleProductId: prodBundle.id, componentProductId: prodStoneBase.id, quantity: 1 },
            { bundleProductId: prodBundle.id, componentProductId: prodLabor.id, quantity: 1 },
        ],
    });

    // Add simple steps to virtual bundle to make it bookable through our checkout page check
    const stepBundlePhotos = await prisma.workflowStep.create({
        data: {
            parentProductId: prodBundle.id,
            stepName: "Step 1: Upload Site Photos",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "photo_upload",
            fieldKey: "site_photos",
            helpText: "Upload photos of the proposed build area and access path.",
        },
    });

    const stepBundleAccess = await prisma.workflowStep.create({
        data: {
            parentProductId: prodBundle.id,
            stepName: "Step 2: Access Options",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "access",
            helpText: "How easy is it to access the shed installation location?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepBundleAccess.id, label: "Easy", value: "easy", priceModifier: 0, optionValueFlag: "access_easy" },
            { stepId: stepBundleAccess.id, label: "Moderate", value: "moderate", priceModifier: 0, optionValueFlag: "access_moderate" },
            { stepId: stepBundleAccess.id, label: "Difficult (15% Surcharge)", value: "difficult", priceModifier: 0, optionValueFlag: "access_difficult" },
        ],
    });

    // --- 6. FLAT-PACK ASSEMBLY ---
    const prodFlatPack = await prisma.product.create({
        data: {
            categoryId: catFlatPack.id,
            sku: "FLAT-ASSEM-001",
            slug: "flat-pack-assembly-product",
            title: "Flat-Pack Assembly",
            description: "We'll assemble your flat-pack furniture quickly and correctly. Wardrobes, desks, beds, shelving — you name it.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepFlatType = await prisma.workflowStep.create({
        data: {
            parentProductId: prodFlatPack.id,
            stepName: "Step 1: Item Type",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "item_type",
            helpText: "What type of furniture needs assembling?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepFlatType.id, label: "Small (Shelving, Side Table, TV Unit)", value: "small", priceModifier: 35.00, optionValueFlag: "item_small" },
            { stepId: stepFlatType.id, label: "Medium (Desk, Bookcase, Chest of Drawers)", value: "medium", priceModifier: 55.00, optionValueFlag: "item_medium" },
            { stepId: stepFlatType.id, label: "Large (Wardrobe, Bed Frame)", value: "large", priceModifier: 85.00, optionValueFlag: "item_large" },
            { stepId: stepFlatType.id, label: "Extra Large (PAX System, Fitted Wardrobe)", value: "xlarge", priceModifier: 120.00, optionValueFlag: "item_xl" },
        ],
    });

    const stepFlatNum = await prisma.workflowStep.create({
        data: {
            parentProductId: prodFlatPack.id,
            stepName: "Step 2: Number of Items",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "number",
            fieldKey: "num_items",
            helpText: "How many items need assembling?",
            unit: "items",
            validationRules: JSON.stringify({ min: 1, max: 10 }),
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepFlatNum.id,
            label: "Flat-Pack Items (multiplier active)",
            value: "*",
            priceModifier: 0.00, // item type modifier determines price
            optionValueFlag: "flatpack_items_rate",
        },
    });

    // --- 7. PICTURE & MIRROR HANGING ---
    const prodPicture = await prisma.product.create({
        data: {
            categoryId: catPictureHanging.id,
            sku: "PIC-MIR-001",
            slug: "picture-mirror-hanging",
            title: "Picture & Mirror Hanging",
            description: "Professional wall mounting for pictures, mirrors, and wall art. Perfectly level, securely fixed, no mess.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepPicNum = await prisma.workflowStep.create({
        data: {
            parentProductId: prodPicture.id,
            stepName: "Step 1: Number of Items",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "number",
            fieldKey: "num_items",
            helpText: "How many pictures, mirrors or items need hanging?",
            unit: "items",
            validationRules: JSON.stringify({ min: 1, max: 20 }),
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepPicNum.id,
            label: "Picture Hanging (per item)",
            value: "*",
            priceModifier: 12.00,
            optionValueFlag: "hanging_rate",
        },
    });

    const stepPicWeight = await prisma.workflowStep.create({
        data: {
            parentProductId: prodPicture.id,
            stepName: "Step 2: Heaviest Item",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "item_weight",
            helpText: "What's the heaviest item? Heavy items need special fixings.",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepPicWeight.id, label: "Light (small pictures, prints)", value: "light", priceModifier: 0.00, optionValueFlag: "weight_light" },
            { stepId: stepPicWeight.id, label: "Medium (large pictures, small mirrors)", value: "medium", priceModifier: 0.00, optionValueFlag: "weight_medium" },
            { stepId: stepPicWeight.id, label: "Heavy (large mirrors, heavy art) (+£15.00 fixings)", value: "heavy", priceModifier: 15.00, optionValueFlag: "weight_heavy" },
        ],
    });

    // --- 8. GENERAL DIY ---
    const prodDiy = await prisma.product.create({
        data: {
            categoryId: catGeneralDiy.id,
            sku: "DIY-GEN-001",
            slug: "general-diy-product",
            title: "General DIY & Repairs",
            description: "From door hanging to sealant work, curtain rails to lock fitting. Tell us what you need and we'll give you an hourly rate.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepDiyHours = await prisma.workflowStep.create({
        data: {
            parentProductId: prodDiy.id,
            stepName: "Step 1: Estimated Hours",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "number",
            fieldKey: "estimated_hours",
            helpText: "How many hours do you think the job will take? Minimum 1 hour. We'll confirm the time when we see the job.",
            unit: "hours",
            validationRules: JSON.stringify({ min: 1, max: 8 }),
        },
    });

    await prisma.stepOption.create({
        data: {
            stepId: stepDiyHours.id,
            label: "General DIY Labor (per hour)",
            value: "*",
            priceModifier: 35.00,
            optionValueFlag: "diy_hourly_rate",
        },
    });

    await prisma.workflowStep.create({
        data: {
            parentProductId: prodDiy.id,
            stepName: "Step 2: Job Description",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "text",
            fieldKey: "job_description",
            helpText: "Briefly describe what you need doing so we can come prepared with the right tools.",
        },
    });

    // --- 9. TECH INSTALLATION ---
    const prodTV = await prisma.product.create({
        data: {
            categoryId: catTechInstallation.id,
            sku: "TECH-TV-001",
            slug: "tv-wall-mount",
            title: "TV Wall Mounting",
            description: "Professional TV wall mounting with optional cable hiding. We supply the bracket or use yours.",
            basePrice: 0.00,
            vatRate: 20.00,
            stockQuantity: 100,
            productType: "workflow_parent",
        },
    });

    const stepTVSize = await prisma.workflowStep.create({
        data: {
            parentProductId: prodTV.id,
            stepName: "Step 1: TV Size",
            sortOrder: 1,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "tv_size",
            helpText: "What size is your TV?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepTVSize.id, label: 'Up to 32" (£45.00)', value: "small", priceModifier: 45.00, optionValueFlag: "size_small" },
            { stepId: stepTVSize.id, label: '33" – 55" (£65.00)', value: "medium", priceModifier: 65.00, optionValueFlag: "size_medium" },
            { stepId: stepTVSize.id, label: '56" – 75" (£85.00)', value: "large", priceModifier: 85.00, optionValueFlag: "size_large" },
            { stepId: stepTVSize.id, label: 'Over 75" (£110.00)', value: "xlarge", priceModifier: 110.00, optionValueFlag: "size_xl" },
        ],
    });

    const stepTVWall = await prisma.workflowStep.create({
        data: {
            parentProductId: prodTV.id,
            stepName: "Step 2: Wall Type",
            sortOrder: 2,
            isMandatory: true,
            fieldType: "select",
            fieldKey: "wall_type",
            helpText: "What type of wall are you mounting on?",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepTVWall.id, label: "Brick / Concrete", value: "brick", priceModifier: 0.00, optionValueFlag: "wall_brick" },
            { stepId: stepTVWall.id, label: "Plasterboard (Stud Wall) (+£20.00 special fixings)", value: "plasterboard", priceModifier: 20.00, optionValueFlag: "wall_plasterboard" },
            { stepId: stepTVWall.id, label: "Not Sure", value: "unsure", priceModifier: 0.00, optionValueFlag: "wall_unsure" },
        ],
    });

    const stepTVCables = await prisma.workflowStep.create({
        data: {
            parentProductId: prodTV.id,
            stepName: "Step 3: Hide Cables?",
            sortOrder: 3,
            isMandatory: true,
            fieldType: "boolean",
            fieldKey: "hide_cables",
            helpText: "We can route cables through the wall or use a cable cover for a clean finish.",
        },
    });

    await prisma.stepOption.createMany({
        data: [
            { stepId: stepTVCables.id, label: "Yes, hide cables (+£25.00)", value: "true", priceModifier: 25.00, optionValueFlag: "cables_yes" },
            { stepId: stepTVCables.id, label: "No, leave cables exposed", value: "false", priceModifier: 0.00, optionValueFlag: "cables_no" },
        ],
    });

    console.log("  ✓ Configured all products, workflow steps, options, and bundle components");

    console.log("\n✅ Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
