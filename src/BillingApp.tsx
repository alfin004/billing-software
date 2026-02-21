import React,{useState} from 'react';

export default function BillingApp(){
 const [company,setCompany]=useState({name:'Your Company Name',address:'Company Address',gst:'GSTIN',phone:'Phone'});
 const [items,setItems]=useState([{name:'',hsn:'',rate:0,qty:1,amount:0}]);
 const [tax,setTax]=useState({cgst:0,sgst:0,igst:0});

 const updateItem=(i,f,v)=>{const n=[...items];n[i][f]=v;n[i].amount=n[i].rate*n[i].qty;setItems(n)};
 const addItem=()=>setItems([...items,{name:'',hsn:'',rate:0,qty:1,amount:0}]);

 const sub=items.reduce((s,i)=>s+i.amount,0);
 const total=sub+(sub*tax.cgst)/100+(sub*tax.sgst)/100+(sub*tax.igst)/100;

 const preview=()=>{
  const w=window.open('about:blank','_blank'); if(!w) return alert('Allow popup');
  w.document.write(`<html><body><h2>${company.name}</h2><p>Total ₹${total.toFixed(2)}</p>
  <button onclick="html2pdf().from(document.body).save('invoice.pdf')">PDF</button>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'></script>
  </body></html>`); w.document.close();
 };

 return (
  <div className="bg-gray-100 min-h-screen p-6">
   <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Billing Software</h1>
    <input className="border p-2 mb-3 w-full" value={company.name}
      onChange={e=>setCompany({...company,name:e.target.value})}/>
    <table className="w-full border mb-4 text-sm">
     <thead className="bg-gray-200"><tr><th>Item</th><th>HSN</th><th>Rate</th><th>Qty</th><th>Amount</th></tr></thead>
     <tbody>{items.map((it,i)=>(
      <tr key={i} className="text-center">
       <td><input className="border" onChange={e=>updateItem(i,'name',e.target.value)}/></td>
       <td><input className="border" onChange={e=>updateItem(i,'hsn',e.target.value)}/></td>
       <td><input className="border" type="number" onChange={e=>updateItem(i,'rate',+e.target.value)}/></td>
       <td><input className="border" type="number" onChange={e=>updateItem(i,'qty',+e.target.value)}/></td>
       <td>{it.amount.toFixed(2)}</td>
      </tr>
     ))}</tbody>
    </table>
    <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">Add Item</button>
    <h3 className="text-right font-semibold mt-4">Total ₹{total.toFixed(2)}</h3>
    <button onClick={preview} className="bg-green-600 text-white px-6 py-2 rounded mt-4">Preview / Download</button>
   </div>
  </div>
 )
}
