"use client";

import { Button } from "@/components/ui/button";
import { ProjectQueries } from "@/queries/projectModule";
import React, { useState } from "react";

const projectQueries = new ProjectQueries();

export default function TestProjectPage() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [chiefId, setChiefId] = useState<number | string>("");
  const [projectId, setProjectId] = useState<number | string>("");
  const [result, setResult] = useState<any>(null);
  const [budget, setBudget] = useState<number | string>("");

  const handle = async (fn: () => Promise<any>) => {
    try {
      const res = await fn();
      setResult(res);
    } catch (error: any) {
      setResult(error?.response?.data || { error: "Erreur inconnue" });
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 grid grid-cols-3 gap-8">
      <div className="flex flex-col gap-8 col-span-2">
        <h1 className="text-3xl font-bold">📁 Test Routes Project</h1>

        {/* CREATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Créer un projet</h2>
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
          <input
            type="number"
            placeholder="Chief ID"
            className="border p-2 rounded w-full"
            value={chiefId}
            onChange={(e) => setChiefId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Budget"
            className="border p-2 rounded w-full"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <Button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                projectQueries.create({
                  label,
                  description: description || null,
                  chiefId: Number(chiefId),
                  budget: Number(budget),
                })
              )
            }
          >
            Créer Projet
          </Button>
        </section>

        {/* GET ALL */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Liste Projets</h2>
          <Button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => projectQueries.getAll())}
          >
            Tester getAll
          </Button>
        </section>

        {/* GET ONE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get One</h2>
          <input
            type="number"
            placeholder="Project ID"
            className="border p-2 rounded w-full"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <Button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => projectQueries.getOne(Number(projectId)))
            }
          >
            Tester getOne
          </Button>
        </section>

        {/* UPDATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Update Projet</h2>
          <input
            type="number"
            placeholder="Project ID"
            className="border p-2 rounded w-full"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Chief ID"
            className="border p-2 rounded w-full"
            value={chiefId}
            onChange={(e) => setChiefId(e.target.value)}
          />

          <Button
            className="bg-orange-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                projectQueries.update(Number(projectId), {
                  label: "Updated Project",
                  description: "Updated description",
                  chiefId: Number(chiefId),
                })
              )
            }
          >
            Tester Update
          </Button>
        </section>

        {/* DELETE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Delete Projet</h2>
          <Button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => projectQueries.delete(Number(projectId)))
            }
          >
            Tester Delete
          </Button>
        </section>

        {/* GET CHIEF */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Chef du projet</h2>
          <Button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => projectQueries.getChief(Number(projectId)))
            }
          >
            Tester getChief
          </Button>
        </section>
      </div>

      {/* RESULT */}
      <section>
        <h2 className="text-xl font-semibold">Résultat :</h2>
        <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
