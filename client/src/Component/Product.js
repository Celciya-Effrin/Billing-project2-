import { useState, useEffect } from 'react';
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import { Edit, Delete } from "@mui/icons-material";
import axios from 'axios';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null); // Product currently being edited

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Get all products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // Delete a product by ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/products/${id}`);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Open edit dialog with selected product
  const handleEditOpen = (product) => {
    setEditProduct(product);
  };

  // Close edit dialog and blur focus to avoid aria-hidden warning
const handleEditClose = () => {
  // Step 1: Blur the currently focused element
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Step 2: Explicitly move focus to body (or some other safe place)
  document.body.focus();

  // Step 3: Set editProduct to null
  setEditProduct(null);
};


  // Handle input changes in the edit dialog
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated product details
  const handleEditSubmit = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/products/${editProduct._id}`, editProduct);
      fetchProducts();        // Refresh product list
      handleEditClose();      // Close dialog (already safely handled)
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Header */}
      <header className="bg-blue-600 text-white text-center py-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold tracking-wide">View All Products</h1>
      </header>

      {/* Product Table Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow-lg overflow-auto">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Product List</h2>
        <Table>
          <TableHead className="bg-blue-50">
            <TableRow>
              <TableCell className="font-bold text-blue-800">Name</TableCell>
              <TableCell className="font-bold text-blue-800">Image</TableCell>
              <TableCell className="font-bold text-blue-800">Price</TableCell>
              <TableCell className="font-bold text-blue-800">Quantity</TableCell>
              <TableCell className="font-bold text-blue-800">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} className="hover:bg-gray-50">
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}/${product.image}`}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded border"
                  />
                </TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <IconButton color="primary" onClick={() => handleEditOpen(product)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product._id)}>
                      <Delete />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onClose={handleEditClose}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent className="space-y-4">
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={editProduct?.name || ""}
            onChange={handleEditChange}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={editProduct?.price || ""}
            onChange={handleEditChange}
          />
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={editProduct?.quantity || ""}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="inherit">Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Product;
