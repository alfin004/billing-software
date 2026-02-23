import React, { useState, useEffect } from "react";

export default function BillingApp() {
  // ===== LOCAL STORAGE HELPERS =====
  const saveToStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const loadFromStorage = (key) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  };

  // SELLER / COMPANY DETAILS (editable)
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

  // BUYER DETAILS (editable)
  const [buyer, setBuyer] = useState({
    name: "Customer / Buyer Name",
    address: "Buyer Address",
    gst: "Buyer GSTIN",
    state: "State",
    stateCode: "State Code",
    placeOfSupply: "Place of Supply"
  });

  // INVOICE META
  const [invoice, setInvoice] = useState({
    number: "",
    date: ""
  });

  // ITEMS
  const [items, setItems] = useState([
    { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }
  ]);

  // TAX
  const [taxType, setTaxType] = useState("CGST_SGST"); // CGST_SGST | IGST | NO_GST
  const [tax, setTax] = useState({ cgst: 9, sgst: 9, igst: 18 });
  const [showCanvasPreview, setShowCanvasPreview] = useState(false);

    // ===== LOAD FROM LOCAL STORAGE ON FIRST LOAD =====
  useEffect(() => {
    const savedSeller = loadFromStorage("billing_seller");
    const savedBank = loadFromStorage("billing_bank");
    if (savedSeller) setSeller(savedSeller);
    if (savedBank) setSeller((prev) => ({ ...prev, ...savedBank }));
  }, []);

  const updateItem = (i, f, v) => {
    const n = [...items];
    n[i][f] = v;
    n[i].amount = n[i].rate * n[i].qty;
    setItems(n);
  };

  const addItem = () => setItems([...items, { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }]);

  const sub = items.reduce((s, i) => s + i.amount, 0);
  const cgstAmt = taxType === "CGST_SGST" ? (sub * tax.cgst) / 100 : 0;
  const sgstAmt = taxType === "CGST_SGST" ? (sub * tax.sgst) / 100 : 0;
  const igstAmt = taxType === "IGST" ? (sub * tax.igst) / 100 : 0;
  const total = sub + cgstAmt + sgstAmt + igstAmt;

  // Amount in words (Indian format)
  const numberToWords = (num) => {
    const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '');
      if (n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + inWords(n%100) : '');
      if (n < 100000) return inWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + inWords(n%1000) : '');
      if (n < 10000000) return inWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + inWords(n%100000) : '');
      return inWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + inWords(n%10000000) : '');
    };
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    return 'Rupees ' + inWords(rupees) + (paise ? ' and ' + inWords(paise) + ' Paise' : '') + ' Only';
  };

  const amountInWords = numberToWords(total);

  // EXACT GST INVOICE HTML (MATCHES SCAN FORMAT)
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
      .no-border td{border:none}
      .box{border:1px solid #000;padding:6px;margin-top:6px}
      @media print{.actions{display:none}}
    </style>
  </head>
  <body>
    <div class="actions center" style="margin-bottom:10px">
      <button onclick="window.print()">Print</button>
      <button onclick="html2pdf().from(document.getElementById('inv')).set({jsPDF:{unit:'mm',format:'a4'}}).save('invoice.pdf')">Download PDF</button>
    </div>

    <div class="page" id="inv">
      <div class="center">
        <strong>${seller.name}</strong><br/>
        ${seller.address}<br/>
        Mob: ${seller.phone}<br/>
        <strong>${taxType === "NO_GST" ? "INVOICE" : "TAX INVOICE"}</strong><br/>
        GSTIN: ${seller.gst}
      </div>

      <table class="no-border" style="margin-top:6px">
        <tr>
          <td><strong>Invoice No:</strong> ${invoice.number}</td>
          <td class="right"><strong>Date:</strong> ${invoice.date}</td>
        </tr>
      </table>

      <div class="box">
        <strong>DETAILS OF RECEIVER / BILLED TO</strong><br/>
        <strong>Name:</strong> ${buyer.name}<br/>
        <strong>Address:</strong> ${buyer.address}<br/>
        ${taxType === "NO_GST" ? "" : `<strong>GSTIN:</strong> ${buyer.gst}<br/>`}
        <strong>State:</strong> ${buyer.state} &nbsp;&nbsp; <strong>Code:</strong> ${buyer.stateCode} &nbsp;&nbsp; <strong>Place of Supply:</strong> ${buyer.placeOfSupply}
      </div>

      <!-- ITEMS TABLE -->
      <table style="margin-top:6px">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Particulars</th>
            <th>HSN</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((i,idx)=>`
            <tr>
              <td style="text-align:center">${idx+1}</td>
              <td>${i.name}</td>
              <td style="text-align:center">${i.hsn}</td>
              <td style="text-align:right">${i.rate}</td>
              <td style="text-align:center">${i.qty}</td>
              <td style="text-align:right">${i.amount.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <table style="margin-top:6px">
        <tr><td class="right">Total Taxable Value</td><td class="right">₹${sub.toFixed(2)}</td></tr>
        ${taxType === "CGST_SGST" ? `
          <tr><td class="right">CGST @ ${tax.cgst}%</td><td class="right">₹${cgstAmt.toFixed(2)}</td></tr>
          <tr><td class="right">SGST @ ${tax.sgst}%</td><td class="right">₹${sgstAmt.toFixed(2)}</td></tr>
        ` : ""}
        ${taxType === "IGST" ? `
          <tr><td class="right">IGST @ ${tax.igst}%</td><td class="right">₹${igstAmt.toFixed(2)}</td></tr>
        ` : ""}
        <tr><td class="right"><strong>Total Invoice Value</strong></td><td class="right"><strong>₹${total.toFixed(2)}</strong></td></tr>
      </table>

      <div class="box">
        <strong>Amount in Words:</strong><br/>
        ${amountInWords}
      </div>

      <div class="box">
        <strong>Bank Details</strong><br/>
        Account Name: ${seller.accountName}<br/>
        Account Number: ${seller.accountNumber}<br/>
        Bank: ${seller.bankName}<br/>
        IFSC: ${seller.ifsc}
      </div>

      <div class="right" style="margin-top:20px">
        Authorised Signatory
      </div>
    </div>
  </body>
  </html>`;

  const openPreview = () => {
    const w = window.open("about:blank", "_blank");
    if (!w) { setShowCanvasPreview(true); return; }
    w.document.write(invoiceHTML);
    w.document.close();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Billing Software</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const { bankName, accountName, accountNumber, ifsc, ...company } = seller;
                saveToStorage("billing_seller", company);
                saveToStorage("billing_bank", { bankName, accountName, accountNumber, ifsc });
                alert("Company & bank details saved");
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >Save Details</button>
            <button
              onClick={() => {
                const savedSeller = loadFromStorage("billing_seller");
                const savedBank = loadFromStorage("billing_bank");
                if (savedSeller) setSeller(savedSeller);
                if (savedBank) setSeller((prev) => ({ ...prev, ...savedBank }));
              }}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >Load Details</button>
          </div>
        </div>

        <h2 className="font-semibold mb-2">Company Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="border p-2" value={seller.name} onChange={e=>setSeller({...seller,name:e.target.value})} placeholder="Company Name" />
          <input className="border p-2" value={seller.gst} onChange={e=>setSeller({...seller,gst:e.target.value})} placeholder="GSTIN" />
          <input className="border p-2" value={seller.address} onChange={e=>setSeller({...seller,address:e.target.value})} placeholder="Address" />
          <input className="border p-2" value={seller.phone} onChange={e=>setSeller({...seller,phone:e.target.value})} placeholder="Phone" />
        </div>

        <h2 className="font-semibold mb-2">Bank / Account Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input className="border p-2" value={seller.bankName} onChange={e=>setSeller({...seller,bankName:e.target.value})} placeholder="Bank Name" />
          <input className="border p-2" value={seller.accountName} onChange={e=>setSeller({...seller,accountName:e.target.value})} placeholder="Account Holder Name" />
          <input className="border p-2" value={seller.accountNumber} onChange={e=>setSeller({...seller,accountNumber:e.target.value})} placeholder="Account Number" />
          <input className="border p-2" value={seller.ifsc} onChange={e=>setSeller({...seller,ifsc:e.target.value})} placeholder="IFSC Code" />
        </div>

        <h2 className="font-semibold mb-2">Buyer / Customer Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input className="border p-2" value={buyer.name} onChange={e=>setBuyer({...buyer,name:e.target.value})} placeholder="Customer / Buyer Name" />
          <input className="border p-2" value={buyer.gst} onChange={e=>setBuyer({...buyer,gst:e.target.value})} placeholder="Buyer GSTIN" />
          <input className="border p-2" value={buyer.address} onChange={e=>setBuyer({...buyer,address:e.target.value})} placeholder="Buyer Address" />
          <input className="border p-2" value={buyer.placeOfSupply} onChange={e=>setBuyer({...buyer,placeOfSupply:e.target.value})} placeholder="Place of Supply" />
          <input className="border p-2" value={buyer.state} onChange={e=>setBuyer({...buyer,state:e.target.value})} placeholder="State" />
          <input className="border p-2" value={buyer.stateCode} onChange={e=>setBuyer({...buyer,stateCode:e.target.value})} placeholder="State Code" />
        </div>

        <h2 className="font-semibold mb-2">Tax Details</h2>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={taxType==="CGST_SGST"} onChange={()=>setTaxType("CGST_SGST")} />
            CGST + SGST
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={taxType==="IGST"} onChange={()=>setTaxType("IGST")} />
            IGST
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={taxType==="NO_GST"} onChange={()=>setTaxType("NO_GST")} />
            No GST
          </label>
        </div>

        {taxType === "CGST_SGST" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input className="border p-2" type="number" value={tax.cgst} onChange={e=>setTax({...tax,cgst:+e.target.value})} placeholder="CGST %" />
            <input className="border p-2" type="number" value={tax.sgst} onChange={e=>setTax({...tax,sgst:+e.target.value})} placeholder="SGST %" />
          </div>
        )}

        {taxType === "IGST" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input className="border p-2" type="number" value={tax.igst} onChange={e=>setTax({...tax,igst:+e.target.value})} placeholder="IGST %" />
          </div>
        )}

        <h2 className="font-semibold mb-2">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input className="border p-2" value={invoice.number} onChange={e=>setInvoice({...invoice,number:e.target.value})} placeholder="Invoice Number" />
          <input className="border p-2" type="date" value={invoice.date} onChange={e=>setInvoice({...invoice,date:e.target.value})} />
        </div>

        <table className="w-full border mb-4 text-sm">
          <thead className="bg-gray-100"><tr><th>Item</th><th>HSN</th><th>Rate</th><th>Qty</th><th>Amount</th></tr></thead>
          <tbody>
            {items.map((it,i)=>(
              <tr key={i} className="text-center">
                <td><input className="border p-1" onChange={e=>updateItem(i,'name',e.target.value)} /></td>
                <td><input className="border p-1" onChange={e=>updateItem(i,'hsn',e.target.value)} /></td>
                <td><input className="border p-1" type="number" onChange={e=>updateItem(i,'rate',+e.target.value)} /></td>
                <td><input className="border p-1" type="number" onChange={e=>updateItem(i,'qty',+e.target.value)} /></td>
                <td>{it.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">Add Item</button>

        <div className="flex gap-3 mt-6">
          <button onClick={openPreview} className="bg-green-600 text-white px-6 py-2 rounded">Preview / Print / Download</button>
        </div>
      </div>

      {showCanvasPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl p-4">
            <div className="flex justify-between mb-2">
              <strong>Invoice Preview (A4)</strong>
              <button onClick={()=>setShowCanvasPreview(false)}>✕</button>
            </div>
            <iframe title="preview" style={{width:'100%',height:'80vh'}} srcDoc={invoiceHTML} />
          </div>
        </div>
      )}
    </div>
  );
}
