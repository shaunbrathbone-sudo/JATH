type BookingItemInput = {
  productId: string;
  calculatedPrice: number;
  wasteCost: number;
  quantity: number;
  itemLabel?: string;
  configs: { fieldKey: string; fieldValue: string }[];
};

type CustomerInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
};

type BookingInput = {
  customer: CustomerInput;
  items: BookingItemInput[];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
};

type BookingResult = {
  bookingId: string;
  booking: {
    id: string;
    total: number;
    depositAmount: number;
    remainingAmount: number;
    customer: { name: string; email: string };
    items: { name: string; price: number; quantity: number }[];
  };
};

export type { BookingItemInput, CustomerInput, BookingInput, BookingResult };
