import React, { useState } from "react";

export default function BillingApp() {
  /* ================= SELLER ================= */
  const [seller, setSeller] = useState({
    name: "",
    address: "",
    phone: "",
    gst: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: ""
  });

  /* ================= BUYER ================= */
  const [buyer, setBuyer] = useState({
    name: "",
    address: "",
    gst: "",
    state: "",
    stateCode: "",
    placeOfSupply: ""
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
  const updateItem = (i: number, field: string, value: any) => {
    const copy = [...items];
    copy[i][field] = value;
    copy[i].amount = copy[i].rate * copy[i].qty;
    setItems(copy);
  };

  const addItem = () =>
    setItems([...items, { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }]);

  const subTotal = items.reduce((s, i) => s + i.amount, 0);
  const cgstAmt = taxType === "CGST_SGST" ? (subTotal * tax.cgst) / 100 : 0;
  const sgstAmt = taxType === "CGST_SGST" ? (subTotal * tax.sgst) / 100 : 0;
  const igstAmt = taxType === "IGST" ? (subTotal * tax.igst) / 100 : 0;
  const total = subTotal + cgstAmt + sgstAmt + igstAmt;

  /* ================= AMOUNT IN WORDS ================= */
  const numberToWords = (num: number) => {
    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
      "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const w = (n:number):string => {
      if(n<20) return a[n];
      if(n<100) return b[Math.floor(n/10)] + (n%10?" "+a[n%10]:"");
      if(n<1000) return a[Math.floor(n/100)]+" Hundred"+(n%100?" "+w(n%100):"");
      if(n<100000) return w(Math.floor(n/1000))+" Thousand"+(n%1000?" "+w(n%1000):"");
      if(n<10000000) return w(Math.floor(n/100000))+" Lakh"+(n%100000?" "+w(n%100000):"");
      return w(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+w(n%10000000):"");
    };
    return `Rupees ${w(Math.floor(num))} Only`;
  };

  /* ================= PREVIEW ================= */
  const openPreview = () => {
    const w = window.open("about:blank", "_blank");
    if (!w) return;

    w.document.write(`
      <html><head><title>Tax Invoice</title>
      <style>
        body{font-family:Arial;font-size:12px;padding:20px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #000;padding:4px}
        .page{width:210mm;min-height:297mm;border:1px solid #000;padding:10px;margin:auto}
        .center{text-align:center}
        .right{text-align:right}
      </style>
      </head><body>
      <div class="page">
        <div class="center">
          <b>${seller.name}</b><br/>
          ${seller.address}<br/>
          GSTIN: ${seller.gst}<br/>
          <b>TAX INVOICE</b>
        </div>
        <hr/>
        <b>Bill To:</b><br/>
        ${buyer.name}<br/>${buyer.address}<br/>GSTIN: ${buyer.gst}
        <br/><br/>
        <table>
          <tr><th>Item</th><th>HSN</th><th>Rate</th><th>Qty</th><th>Amount</th></tr>
          ${items.map(i=>`
            <tr>
              <td>${i.name}</td><td>${i.hsn}</td>
              <td>${i.rate}</td><td>${i.qty}</td>
              <td>${i.amount.toFixed(2)}</td>
            </tr>`).join("")}
        </table>
        <p class="right"><b>Total: ₹${total.toFixed(2)}</b></p>
        <p><b>Amount in Words:</b> ${numberToWords(total)}</p>
      </div>
      </body></html>
    `);
    w.document.close();
  };

  /* ================= UI ================= */
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Billing Software</h1>

        {/* COMPANY */}
        <h2 className="font-semibold">Company Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input placeholder="Company Name" className="border p-2" onChange={e=>setSeller({...seller,name:e.target.value})}/>
          <input placeholder="GSTIN" className="border p-2" onChange={e=>setSeller({...seller,gst:e.target.value})}/>
          <input placeholder="Address" className="border p-2" onChange={e=>setSeller({...seller,address:e.target.value})}/>
          <input placeholder="Phone" className="border p-2" onChange={e=>setSeller({...seller,phone:e.target.value})}/>
        </div>

        {/* BUYER */}
        <h2 className="font-semibold">Buyer Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input placeholder="Buyer Name" className="border p-2" onChange={e=>setBuyer({...buyer,name:e.target.value})}/>
          <input placeholder="Buyer GSTIN" className="border p-2" onChange={e=>setBuyer({...buyer,gst:e.target.value})}/>
          <input placeholder="Buyer Address" className="border p-2" onChange={e=>setBuyer({...buyer,address:e.target.value})}/>
          <input placeholder="Place of Supply" className="border p-2" onChange={e=>setBuyer({...buyer,placeOfSupply:e.target.value})}/>
        </div>

        {/* ITEMS */}
        <h2 className="font-semibold">Items</h2>
        <table className="w-full border mb-4">
          <thead className="bg-gray-100">
            <tr><th>Item</th><th>HSN</th><th>Rate</th><th>Qty</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {items.map((it,i)=>(
              <tr key={i}>
                <td><input className="border p-1" onChange={e=>updateItem(i,"name",e.target.value)}/></td>
                <td><input className="border p-1" onChange={e=>updateItem(i,"hsn",e.target.value)}/></td>
                <td><input type="number" className="border p-1" onChange={e=>updateItem(i,"rate",+e.target.value)}/></td>
                <td><input type="number" className="border p-1" onChange={e=>updateItem(i,"qty",+e.target.value)}/></td>
                <td>{it.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Item
        </button>

        <div className="mt-6">
          <button onClick={openPreview} className="bg-green-600 text-white px-6 py-2 rounded">
            Preview / Print / Download
          </button>
        </div>
      </div>
    </div>
  );
}