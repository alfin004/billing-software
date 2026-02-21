import React, { useState } from "react";

type Item = {
  name: string;
  hsn: string;
  rate: number;
  qty: number;
  amount: number;
};

export default function BillingApp() {
  const [company, setCompany] = useState({
    name: "Your Company Name",
    address: "Company Address",
    gst: "GSTIN",
    phone: "Phone Number"
  });

  const [items, setItems] = useState<Item[]>([
    { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }
  ]);

  const [tax, setTax] = useState({ cgst: 0, sgst: 0, igst: 0 });

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    newItems[index].amount = newItems[index].rate * newItems[index].qty;
    setItems(newItems);
  };

  const addItem = () =>
    setItems([...items, { name: "", hsn: "", rate: 0, qty: 1, amount: 0 }]);

  const subTotal = items.reduce((sum, i) => sum + i.amount, 0);
  const cgstAmt = (subTotal * tax.cgst) / 100;
  const sgstAmt = (subTotal * tax.sgst) / 100;
  const igstAmt = (subTotal * tax.igst) / 100;
  const total = subTotal + cgstAmt + sgstAmt + igstAmt;

  const openPreview = () => {
    const w = window.open("about:blank", "_blank");
    if (!w) return alert("Allow popups");

    w.document.write(`
      <html>
      <head>
        <title>Invoice</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      </head>
      <body>
        <h2>${company.name}</h2>
        <p>Total: ₹${total.toFixed(2)}</p>
        <button onclick="html2pdf().from(document.body).save('invoice.pdf')">Download PDF</button>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Billing Software</h1>

      <input
        placeholder="Company Name"
        value={company.name}
        onChange={e => setCompany({ ...company, name: e.target.value })}
      />

      {items.map((item, i) => (
        <div key={i}>
          <input onChange={e => updateItem(i, "name", e.target.value)} />
          <input onChange={e => updateItem(i, "hsn", e.target.value)} />
          <input type="number" onChange={e => updateItem(i, "rate", +e.target.value)} />
          <input type="number" onChange={e => updateItem(i, "qty", +e.target.value)} />
          <span>{item.amount}</span>
        </div>
      ))}

      <button onClick={addItem}>Add Item</button>

      <h3>Total: ₹{total.toFixed(2)}</h3>
      <button onClick={openPreview}>Preview / Download</button>
    </div>
  );
}
