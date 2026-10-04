import { useAuth } from "@/lib/AuthContext";

// Returns the current authenticated user (or null while loading / signed out).
export default function useCurrentUser() {
  const { user } = useAuth();
  return { user };
}
