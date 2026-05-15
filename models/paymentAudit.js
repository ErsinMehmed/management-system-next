import mongoose, { Schema } from "mongoose";

// Audit запис за payment-related действия на Super Admin.
// type: "payout"            — маркиране на seller като платен (бутон "Изплати")
//       "revenue_confirmed" — потвърждаване на получен оборот
const paymentAuditSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["payout", "revenue_confirmed"],
      required: true,
    },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, default: "" },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, default: "" },
    paidAt: { type: Date },        // batch timestamp (paidAt на orders)
    revenue: { type: Number, default: 0 }, // общ оборот на batch-а
    payout: { type: Number, default: 0 },  // изплатено към seller (само за payout type)
    orderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

paymentAuditSchema.index({ createdAt: -1 });
paymentAuditSchema.index({ seller: 1, createdAt: -1 });
paymentAuditSchema.index({ type: 1, createdAt: -1 });

const PaymentAudit =
  mongoose.models.PaymentAudit ||
  mongoose.model("PaymentAudit", paymentAuditSchema);

export default PaymentAudit;
