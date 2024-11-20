import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Menggunakan ekspor bernama

export default function OrderHistory() {
  const [orders, setOrders] = useState([]); // State untuk menyimpan daftar pesanan
  const [expandedOrder, setExpandedOrder] = useState(null); // Menyimpan ID pesanan yang sedang diperluas
  const [loading, setLoading] = useState(true); // Menyimpan status loading
  const [error, setError] = useState(null); // Menyimpan pesan error
  const [kasirId, setKasirId] = useState(null); // Menyimpan kasir_id (ID pengguna)

  // Fungsi untuk mengambil kasir_id dari token JWT
  const fetchKasirIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token); // Menggunakan jwtDecode untuk mendekode token
        setKasirId(decodedToken.id); // Mengasumsikan payload JWT memiliki field 'id'
      } else {
        setError('Token tidak ditemukan.');
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Error saat mendekode token.');
    }
  };

  // Mengambil kasir_id ketika komponen pertama kali dimuat
  useEffect(() => {
    fetchKasirIdFromToken();
  }, []);

  // Mengambil data pesanan berdasarkan kasirId
  useEffect(() => {
    if (!kasirId) return; // Jangan ambil pesanan jika kasirId belum tersedia

    const fetchOrders = async () => {
      setLoading(true);
      setError(null); // Reset status error

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/orders?kasir_id=${kasirId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setOrders(response.data.orders || []); // Menyimpan pesanan ke state
        } else {
          setError(response.data.message || 'Gagal memuat riwayat pesanan.');
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setError('Terjadi kesalahan saat mengambil pesanan. Silakan coba lagi nanti.');
      } finally {
        setLoading(false); // Menyembunyikan loading setelah request selesai
      }
    };

    fetchOrders(); // Mengambil data pesanan setelah kasirId tersedia
  }, [kasirId]); // Re-fetch pesanan jika kasirId berubah

  // Fungsi untuk memperluas detail pesanan
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId); // Menampilkan atau menyembunyikan detail pesanan
  };

  // Fungsi untuk mengelompokkan item berdasarkan waktu transaksi
  const groupItemsByTransactionTime = (order) => {
    // Pastikan order_items ada dan merupakan array yang valid
    if (!order.order_items || !Array.isArray(order.order_items)) {
      return {}; // Kembalikan objek kosong jika order_items tidak ada atau bukan array
    }

    const groupedItems = order.order_items.reduce((acc, item) => {
      // Menggunakan waktu transaksi untuk mengelompokkan item
      const transactionTime = new Date(order.transaction_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      if (!acc[transactionTime]) {
        acc[transactionTime] = [];
      }
      acc[transactionTime].push(item);
      return acc;
    }, {});

    return groupedItems;
  };

  return (
    <div className="container mt-4">
      <h3>Riwayat Pesanan</h3>

      {loading && <p className="text-center">Memuat...</p>}
      {error && <p className="text-center text-danger">{error}</p>} {/* Menampilkan pesan error jika ada */}

      {orders.length > 0 ? (
        orders.map((order) => {
          const groupedItems = groupItemsByTransactionTime(order); // Mengelompokkan item berdasarkan waktu transaksi
          return (
            <div key={order.id} className="border p-3 mb-2">
              <div
                className="d-flex justify-content-between align-items-center"
                onClick={() => toggleOrder(order.id)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <p className="mb-0">
                    {new Date(order.transaction_time).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}, {new Date(order.transaction_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - {order.payment_method}
                  </p>
                  <h5 className="mb-0 text-success">Rp {order.total_price.toLocaleString()}</h5>
                </div>
                <span>{expandedOrder === order.id ? '▲' : '▼'}</span>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-3">
                  {Object.keys(groupedItems).map((timeKey) => (
                    <div key={timeKey}>
                      <h6 className="text-muted">Transaksi Waktu: {timeKey}</h6>
                      {groupedItems[timeKey].map((item) => (
                        <div key={item.id} className="d-flex justify-content-between mb-2">
                          <div>
                            <h6 className="mb-1">{item.product.name}</h6>
                            <p className="mb-0">
                              {item.quantity} x Rp {item.total_price.toLocaleString()}
                            </p>
                          </div>
                          <h6 className="mb-0 text-success">Rp {item.total_price.toLocaleString()}</h6>
                        </div>
                      ))}
                    </div>
                  ))}
                  <button className="btn btn-primary w-100 mt-3">Cetak Struk</button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-center">Riwayat pesanan tidak tersedia.</p>
      )}
    </div>
  );
}
