import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyAccount.css';
import {

    Box,
    Typography,
    Button,
    CircularProgress
} from "@mui/material";
import APIS from '../../common/hooks/UseApiCalls';
import toast from "react-hot-toast";


const VerifyAccount = () => {

    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const token = searchParams && searchParams?.get("token");
    const [displayMessage, setDisplayMessage] = useState("")
    const navigate = useNavigate()
    // Simulate an API call
    useEffect(() => {
        if (token) {
            verifyTheUser(token)
        }
    }, [token]);

    const verifyTheUser = async (token) => {
        try {
            setLoading(true)
            setDisplayMessage("verifying the account , please wait..." )
            await APIS.reverifyUser(token).then((res) => {
                if (res?.status === 200) {
                    setLoading(false)
                    setDisplayMessage(res?.data?.Message)
                    toast.success(res?.data?.Message);
                    navigate("/signin")
                } else {
                    setLoading(false)
                    toast.error("Something went wrong");
                    setDisplayMessage("Account verification failed....")
                }
            });
        } catch (err) {
            toast.error("Something went wrong");
        }
    };


    return (
        <div className="App">
            <div className="background">
                <div className="content">
                    <div className="logo">
                        <img src="/static/phone.png" alt="Logo" />
                    </div>
                    <Box
                        sx={{
                            mt: -10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '50%',
                            color: 'white',
                            mx: 'auto', // Center the box horizontally
                        }}
                    >
                        <Box
                            sx={{
                                margin: "auto",
                                maxWidth: "300px",
                                mb: 5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <img
                                alt="Miracle Foundation Logo"
                                src="/static/WhiteLogoTW.png"
                                style={{
                                    width: "80%",
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, width: '100%', justifyContent: 'center' }}>
                            <Typography sx={{ color: 'white', textAlign: 'center' }}>
                                {displayMessage}
                            </Typography>
                            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                        </Box>

                        <Button
                            component={Link}
                            to="/signin"
                            variant="contained"
                            fullWidth
                            sx={{ maxWidth: '50%', color: 'white', marginTop: 2 }}
                            disabled={loading} // Disable the button while loading
                        >
                            Sign In
                        </Button>
                    </Box>

                </div>
            </div>
        </div>
    );
}

export default VerifyAccount;
