import { Agreement } from "@/state/api";

export function downloadAgreementAsPDF(agreement: Agreement): void {
  const application = agreement.application;
  const property = application?.property;
  const tenant = application?.tenant;

  const startDate = application?.startDate
    ? new Date(application.startDate).toLocaleDateString()
    : "—";
  const endDate = application?.endDate
    ? new Date(application.endDate).toLocaleDateString()
    : "—";
  const totalPrice = application?.totalPrice?.toFixed(2) ?? "—";
  const sentAt = new Date(agreement.sentAt).toLocaleDateString();
  const signedAt = agreement.signedAt
    ? new Date(agreement.signedAt).toLocaleDateString()
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Rental Agreement</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 14px; color: #111; padding: 40px; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
        .subtitle { color: #555; margin-bottom: 32px; font-size: 13px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 15px; font-weight: bold; border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 14px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { color: #555; }
        .value { font-weight: 600; text-align: right; max-width: 60%; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: bold; border-top: 2px solid #111; margin-top: 8px; }
        .terms-box { background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px; padding: 16px; white-space: pre-wrap; line-height: 1.6; color: #333; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px; }
        .signed { background: #d1fae5; color: #065f46; }
        .pending { background: #fef3c7; color: #92400e; }
        .signatures { margin-top: 48px; display: flex; gap: 60px; }
        .sig-block { flex: 1; }
        .sig-line { border-top: 1px solid #111; margin-top: 48px; padding-top: 6px; font-size: 12px; color: #555; }
        .footer { margin-top: 48px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
        @media print {
          body { padding: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Rental Agreement</h1>
      <p class="subtitle">
        Agreement #${agreement.id} &nbsp;·&nbsp; Sent on ${sentAt}
        <span class="status-badge ${agreement.status === "Signed" ? "signed" : "pending"}">
          ${agreement.status}
        </span>
      </p>

      <div class="section">
        <div class="section-title">Property Details</div>
        <div class="row"><span class="label">Property Name</span><span class="value">${property?.name ?? "—"}</span></div>
        <div class="row"><span class="label">Address</span><span class="value">${property?.location?.address ?? "—"}</span></div>
        <div class="row"><span class="label">City</span><span class="value">${property?.location?.city ?? "—"}, ${property?.location?.country ?? "—"}</span></div>
        <div class="row"><span class="label">Monthly Rate</span><span class="value">₦${property?.pricePerMonth?.toLocaleString() ?? "—"}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Tenant Details</div>
        <div class="row"><span class="label">Full Name</span><span class="value">${tenant?.name ?? "—"}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${tenant?.email ?? "—"}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${tenant?.phoneNumber ?? "—"}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Stay Details</div>
        <div class="row"><span class="label">Check-in Date</span><span class="value">${startDate}</span></div>
        <div class="row"><span class="label">Check-out Date</span><span class="value">${endDate}</span></div>
        ${signedAt ? `<div class="row"><span class="label">Signed On</span><span class="value">${signedAt}</span></div>` : ""}
        <div class="total-row"><span>Total Amount</span><span>₦${totalPrice}</span></div>
      </div>

      ${
        agreement.customTerms
          ? `
      <div class="section">
        <div class="section-title">Additional Terms & Conditions</div>
        <div class="terms-box">${agreement.customTerms}</div>
      </div>
      `
          : ""
      }

      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line">Manager Signature &amp; Date</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">
            Tenant Signature &amp; Date
            ${signedAt ? `&nbsp;·&nbsp; Digitally accepted on ${signedAt}` : ""}
          </div>
        </div>
      </div>

      <div class="footer">
        This document was generated by Rentiful &nbsp;·&nbsp; Agreement ID: ${agreement.id}
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();

  // Give it a moment to render then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
