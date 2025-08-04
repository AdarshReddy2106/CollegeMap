import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isPaid, setIsPaid] = useState(null);


    const checkPaymentStatus = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/institutes/check_balance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            if (response.status === 403) {
                setIsPaid(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Failed to fetch balance: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            if (typeof data.balance === "number" && data.balance > 0) {
                setIsPaid(true);
            } else {
                setIsPaid(false);
            }
        } catch (error) {
            setIsPaid(false);
        }
    }, []);


    useEffect(() => {
        const savedSession = localStorage.getItem("userSession");
        if (savedSession) {
            setUser(JSON.parse(savedSession));
            checkPaymentStatus();
        }
    }, [checkPaymentStatus]);

    const login = (userData) => {
        localStorage.setItem("userSession", JSON.stringify(userData));
        localStorage.setItem("authToken", userData.token);
        setUser(userData);
        checkPaymentStatus();
    };

    const logout = () => {
        localStorage.removeItem("userSession");
        localStorage.removeItem("authToken");
        setUser(null);
        setIsPaid(null);
    };

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isPaid, login, logout, checkPaymentStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);