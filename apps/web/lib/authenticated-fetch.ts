const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

type AuthenticatedFetchResult = {
  response: Response;
  accessToken: string;
  refreshed: boolean;
};

export async function authenticatedFetch(
  path: string,
  accessToken?: string,
  refreshToken?: string,
  init: RequestInit = {},
): Promise<AuthenticatedFetchResult> {
  const makeRequest = (token: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

  let response: Response | null = accessToken
    ? await makeRequest(accessToken)
    : null;

  if (response && response.status !== 401) {
    return {
      response,
      accessToken: accessToken ?? '',
      refreshed: false,
    };
  }

  if (!refreshToken) {
    return {
      response:
        response ??
        new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication required.',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      accessToken: accessToken ?? '',
      refreshed: false,
    };
  }

  const refreshResponse = await fetch(
    `${API_URL}/api/v1/auth/refresh`,
    {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!refreshResponse.ok) {
    return {
      response:
        response ??
        new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication required.',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      accessToken: accessToken ?? '',
      refreshed: false,
    };
  }

  const refreshData = await refreshResponse.json();
  const newAccessToken = refreshData?.data?.accessToken;

  if (!newAccessToken) {
    return {
      response: response ?? new Response(null, { status: 401 }),
      accessToken: accessToken ?? "",
      refreshed: false,
    };
  }

  response = await makeRequest(newAccessToken);

  return {
    response,
    accessToken: newAccessToken,
    refreshed: true,
  };
}
