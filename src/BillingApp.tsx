import React, { useState } from "react";

export default function BillingApp() {
  /* ================= SELLER ================= */
  const [seller, setSeller] = useState({
    name: "Your Company Name",
    address: "Company Address",
    phone: "Phone Number",
    gst: "GSTIN",
    bankName: "Bank Name",
    accountName: "Account Holder Name",
    accountNumber: "Account Number",
    ifsc: "IFSC Code"
  });

  /* ================= BUYER ================= */
  const [buyer, setBuyer] = useState({
    name: "Customer / Buyer Name",
    address: "Buyer Address",
    gst: "Buyer GSTIN",
    state: "State",
    stateCode: "State Code",
    placeOfSupply: "Place of Supply"
  });

  /* ================= INVOICE ================= */
  const [invoice, setInvoice] = useState({ number: "", date: "" });

  /* ================= ITEMS ================= */
  const [items, setItems] = useState([
    { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }
  ]);

  /* ================= TAX ================= */
  const [taxType, setTaxType] = useState<"CGST_SGST" | "IGST">("CGST_SGST");
  const [tax, setTax] = useState({ cgst: 9, sgst: 9, igst: 18 });

  /* ================= HELPERS ================= */
  const updateItem = (i: number, f: any, v: any) => {
    const n = [...items];
    n[i][f] = v;
    n[i].amount = n[i].rate * n[i].qty;
    setItems(n);
  };

  const addItem = () =>
    setItems([...items, { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }]);

  const sub = items.reduce((s, i) => s + i.amount, 0);
  const cgstAmt = taxType === "CGST_SGST" ? (sub * tax.cgst) / 100 : 0;
  const sgstAmt = taxType === "CGST_SGST" ? (sub * tax.sgst) / 100 : 0;
  const igstAmt = taxType === "IGST" ? (sub * tax.igst) / 100 : 0;
  const total = sub + cgstAmt + sgstAmt + igstAmt;

  /* ================= AMOUNT IN WORDS ================= */
  const numberToWords = (num: number) => {
    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
      "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const w = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n/10)] + (n%10 ? " " + a[n%10] : "");
      if (n < 1000) return a[Math.floor(n/100)] + " Hundred" + (n%100 ? " " + w(n%100) : "");
      if (n < 100000) return w(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " " + w(n%1000) : "");
      if (n < 10000000) return w(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " " + w(n%100000) : "");
      return w(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " " + w(n%10000000) : "");
    };
    return `Rupees ${w(Math.floor(num))} Only`;
  };

  /* ================= INVOICE HTML ================= */
  const invoiceHTML = `
  <html>
  <head>
    <title>Tax Invoice</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
      body{font-family:Arial;font-size:12px;margin:0;padding:20px}
      .page{width:210mm;min-height:297mm;margin:auto;border:1px solid #000;padding:8px}
      .center{text-align:center}
      .right{text-align:right}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #000;padding:4px}
      .box{border:1px solid #000;padding:6px;margin-top:6px}
      @media print{.actions{display:none}}
    </style>
  </head>
  <body>
    <div class="actions center">
      <button onclick="window.print()">Print</button>
      <button onclick="html2pdf().from(document.getElementById('inv')).set({jsPDF:{unit:'mm',format:'a4'}}).save('invoice.pdf')">Download PDF</button>
    </div>

    <div class="page" id="inv">
      <div class="center">
        <strong>${seller.name}</strong><br/>
        ${seller.address}<br/>
        Mob: ${seller.phone}<br/>
        <strong>TAX INVOICE</strong><br/>
        GSTIN: ${seller.gst}
      </div>

      <table class="no-border">
        <tr><td><b>Invoice No:</b> ${invoice.number}</td>
            <td class="right"><b>Date:</b> ${invoice.date}</td></tr>
      </table>

      <div class="box">
        <b>DETAILS OF RECEIVER / BILLED TO</b><br/>
        ${buyer.name}<br/>
        ${buyer.address}<br/>
        GSTIN: ${buyer.gst}<br/>
        State: ${buyer.state} (${buyer.stateCode}) | Place of Supply: ${buyer.placeOfSupply}
      </div>

      <table>
        <tr><th>Sl</th><th>Particulars</th><th>HSN</th><th>Rate</th><th>Qty</th><th>Amount</th></tr>
        ${items.map((i,idx)=>`
          <tr>
            <td>${idx+1}</td><td>${i.name}</td><td>${i.hsn}</td>
            <td class="right">${i.rate}</td><td>${i.qty}</td>
            <td class="right">${i.amount.toFixed(2)}</td>
          </tr>`).join("")}
      </table>

      <table>
        <tr><td class="right">Taxable Value</td><td class="right">₹${sub.toFixed(2)}</td></tr>
        ${taxType==="CGST_SGST" ? `
        <tr><td class="right">CGST</td><td class="right">₹${cgstAmt.toFixed(2)}</td></tr>
        <tr><td class="right">SGST</td><td class="right">₹${sgstAmt.toFixed(2)}</td></tr>` : `
        <tr><td class="right">IGST</td><td class="right">₹${igstAmt.toFixed(2)}</td></tr>`}
        <tr><td class="right"><b>Total</b></td><td class="right"><b>₹${total.toFixed(2)}</b></td></tr>
      </table>

      <div class="box"><b>Amount in Words:</b><br/>${numberToWords(total)}</div>

      <div class="box">
        <b>Bank Details</b><br/>
        ${seller.accountName}<br/>
        ${seller.accountNumber}<br/>
        ${seller.bankName}<br/>
        IFSC: ${seller.ifsc}
      </div>

      <div class="right" style="margin-top:20px">Authorised Signatory</div>
    </div>
  </body>
  </html>`;

  const openPreview = () => {
    const w = window.open("about:blank","_blank");
    w?.document.write(invoiceHTML);
    w?.document.close();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Billing Software</h1>
        <button onClick={openPreview} className="bg-green-600 text-white px-6 py-2 rounded">
          Preview / Print / Download
        </button>
      </div>
    </div>
  );
}