import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Gunakan impor yang benar berdasarkan versi jwt-decode
import { jwtDecode } from 'jwt-decode'; // Untuk versi baru
// import jwtDecode from 'jwt-decode'; // Untuk versi lama

function Dashboard() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const decodeTokenAndFetchUser = () => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
                setUserId(decodedToken.id);
                setLoading(false);
            } catch (error) {
                setError('Token tidak valid, silakan login kembali.');
                setLoading(false);
            }
        } else {
            navigate('/login');
        }
    };

    useEffect(() => {
        decodeTokenAndFetchUser();
    }, [navigate, token]);

    if (loading) {
        return (
            <div className="text-center">
                <FontAwesomeIcon icon="spinner" spin size="3x" /> {/* Spinner Icon */}
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="container" style={{ marginTop: '80px' }}>
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <div className="card border-0 rounded shadow-sm">
                            <div className="card-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                <h4>
                                    <FontAwesomeIcon icon="user-circle" className="me-2" />
                                    SELAMAT DATANG{' '}
                                    <strong className="text-uppercase">{user.name}</strong>
                                </h4>
                                <p>
                                    <FontAwesomeIcon icon="id-badge" className="me-2" />
                                    ID Pengguna Anda: {userId}
                                </p>
                                <hr />
                                <p className="lead">
                                    <FontAwesomeIcon icon="tachometer-alt" className="me-2" />
                                    Welcome to Warkop FM
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
