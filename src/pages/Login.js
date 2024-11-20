// import hook react
import React, { useState, useEffect } from 'react';

// import hook useNavigate from react router dom
import { useNavigate, Link } from 'react-router-dom';

// import axios
import axios from 'axios';

function Login() {

    // define state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // define state validation
    const [validation, setValidation] = useState([]);

    // define navigate
    const navigate = useNavigate();

    // hook useEffect
    useEffect(() => {
        // check token
        if (localStorage.getItem('token')) {
            // redirect page home
            navigate('/home');
        }
    }, [navigate]);

    // function "loginHandler"
    const loginHandler = async (e) => {
        e.preventDefault();
        
        // initialize formData
        const formData = new FormData();

        // append data to formData
        formData.append('email', email);
        formData.append('password', password);

        // send data to server
        await axios.post('http://localhost:8000/api/login', formData)
        .then((response) => {
            // set token on localStorage
            localStorage.setItem('token', response.data.token);

            // redirect to home
            navigate('/home');
        })
        .catch((error) => {
            // assign error to state "validation"
            setValidation(error.response.data);
        });
    };

    return (
        <div className="container" style={{ marginTop: "120px" }}>
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card border-0 rounded shadow-sm" style={{ backgroundColor: "#4e73df", color: "#fff" }}>
                        <div className="card-body">
                            <h4 className="fw-bold text-white">LOGIN</h4>
                            <hr />
                            {
                                validation.message && (
                                    <div className="alert alert-danger">
                                        {validation.message}
                                    </div>
                                )
                            }
                            <form onSubmit={loginHandler}>
                                <div className="mb-3">
                                    <label className="form-label text-white">ALAMAT EMAIL</label>
                                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan Alamat Email" />
                                </div>
                                {
                                    validation.email && (
                                        <div className="alert alert-danger">
                                            {validation.email[0]}
                                        </div>
                                    )
                                }
                                <div className="mb-3">
                                    <label className="form-label text-white">PASSWORD</label>
                                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan Password" />
                                </div>
                                {
                                    validation.password && (
                                        <div className="alert alert-danger">
                                            {validation.password[0]}
                                        </div>
                                    )
                                }
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#007bff", borderColor: "#007bff" }}>LOGIN</button>
                                </div>
                            </form>
                            <hr />
                            <div className="text-center">
                                <span className="text-white">Belum punya akun? </span>
                                <Link to="/register" className="btn btn-link p-0 text-white">Daftar Sekarang</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
