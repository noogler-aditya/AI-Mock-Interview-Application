import { QueryClient, QueryFunction, DefaultOptions } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error = new Error() as ApiError;
    error.status = res.status;
    error.statusText = res.statusText;
    
    try {
      const data = await res.json();
      error.message = data.error || `${res.status}: ${res.statusText}`;
    } catch {
      error.message = `${res.status}: ${res.statusText}`;
    }
    
    throw error;
  }
}

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

interface RequestOptions {
  skipErrorToast?: boolean;
}

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json"
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    const apiError = error as ApiError;
    if (!options.skipErrorToast) {
      toast({
        title: "API Error",
        description: apiError.message || "An error occurred while making the request",
        variant: "destructive",
      });
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const url = queryKey[0] as string;
    const apiUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    
    try {
      const res = await fetch(apiUrl, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        },
        signal, // Support for query cancellation
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error; // Let React Query handle cancellation
      }

      const apiError = error as ApiError;
      if (apiError.status !== 401 || unauthorizedBehavior === "throw") {
        toast({
          title: "API Error",
          description: apiError.message || "An error occurred while fetching data",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

const queryConfig: DefaultOptions = {
  queries: {
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      // Don't retry on specific error codes
      if (apiError.status && [401, 403, 404, 422].includes(apiError.status)) {
        return false;
      }
      return failureCount < 3;
    },
    // Enable request deduplication
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  mutations: {
    retry: false,
    // Add optimistic update settings
    onMutate: async (variables) => {
      // Return context for rollback
      return { variables };
    },
    onError: (err, variables, context) => {
      if (context) {
        // Log rollback errors but don't show to user
        console.error('Mutation rollback failed:', err);
      }
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache persists for 10 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});
