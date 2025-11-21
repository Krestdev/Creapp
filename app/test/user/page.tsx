"use client";

import { Button } from "@/components/ui/button";
import { UserQueries } from "@/queries/baseModule";
import React, { useState } from "react";

const userQueries = new UserQueries();

export default function TestUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<number | string>("");
  const [roleLabel, setRoleLabel] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [otp, setOtp] = useState<string>("");

  const handle = async (fn: () => Promise<any>) => {
    try {
      const res = await fn();
      setResult(res);
    } catch (error: any) {
      setResult(error?.response?.data || { error: "Erreur inconnue" });
    }
  };

  return (
    <div className="p-8 max-w-[1440px] w-full mx-auto grid grid-cols-3 gap-8">

      <div className="flex flex-col gap-8 col-span-2">
      <h1 className="text-3xl font-bold">🔍 Test Routes User</h1>
        {/* LOGIN */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Connexion</h2>
          <input
            type="email"
            placeholder="email"
            className="border p-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            className="border p-2 rounded w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => userQueries.login({ email, password }))}
          >
            Tester Login
          </Button>
        </section>

        {/* REGISTER */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Register</h2>
          <Button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                userQueries.register({
                  email: "achat@gmail.com",
                  password: "Achat123",
                  name: "Achat Testeur",
                  phone: "690000000",
                })
              )
            }
          >
            Tester Register
          </Button>
        </section>

        {/* VERIFY OTP */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Vérifier OTP</h2>

          <input
            type="number"
            placeholder="Entrer OTP"
            className="border p-2 rounded w-full"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="email"
            placeholder="Entrer Email"
            className="border p-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            className="bg-teal-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => userQueries.getVerificationOtp(Number(otp), email))
            }
          >
            Tester OTP
          </Button>
        </section>

        {/* GET ALL */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Liste Users</h2>
          <Button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => userQueries.getAll())}
          >
            Tester getAll
          </Button>
        </section>

        {/* GET ONE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get One</h2>
          <input
            type="number"
            placeholder="id user"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <Button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => userQueries.getOne(Number(userId)))}
          >
            {"Tester getOne"}
          </Button>
        </section>

        {/* UPDATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Update User</h2>
          <input
            type="number"
            placeholder="id user"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <Button
            className="bg-orange-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                userQueries.update(Number(userId), {
                  email: "updated@example.com",
                  phone: "677111222",
                })
              )
            }
          >
            {"Tester Update"}
          </Button>
        </section>

        {/* DELETE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{"Delete User"}</h2>
          <input
            type="number"
            placeholder="id user"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => userQueries.delete(Number(userId)))}
          >
            {"Tester Delete"}
          </Button>
        </section>

        {/* ------------------- ROLES ------------------- */}

        {/* GET ROLES */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{"Roles - Liste"}</h2>
          <Button
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => userQueries.getRoles())}
          >
            Tester getRoles
          </Button>
        </section>

        {/* CREATE ROLE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{"Créer un rôle"}</h2>

          <input
            placeholder="Nom du rôle"
            className="border p-2 rounded w-full"
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
          />

          <Button
            className="bg-green-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => userQueries.createRole({ label: roleLabel }))
            }
          >
            {"Créer rôle"}
          </Button>
        </section>

        {/* ASSIGN ROLE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{"Assigner rôle à user"}</h2>
          <input
            type="number"
            placeholder="id user"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="number"
            placeholder="id rôle"
            className="border p-2 rounded w-full"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          />
          <Button
            className="bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                userQueries.assignRoles(Number(userId), roleId)
              )
            }
          >
            {"Assigner rôle"}
          </Button>
        </section>

        {/* REMOVE ROLE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{"Retirer rôle à user"}</h2>

          <input
            type="number"
            placeholder="id user"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button
            className="bg-red-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                userQueries.removeRoles(Number(userId), [Number(roleId)])
              )
            }
          >
           {"Retirer rôle"}
          </Button>
        </section>

        {/* ROLE PAGES */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">{"Liste Pages d'un Rôle"}</h2>

          <input
            type="number"
            placeholder="id rôle"
            className="border p-2 rounded w-full"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          />

          <Button
            className="bg-gray-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => userQueries.getRolePages(Number(roleId)))
            }
          >
            {"Voir pages du rôle"}
          </Button>
        </section>
      </div>

      {/* RESULT */}
      <section className="fixed top-0 right-50">
        <h2 className="text-xl font-semibold">{"Résultat :"}</h2>
        <pre className="bg-gray-100 p-4 rounded h-fit max-w-[450px] overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
