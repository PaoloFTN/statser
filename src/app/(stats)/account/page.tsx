import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";
import { getUser } from "@/lib/user";
import {
  createPlan,
  deletePlan,
  getPlans,
  setDefaultPlan,
} from "@/lib/user/api";
import defaultPlansJSON from "@/lib/default-plans.json";
import { SportPlan } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";

export type CreatePlanParams = {
  name: string;
  copyFromPlanId?: string;
};

export default async function AccountPage() {
  const [defaultPlans, user] = await Promise.all([getPlans(), getUser()]);
  if (!user) redirect("/login?redirectTo=/account");

  const plans = [
    ...defaultPlans,
    ...defaultPlansJSON,
  ] as unknown as SportPlan[];

  const handleCreatePlan = async (name: string, copyFromPlanId?: string) => {
    "use server";
    const newPlan = await createPlan(name, copyFromPlanId);
    updateTag("plans");
    return newPlan;
  };

  const handleDeletePlan = async (planId: string) => {
    "use server";
    const deletedPlan = await deletePlan(planId);
    updateTag("plans");
    return deletedPlan;
  };

  const handleSetDefaultPlan = async (planId: string) => {
    "use server";
    const defaultPlan = await setDefaultPlan(planId);
    revalidatePath("/account");
    return defaultPlan;
  };

  return (
    <div className="max-w-screen-2xl w-full">
      <AccountClient
        user={user}
        plans={plans.map((p) => ({ ...p, default: p.userId !== user.id }))}
        onCreatePlan={handleCreatePlan}
        onDeletePlan={handleDeletePlan}
        onSetDefaultPlan={handleSetDefaultPlan}
      />
    </div>
  );
}
