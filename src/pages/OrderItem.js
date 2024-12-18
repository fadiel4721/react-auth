import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateOrderItem, removeOrderItem, resetOrder, selectOrderItems, selectTotalPrice } from '../redux/reducer';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function OrderItem() {
  const orderItems = useSelector(selectOrderItems);
  const totalPrice = useSelector(selectTotalPrice);
  const dispatch = useDispatch();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('CASH');
  const [discountCode, setDiscountCode] = React.useState('');
  const [finalPrice, setFinalPrice] = React.useState(totalPrice);
  const [kasirId, setKasirId] = React.useState(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);

  // Hooks for initial data and token processing
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setKasirId(decodedToken.id);
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('Token tidak valid');
      }
    }
  }, []);

  // Update final price with discount
  React.useEffect(() => {
    const discountPrice = (totalPrice * discountAmount) / 100;
    setFinalPrice(totalPrice - discountPrice);
  }, [discountAmount, totalPrice]);

  // Validate discount code
  const validateDiscountCode = async () => {
    if (!discountCode) {
      alert('Silakan masukkan kode diskon.');
      return;
    }

    if (!kasirId) {
      alert('ID kasir tidak ditemukan. Pastikan Anda sudah login.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/loyalty/show`, {
        params: { discount_code: discountCode, user_id: kasirId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Assuming response.data.discount_percentage is the discount percentage
        const discountPercentage = response.data.discount_percentage || 0;
        setDiscountAmount(discountPercentage);
        alert('Kode diskon berhasil divalidasi!');
      } else {
        alert(response.data.message || 'Kode diskon tidak valid.');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      alert('Terjadi kesalahan saat memvalidasi kode diskon.');
    }
  };

  // Handle product quantity increase
  const handleIncrease = (productId) => {
    const updatedQuantity = (orderItems[productId]?.quantity || 0) + 1;
    dispatch(
      updateOrderItem({
        productId: parseInt(productId, 10),
        name: orderItems[productId].name,
        price: orderItems[productId].price,
        quantity: updatedQuantity,
        image: orderItems[productId].image,
      })
    );
  };

  // Handle product quantity decrease
  const handleDecrease = (productId) => {
    const updatedQuantity = (orderItems[productId]?.quantity || 0) - 1;
    if (updatedQuantity > 0) {
      dispatch(
        updateOrderItem({
          productId: parseInt(productId, 10),
          name: orderItems[productId].name,
          price: orderItems[productId].price,
          quantity: updatedQuantity,
          image: orderItems[productId].image,
        })
      );
    } else {
      dispatch(removeOrderItem({ productId: parseInt(productId, 10) }));
    }
  };

  // Handle order processing
  const handleProcessOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token || !kasirId) return alert('Anda belum login atau ID kasir tidak ditemukan!');

    const payload = {
      transaction_time: new Date().toISOString(),
      kasir_id: kasirId,
      total_price: finalPrice,
      total_item: Object.keys(orderItems).reduce(
        (sum, productId) => sum + orderItems[productId].quantity,
        0
      ),
      payment_method: selectedPaymentMethod,
      discount_code: discountCode || null,
      order_items: Object.keys(orderItems).map((productId) => ({
        product_id: parseInt(productId, 10),
        quantity: orderItems[productId].quantity,
        total_price: orderItems[productId].price * orderItems[productId].quantity,
      })),
    };

    try {
      const response = await axios.post('http://localhost:8000/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert('Order berhasil diproses!');
        dispatch(resetOrder());
        localStorage.removeItem('orderItems');
        setDiscountCode('');
        setFinalPrice(0);
        setDiscountAmount(0);
        setSelectedPaymentMethod('CASH');
      } else {
        alert('Order gagal diproses.');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Kode Discount Telah Digunakan!');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Detail Pesanan</h2>

      <div className="mb-4">
        <h4>Produk dalam Pesanan</h4>
        {Object.keys(orderItems).length > 0 ? (
          Object.keys(orderItems).map((productId) => {
            const item = orderItems[productId];
            return (
              <div className="d-flex align-items-center justify-content-between border p-3 mb-2" key={productId}>
                <div className="d-flex align-items-center">
                  <img
                    src={`http://localhost:8000/storage/products/${item.image}`}
                    alt={item.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      marginRight: '10px',
                    }}
                  />
                  <div>
                    <h5 className="mb-1">{item.name}</h5>
                    <p className="mb-0">Rp {item.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-primary mx-1"
                    onClick={() => handleDecrease(productId)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn btn-sm btn-primary mx-1"
                    onClick={() => handleIncrease(productId)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-sm btn-danger mx-2"
                    onClick={() => dispatch(removeOrderItem({ productId: parseInt(productId, 10) }))}
                  >
                    &times;
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>Pesanan kosong.</p>
        )}
      </div>

      <div className="mb-4">
        <h4>Pengaturan Diskon</h4>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Masukkan kode diskon"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
        <button className="btn btn-info" onClick={validateDiscountCode}>
          Validasi Diskon
        </button>
      </div>

      <div className="mb-4">
        <h4>Pilih Metode Pembayaran</h4>
        <div className="d-flex">
          {['CASH', 'TRANSFER', 'OVO'].map((method) => (
            <button
              key={method}
              className={`btn mx-1 ${selectedPaymentMethod === method ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4>Ringkasan Harga</h4>
        <p>Subtotal: Rp {totalPrice.toLocaleString()}</p>
        <p>Diskon: {discountAmount}%</p>
        <h4>Total Harga: Rp {finalPrice.toLocaleString()}</h4>
      </div>

      <button className="btn btn-success w-100 mt-3" onClick={handleProcessOrder}>
        Proses Pesanan
      </button>
    </div>
  );
}
