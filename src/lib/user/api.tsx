"use server";

import { getAccessToken } from ".";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url && url.startsWith("http")) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const getUser = async () => {
  const token = await getAccessToken();
  const userRes = await fetch(`${getBaseUrl()}/api/user`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: {
      tags: ["user", "default-plan", "plans", "matches"],
    },
  });
  return userRes.json();
};

export const getPlans = async () => {
  const token = await getAccessToken();
  const plansRes = await fetch(`${getBaseUrl()}/api/plans`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: {
      tags: ["plans"],
    },
  });
  return plansRes.json();
};

export const setDefaultPlan = async (planId: string) => {
  const token = await getAccessToken();
  const planRes = await fetch(`${getBaseUrl()}/api/user/default-plan`, {
    method: "PATCH",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ defaultPlanId: planId }),
    next: {
      tags: ["default-plan"],
    },
  });
  return planRes.json();
};

export const createPlan = async (name: string, copyFromPlanId?: string) => {
  const token = await getAccessToken();
  const planRes = await fetch(`${getBaseUrl()}/api/plans/create`, {
    method: "POST",
    credentials: "include",
    headers: token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : {},
    body: JSON.stringify({ name, copyFromPlanId }),
    next: {
      tags: ["plans"],
    },
  });

  return planRes.json();
};

export const deletePlan = async (planId: string) => {
  const token = await getAccessToken();
  const planRes = await fetch(`${getBaseUrl()}/api/plans/${planId}`, {
    method: "DELETE",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return planRes.json();
};

export const getMatches = async () => {
  const token = await getAccessToken();
  const matchesRes = await fetch(`${getBaseUrl()}/api/matches`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: {
      tags: ["matches"],
    },
  });
  return matchesRes.json();
};

export const saveMatchToCloud = async (data: {
  matchName: string;
  sportPlanId?: string;
  teamAData: unknown;
  teamBData: unknown;
}) => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/api/matches`, {
    method: "POST",
    credentials: "include",
    headers: token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteCloudMatch = async (id: string) => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/api/matches/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
