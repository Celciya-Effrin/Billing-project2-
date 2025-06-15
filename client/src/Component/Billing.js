import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Billing() {
  // State for modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Product form fields
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // All products and current bill items
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);

  const navigate = useNavigate();

  // ✅ Submit new product to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', image);
    formData.append('price', price);
    formData.append('quantity', quantity);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/add-product`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("Product added successfully!");
      handleClose();
      setName('');
      setImage(null);
      setPrice('');
      setQuantity('');
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  // ✅ Update bill item quantity
  const updateBillItem = (product, delta) => {
    setBillItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        const updatedQty = existing.quantity + delta;
        if (updatedQty <= 0) {
          return prev.filter(item => item._id !== product._id);
        }
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: updatedQty } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // ✅ Finish bill and update backend
  const handleFinish = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/update-quantities`, {
        items: billItems.map(({ _id, quantity }) => ({ _id, quantity }))
      });
      alert("Bill submitted!");
      setBillItems([]);
      fetchProducts();
    } catch (err) {
      alert("Failed to update products.");
    }
  };

  // ✅ Fetch products from backend
  const fetchProducts = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/products`);
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Print function
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const tableRows = billItems.map(item => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px;">${item.name}</td>
        <td style="border: 1px solid #000; padding: 8px;">₹${item.price}</td>
        <td style="border: 1px solid #000; padding: 8px;">${item.quantity}</td>
      </tr>
    `).join('');

    const total = billItems.reduce((total, item) => total + item.price * item.quantity, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Current Bill</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #000; padding: 8px; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Current Bill</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Price</th><th>Quantity</th></tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <p style="margin-top: 20px; font-weight: bold;">Total: ₹${total}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ✅ Component return
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="bg-blue-600 text-white text-center py-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold tracking-wide">Billing System</h1>
      </header>

      {/* Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}
          sx={{ fontSize: '1rem', padding: '0.75rem 2rem', backgroundColor: '#1d4ed8', '&:hover': { backgroundColor: '#2563eb' }, borderRadius: '9999px' }}>
          Add Product
        </Button>
        <Button variant="contained" onClick={() => navigate("/login")}
          sx={{ fontSize: '1rem', padding: '0.75rem 2rem', backgroundColor: '#1d4ed8', '&:hover': { backgroundColor: '#2563eb' }, borderRadius: '9999px' }}>
          View All Product
        </Button>
      </div>

      {/* Modal for Add Product */}
      <Modal open={open} onClose={handleClose}>
        <Box component="form" onSubmit={handleSubmit}
          className="absolute top-1/2 left-1/2 bg-white p-6 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Add Product</h2>
          <div className="space-y-4">
            <TextField fullWidth label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="file" accept="*/*" onChange={(e) => setImage(e.target.files[0])} required />
            <TextField fullWidth label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <TextField fullWidth label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Submit</Button>
          </div>
        </Box>
      </Modal>

      {/* Main Layout: Bill + Product Table */}
      <div className="mt-10 flex flex-col md:flex-row gap-6">
        {/* Left - Bill Summary */}
        <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit">
          <h3 className="text-2xl font-bold text-blue-700 mb-4 border-b pb-2">Current Bill</h3>
          {billItems.length === 0 ? (
            <p className="text-gray-500 italic">No items added</p>
          ) : (
            <>
              <ul className="space-y-3">
                {billItems.map(item => (
                  <li key={item._id} className="flex justify-between text-gray-800">
                    <span className="font-medium">{item.name} <span className="text-sm text-gray-500">(x{item.quantity})</span></span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-6 border-t pt-4 text-lg font-bold text-blue-800">
                <span>Total:</span>
                <span>₹{billItems.reduce((total, item) => total + item.price * item.quantity, 0)}</span>
              </div>
              <Button variant="contained" color="primary" fullWidth onClick={() => { handleFinish(); handlePrint(); }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                PRINT
              </Button>
            </>
          )}
        </div>

        {/* Right - Product Table */}
        <div className="md:w-2/3 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
          <h3 className="text-2xl font-bold text-blue-700 mb-4 border-b pb-2">Available Products</h3>
          <Table>
            <TableHead className="bg-blue-50">
              <TableRow>
                <TableCell className="font-bold text-blue-800">Name</TableCell>
                <TableCell className="font-bold text-blue-800">Image</TableCell>
                <TableCell className="font-bold text-blue-800">Price</TableCell>
                <TableCell className="font-bold text-blue-800">Quantity</TableCell>
                <TableCell className="font-bold text-blue-800">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(prod => (
                <TableRow key={prod._id}>
                  <TableCell>{prod.name}</TableCell>
                  <TableCell><img src={`${process.env.REACT_APP_BACKEND_URL}/${prod.image}`} alt={prod.name} width="40" className="rounded shadow-sm border" /></TableCell>
                  <TableCell>₹{prod.price}</TableCell>
                  <TableCell>{prod.quantity}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="contained" size="small" onClick={() => updateBillItem(prod, 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1">+</Button>
                      <Button variant="contained" size="small" onClick={() => updateBillItem(prod, -1)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1">-</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Billing;
