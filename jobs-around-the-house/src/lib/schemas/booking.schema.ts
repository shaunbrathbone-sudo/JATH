import { z } from "zod";
import { customerSchema } from "./customer.schema";

const bookingItemSchema = z.object({
    productId: z.union([z.string(), z.number()]).transform((v) => Number(v)),
    calculatedPrice: z.number().nonnegative(),
    wasteCost: z.number().nonnegative(),
    quantity: z.number().int().positive(),
    itemLabel: z.string().optional(),
    configs: z.array(
        z.object({
            fieldKey: z.string(),
            fieldValue: z
                .union([z.string(), z.number()])
                .transform((v) => String(v)),
        }),
    ),
});

const bookingSchema = z.object({
    customer: customerSchema,
    items: z.array(bookingItemSchema).min(1, "At least one item is required"),
    preferredDate: z.string().optional().or(z.literal("")),
    preferredTime: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    redeemPoints: z.number().int().nonnegative().optional(),
});

export { bookingItemSchema, bookingSchema };
