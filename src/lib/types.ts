export type UserRole = "PREPARER" | "ESTIMATOR" | "GM" | "PROJECT_MANAGER" | "PROCUREMENT_OFFICER";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "usr-preparer",
    name: "Eng. Tariq Al-Nuaimi",
    email: "tariq.preparer@falaroad.ae",
    role: "PREPARER",
    title: "Senior Tendering & Estimation Engineer",
  },
  {
    id: "usr-gm",
    name: "H.E. Saeed Fala Al-Falasi",
    email: "saeed.gm@falaroad.ae",
    role: "GM",
    title: "General Manager & Executive Director",
  },
  {
    id: "usr-pm",
    name: "Sarah Jenkins, PMP",
    email: "sarah.pm@falaroad.ae",
    role: "PROJECT_MANAGER",
    title: "Senior Infrastructure Project Manager",
  },
  {
    id: "usr-procurement",
    name: "Mansoor Khan",
    email: "mansoor.procurement@falaroad.ae",
    role: "PROCUREMENT_OFFICER",
    title: "Chief Procurement Officer",
  },
];
