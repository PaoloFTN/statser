"use server";

import { getToken } from ".";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url && url.startsWith("http")) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const getUser = async () => {
  const userRes = await fetch(`${getBaseUrl()}/user`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  return userRes.json();
};

export const getPlans = async () => {
  const plansRes = await fetch(`${getBaseUrl()}/plans`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  return plansRes.json();
};

export const getMatches = async () => {
  const matchesRes = await fetch(`${getBaseUrl()}/matches`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return matchesRes.json();
};
