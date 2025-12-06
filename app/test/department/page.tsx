"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DepartmentQueries } from "@/queries/departmentModule";

const departmentQueries = new DepartmentQueries();

export default function TestDepartmentPage() {
  const [deptId, setDeptId] = useState<number | string>("");
  const [userId, setUserId] = useState<number | string>("");

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const [validatorIds, setValidatorIds] = useState("");
  const [finalValidatorIds, setFinalValidatorIds] = useState("");

  const [result, setResult] = useState<any>(null);

  const handle = async (fn: () => Promise<any>) => {
    try {
      const res = await fn();
      setResult(res);
    } catch (err: any) {
      setResult(err?.response?.data || { error: "Erreur inconnue" });
    }
  };

  // Transforme "1,2,3" en [1,2,3]
  const parseIds = (str: string) =>
    str
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 grid grid-cols-3 gap-8">
      <div className="flex flex-col gap-8 col-span-2">
        <h1 className="text-3xl font-bold">🏢 Test Department Routes</h1>

        {/* CREATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Créer un département</h2>

          <input
            placeholder="Label"
            className="border p-2 rounded w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <input
            placeholder="Description"
            className="border p-2 rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            className="bg-green-600 text-white"
            onClick={() =>
              handle(() =>
                departmentQueries.create({
                  label,
                  description: description || null,
                })
              )
            }
          >
            Créer Department
          </Button>
        </section>

        {/* GET ALL */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Liste des départements</h2>
          <Button
            className="bg-purple-600 text-white"
            onClick={() => handle(() => departmentQueries.getAll())}
          >
            Tester getAll
          </Button>
        </section>

        {/* GET ONE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get One</h2>
          <input
            type="number"
            placeholder="Department ID"
            className="border p-2 rounded w-full"
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
          />

          <Button
            className="bg-yellow-600 text-white"
            onClick={() =>
              handle(() => departmentQueries.getOne(Number(deptId)))
            }
          >
            Tester getOne
          </Button>
        </section>

        {/* GET MEMBERS */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get Members</h2>
          <Button
            className="bg-blue-600 text-white"
            onClick={() =>
              handle(() => departmentQueries.getMembers(Number(deptId)))
            }
          >
            Tester getMembers
          </Button>
        </section>

        {/* GET VALIDATORS */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get Validators</h2>
          <Button
            className="bg-blue-500 text-white"
            onClick={() =>
              handle(() => departmentQueries.getValidators(Number(deptId)))
            }
          >
            Tester getValidators
          </Button>
        </section>

        {/* GET FINAL VALIDATORS */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get Final Validators</h2>
          <Button
            className="bg-indigo-600 text-white"
            onClick={() =>
              handle(() => departmentQueries.getFinalValidators(Number(deptId)))
            }
          >
            Tester getFinalValidators
          </Button>
        </section>

        {/* GET CHIEF */}
        {/* <section className="space-y-2">
          <h2 className="text-xl font-semibold">Chef du département</h2>

          <Button
            className="bg-orange-600 text-white"
            onClick={() =>
              handle(() => departmentQueries.getChief(Number(deptId)))
            }
          >
            Tester getChief
          </Button>
        </section> */}

        {/* MEMBERS / VALIDATORS / FINAL VALIDATORS / CHIEF ACTIONS */}
        {/* ADD / REMOVE MEMBERS */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Ajouter / Retirer Membres</h2>

          <input
            placeholder="Label d'utilisateur"
            className="border p-2 rounded w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            placeholder="ID utilisateur ,"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            placeholder="ID du departement ,"
            className="border p-2 rounded w-full"
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              className="bg-green-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.addMembers(Number(deptId), {
                    label: label,
                    userId: Number(userId),
                  })
                )
              }
            >
              Ajouter
            </Button>

            <Button
              className="bg-red-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.removeMembers(
                    Number(deptId),
                    Number(userId)
                  )
                )
              }
            >
              Retirer
            </Button>
          </div>
        </section>

        {/* VALIDATORS */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Validators</h2>

          <input
            placeholder="IDs validateurs"
            className="border p-2 rounded w-full"
            value={validatorIds}
            onChange={(e) => setValidatorIds(e.target.value)}
          />

          <input
            placeholder="Dept ID"
            className="border p-2 rounded w-full"
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              className="bg-green-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.addValidators(
                    Number(deptId),
                    Number(validatorIds)
                  )
                )
              }
            >
              Ajouter
            </Button>

            <Button
              className="bg-red-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.removeValidators(
                    Number(deptId),
                    Number(validatorIds)
                  )
                )
              }
            >
              Retirer
            </Button>
          </div>
        </section>

        {/* FINAL VALIDATORS */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Final Validators</h2>

          <input
            placeholder="Dept ID"
            className="border p-2 rounded w-full"
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
          />

          <input
            placeholder="IDs final validateurs"
            className="border p-2 rounded w-full"
            value={finalValidatorIds}
            onChange={(e) => setFinalValidatorIds(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              className="bg-green-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.addFinalValidators(
                    Number(deptId),
                    Number(finalValidatorIds)
                  )
                )
              }
            >
              Ajouter
            </Button>

            <Button
              className="bg-red-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.removeFinalValidators(
                    Number(deptId),
                    Number(finalValidatorIds)
                  )
                )
              }
            >
              Retirer
            </Button>
          </div>
        </section>

        {/* CHIEF */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Chef</h2>

          <input
            type="number"
            placeholder="User ID"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              className="bg-green-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.addChief(Number(deptId), Number(userId))
                )
              }
            >
              Ajouter Chief
            </Button>

            <Button
              className="bg-red-600 text-white"
              onClick={() =>
                handle(() =>
                  departmentQueries.removeChief(Number(deptId), Number(userId))
                )
              }
            >
              Retirer Chief
            </Button>
          </div>
        </section>
      </div>

      {/* RESULT */}
      <section>
        <h2 className="text-xl font-semibold">Résultat :</h2>
        <pre className="bg-gray-100 p-4 rounded max-h-[80vh] overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
