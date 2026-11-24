import { z } from "zod";
import { sanitizeEmail, sanitizePromoCode, sanitizeText } from "./sanitize";

export const checkoutItemSchema = z.object({
  productId: z
    .string()
    .min(3, "ID prodotto non valido")
    .max(80)
    .regex(/^[a-z0-9_]+$/i, "Formato ID prodotto non consentito"),
  quantity: z
    .number()
    .int("La quantità deve essere un numero intero")
    .min(1, "Quantità minima 1")
    .max(20, "Quantità massima 20 unità per articolo"),
});

export const checkoutRequestSchema = z.object({
  items: z
    .array(checkoutItemSchema)
    .min(1, "Il carrello è vuoto")
    .max(25, "Troppi articoli nel carrello"),
  promoCode: z
    .string()
    .max(32)
    .optional()
    .transform((val) => (val ? sanitizePromoCode(val) : undefined)),
  customerEmail: z
    .string()
    .email("Inserisci un indirizzo email valido")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? sanitizeEmail(val) : undefined)),
  acceptTerms: z.literal(true, {
    errorMap: () => ({
      message:
        "Devi accettare la Privacy Policy e i Termini di Vendita prima di procedere al pagamento.",
    }),
  }),
  deliveryMode: z.enum(["home", "partner-workshop"]).default("home"),
  splitPreference: z
    .enum(["split_shipments", "single_consolidated"])
    .optional(),
});

export type CheckoutRequestPayload = z.infer<typeof checkoutRequestSchema>;

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Inserisci la tua email")
    .email("Formato email non valido")
    .transform((val) => sanitizeEmail(val)),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({
      message: "È necessario acconsentire alla Privacy Policy per iscriversi.",
    }),
  }),
  /** Campo honeypot anti-spam: deve rimanere vuoto */
  companyWebsite: z.string().max(0, "Richiesta non valida").optional().default(""),
});

export type NewsletterPayload = z.infer<typeof newsletterSchema>;

export const supportRequestSchema = z.object({
  fullName: z
    .string()
    .min(2, "Inserisci il tuo nome")
    .max(80)
    .transform((val) => sanitizeText(val, 80)),
  email: z
    .string()
    .email("Inserisci un'email valida")
    .transform((val) => sanitizeEmail(val)),
  vehicleInfo: z
    .string()
    .min(3, "Indica modello auto o misura attuale (es. 225/45 R17)")
    .max(140)
    .transform((val) => sanitizeText(val, 140)),
  message: z
    .string()
    .min(10, "Descrivi brevemente la tua richiesta (minimo 10 caratteri)")
    .max(600)
    .transform((val) => sanitizeText(val, 600)),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({
      message: "Accetta l'informativa sulla Privacy per inviare la richiesta.",
    }),
  }),
  /** Campo honeypot anti-spam: deve rimanere vuoto */
  faxNumber: z.string().max(0, "Richiesta non valida").optional().default(""),
});

export type SupportRequestPayload = z.infer<typeof supportRequestSchema>;
