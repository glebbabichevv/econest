import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  schoolId?: number;
  classId?: number;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => fetch('/api/auth/logout', { method: 'GET' }),
    onMutate: () => {
      setIsTransitioning(true);
    },
    onSuccess: () => {
      // Reset spooky theme to dark theme when logging out  
      const currentTheme = localStorage.getItem("econest-theme");
      if (currentTheme === "spooky") {
        localStorage.setItem("econest-theme", "dark");
        document.documentElement.classList.remove("spooky");
        document.documentElement.classList.add("dark");
      }
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      
      // Quick redirect to auth page
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isTransitioning: isTransitioning || logoutMutation.isPending,
    setIsTransitioning,
  };
}
