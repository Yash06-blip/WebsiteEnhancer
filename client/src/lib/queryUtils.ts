type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T,>({ on401 }: { on401: UnauthorizedBehavior }) => 
  async ({ queryKey }: { queryKey: unknown[] }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    
    return await res.json() as T;
  };