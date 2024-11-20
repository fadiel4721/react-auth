import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateOrderItem } from '../redux/reducer';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Anda belum login!');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:8000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch products.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectProduct = (product, increment) => {
    const currentQuantity = selectedProducts[product.id]?.quantity || 0;
    const updatedQuantity = currentQuantity + increment;

    if (updatedQuantity <= 0) {
      const updatedSelectedProducts = { ...selectedProducts };
      delete updatedSelectedProducts[product.id];
      setSelectedProducts(updatedSelectedProducts);
    } else {
      setSelectedProducts({
        ...selectedProducts,
        [product.id]: {
          ...product,
          quantity: updatedQuantity,
          totalPrice: updatedQuantity * product.price,
        },
      });
    }
  };

  const handleSubmit = () => {
    Object.values(selectedProducts).forEach((product) => {
      dispatch(
        updateOrderItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          image: product.image,
        })
      );
    });
    alert('Produk berhasil ditambahkan ke order items!');
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Daftar Coffe</h2>
      <div className="row">
        {products.map((product) => {
          const quantity = selectedProducts[product.id]?.quantity || 0;
          const isSelected = !!selectedProducts[product.id]; // Periksa apakah produk dipilih

          return (
            <div className="col-md-3" key={product.id}>
              <div
                className={`card mb-4 shadow-sm ${
                  isSelected ? 'selected' : ''
                }`}
              >
                <img
                  src={`http://localhost:8000/storage/products/${product.image}`}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">
                    Kategori: {product.category} <br />
                    Harga: Rp {product.price.toLocaleString()}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSelectProduct(product, -1)}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSelectProduct(product, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-success" onClick={handleSubmit}>
          Masukkan Ke Keranjang
        </button>
      </div>
    </div>
  );
}
