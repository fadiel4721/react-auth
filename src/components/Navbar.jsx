import ThemeSwitcher from "./ThemeSwitcher"; 
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Sesuai dengan implementasi Anda

export default function Navbar() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const decodeTokenAndFetchUser = useCallback(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
            } catch (error) {
                setError("Token tidak valid, silakan login kembali.");
            } finally {
                setLoading(false);
            }
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        decodeTokenAndFetchUser();
    }, [decodeTokenAndFetchUser]);

    const logoutHandler = async () => {
        try {
            await axios.post('http://localhost:8000/api/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            localStorage.removeItem("token");
            delete axios.defaults.headers.common['Authorization'];
            navigate('/login');
        } catch (error) {
            setError("Gagal logout, coba lagi.");
        }
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

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#6f4f1f' }}>
            <div className="container-fluid">
                <Link className="navbar-brand" to="/home">
                    <img
                        src="images/logo4.png" // Referencing logo from public folder
                        alt="Logo"
                        style={{ width: '40px', height: '40px', marginRight: '10px' }}
                    />
                    Warkop FM
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active" to="/products">Coffe</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/order-item">Order Item</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/orders">Order</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/loyalty">Loyalti</Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        <ThemeSwitcher />
                        <button onClick={logoutHandler} className="btn btn-outline-light ms-3">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
