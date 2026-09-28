"use client";

import { AuthUser } from "@/types/auth-user";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;

    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasCheckedInitialSession = useRef(false);

    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                setUser(null);
                return;
            }

            if (!response.ok) {
                throw new Error(`Session check failed: ${response.status}`);
            }

            const data: AuthUser = await response.json();

            setUser(data);
        } catch (error) {
            console.error("Failed to get current user:", error);

            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasCheckedInitialSession.current) {
            return;
        }

        hasCheckedInitialSession.current = true;
        refreshUser();
    }, [refreshUser]);

    const hasRole = useCallback(
        (role: string) => {
            return user?.roles.includes(role) ?? false;
        },
        [user]
    );

    const hasAnyRole = useCallback(
        (roles: string[]) => {
            return roles.some((role) =>
                user?.roles.includes(role)
            );
        },
        [user]
    );

    const logout = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                }
            );

            if (response.ok) {
                setUser(null);
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: user !== null,
                hasRole,
                hasAnyRole,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}