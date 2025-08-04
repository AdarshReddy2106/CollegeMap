import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requirePayment = true }) => {
    const { isLoggedIn, isPaid, checkPaymentStatus } = useAuth();
    const [checkingPayment, setCheckingPayment] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            if (requirePayment && isPaid === null) {
                await checkPaymentStatus();
            }
            setCheckingPayment(false);
        };
        fetchStatus();
    }, [requirePayment, isPaid, checkPaymentStatus]);

    if (!isLoggedIn) {
        return <Navigate to="/MobileLogin" />;
    }

    if (checkingPayment) {
        return <p>Checking access...</p>;
    }

    if (requirePayment && !isPaid) {
        return <Navigate to="/ResultsPage" />;
    }

    return children;
};

export default ProtectedRoute;
