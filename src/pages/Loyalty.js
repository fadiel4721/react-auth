import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function LoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState(null); // Data loyalitas
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [userName, setUserName] = useState(""); // Nama pengguna
  const [userId, setUserId] = useState(null); // ID pengguna
  const [discountCode, setDiscountCode] = useState(null); // Kode diskon
  const [levelUp, setLevelUp] = useState(false); // Deteksi apakah naik level

  // Fungsi untuk mendapatkan data pengguna dari token
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token); // Decode token untuk mendapatkan data pengguna
        setUserName(decodedToken.name); // Set nama pengguna
        setUserId(decodedToken.id); // Set ID pengguna
        console.log("Decoded Token:", decodedToken); // Debugging
      } else {
        setError("Token tidak ditemukan.");
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Error decoding token.");
    }
  };

  // Fungsi untuk mendapatkan data loyalitas berdasarkan ID pengguna
  const fetchLoyaltyData = async () => {
    try {
      if (!userId) return; // Jangan panggil API jika userId belum tersedia

      const response = await axios.get(
        `http://localhost:8000/api/loyalty/show`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newLoyaltyData = response.data.data;
      setLoyaltyData(newLoyaltyData); // Ambil data loyalitas

      console.log("Loyalty Data:", newLoyaltyData); // Debugging

      // Deteksi apakah level naik
      if (newLoyaltyData.level > (loyaltyData?.level || 0)) {
        setLevelUp(true); // Menandakan pengguna naik level
      }

      // Ambil kode diskon dari database
      setDiscountCode(newLoyaltyData.discount_code); // Set kode diskon dari database
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghasilkan kode diskon acak jika belum ada
  const generateDiscountCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan.");
      return;
    }

    // Decode token untuk mendapatkan user ID
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id; // Ambil userId dari token

    const newDiscountCode =
      "DISCOUNT-" + Math.random().toString(36).substr(2, 8).toUpperCase();

    try {
      console.log(
        "Mengirim kode diskon:",
        newDiscountCode,
        "untuk userId:",
        userId
      ); // Debugging

      const response = await axios.post(
        "http://localhost:8000/api/loyalty/discount-code",
        { discount_code: newDiscountCode, user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Kode diskon berhasil disimpan:", response.data);

      // Cek apakah response berhasil
      if (response.status === 200) {
        setDiscountCode(newDiscountCode); // Update state dengan kode diskon baru
        fetchLoyaltyData(); // Ambil data loyalitas terbaru setelah penyimpanan kode diskon
      } else {
        setError("Gagal menyimpan kode diskon.");
      }
    } catch (err) {
      console.error(
        "Error menyimpan kode diskon:",
        err.response?.data || err.message
      );
      setError("Gagal menyimpan kode diskon.");
    }
  };

  // Ambil data pengguna saat komponen dimuat
  useEffect(() => {
    fetchUserData();
    if (!localStorage.getItem("level")) {
      localStorage.setItem("level", "0"); // Inisialisasi level ke 0 jika belum ada
    }
  }, []);

  // Ambil data loyalitas dan kode diskon saat userId tersedia
  useEffect(() => {
    if (userId) {
      fetchLoyaltyData();
    }
  }, [userId]);

  // Cek apakah pengguna baru saja naik level
  useEffect(() => {
    if (loyaltyData) {
      const storedLevel = parseInt(localStorage.getItem("level") || "0");
      if (loyaltyData.level > storedLevel) {
        console.log("Level naik, menghasilkan kode diskon baru.");
        generateDiscountCode();
        localStorage.setItem("level", loyaltyData.level); // Simpan level ke localStorage
      }
    }
  }, [loyaltyData]); // Memantau setiap perubahan data loyalitas

  // State loading
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // State error
  if (error) {
    return <div className="text-center text-danger mt-5">{error}</div>;
  }

  // Destrukturisasi data loyalitas
  const { total_spent = 0, level = 0, discount = 0 } = loyaltyData || {};

  // Konfigurasi level loyalitas
  const levels = [
    { level: 0, minSpent: 0, discount: 0 },
    { level: 1, minSpent: 100000, discount: 0 },
    { level: 2, minSpent: 500000, discount: 15 },
    { level: 3, minSpent: 1000000, discount: 20 },
    { level: 4, minSpent: 2000000, discount: 25 },
    { level: 5, minSpent: 2500000, discount: 30 },
  ];

  // Hitung progress ke level berikutnya
  const currentLevel = levels.find((l) => l.level === level);
  const nextLevel = levels.find((l) => l.level === level + 1);

  const progressToNextLevel = nextLevel
    ? ((total_spent - currentLevel.minSpent) /
        (nextLevel.minSpent - currentLevel.minSpent)) *
      100
    : 100;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Loyalty Level</h2>
      <div className="card shadow-sm p-4 mb-4">
        <div className="text-center">
          <h3>Level {level}</h3>
          <p>
            Nama Pengguna: <strong>{userName}</strong>
          </p>
          <p>Total Belanja: {total_spent.toLocaleString()} rupiah</p>
          <p>Diskon: {discount}%</p>
          {discountCode ? (
            <div className="alert alert-success mt-3">
              <strong>Kode Diskon Anda:</strong> {discountCode}
            </div>
          ) : (
            <div className="alert alert-info mt-3">
              Anda telah mencapai level {level}, namun masih harus naik level 2
              ya untuk mendapatkan diskon.
            </div>
          )}
        </div>
      </div>
      {nextLevel && (
        <div className="mt-4">
          <p>Progress menuju level {nextLevel.level}:</p>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${progressToNextLevel}%` }}
              aria-valuenow={progressToNextLevel}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {Math.round(progressToNextLevel)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
