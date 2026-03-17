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
  const userRes = await fetch(`${getBaseUrl()}/user`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return userRes.json();
};

export const getPlans = async () => {
  const token = await getAccessToken();
  const plansRes = await fetch(`${getBaseUrl()}/plans`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return plansRes.json();
};

export const getMatches = async () => {
  const token = await getAccessToken();
  const matchesRes = await fetch(`${getBaseUrl()}/matches`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return matchesRes.json();
};
