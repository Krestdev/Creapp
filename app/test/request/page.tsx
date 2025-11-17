"use client";

import { Button } from "@/components/ui/button";
import { RequestQueries } from "@/queries/requestModule";
import React, { useState } from "react";

const requestQueries = new RequestQueries();

export default function TestRequestPage() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [userId, setUserId] = useState<number | string>("");
  const [requestId, setRequestId] = useState<number | string>("");
  const [priority, setPriority] = useState("");
  const [result, setResult] = useState<any>(null);
  const [projectId, setProjectId] = useState<number | string>("");

  const handle = async (fn: () => Promise<any>) => {
    try {
      const res = await fn();
      setResult(res);
    } catch (error: any) {
      setResult(error?.response?.data || { error: "Erreur inconnue" });
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6 grid grid-cols-3 gap-8">
      <div className="flex flex-col gap-8 col-span-2">
        <h1 className="text-3xl font-bold">📝 Test Routes Request</h1>
        {/* CREATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Créer une demande</h2>
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
            placeholder="Quantity"
            className="border p-2 rounded w-full"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <input
            placeholder="Unit"
            className="border p-2 rounded w-full"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <input
            placeholder="Beneficiary"
            className="border p-2 rounded w-full"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <input
            type="number"
            placeholder="UserId"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="number"
            placeholder="UserId"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="number"
            placeholder="ProjectId"
            className="border p-2 rounded w-full"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />

          <Button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                requestQueries.create({
                  label,
                  description: description || null,
                  quantity,
                  unit,
                  beneficiary,
                  beficiaryList: null,
                  state: "pending",
                  proprity: "normal",
                  userId: Number(userId),
                  dueDate: new Date(),
                  projectId: Number(projectId),
                })
              )
            }
          >
            Créer Request
          </Button>
        </section>

        {/* GET ALL */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Liste Requests</h2>
          <Button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => requestQueries.getAll())}
          >
            Tester getAll
          </Button>
        </section>

        {/* GET ONE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get One</h2>
          <input
            type="number"
            placeholder="Request ID"
            className="border p-2 rounded w-full"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />
          <Button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => requestQueries.getOne(Number(requestId)))
            }
          >
            Tester getOne
          </Button>
        </section>

        {/* UPDATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Update Request</h2>
          <Button
            className="bg-orange-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                requestQueries.update(Number(requestId), {
                  label: "Updated Label",
                  description: "Updated description",
                  quantity: 2,
                  unit: "Updated unit",
                  beneficiary: "Updated beneficiary",
                  projectId: Number(projectId) || null,
                })
              )
            }
          >
            Tester Update
          </Button>
        </section>

        {/* DELETE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Delete Request</h2>
          <Button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => requestQueries.delete(Number(requestId)))
            }
          >
            Tester Delete
          </Button>
        </section>

        {/* GET MINE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Mes Requests</h2>
          <input
            type="number"
            placeholder="User ID"
            className="border p-2 rounded w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => requestQueries.getMine(Number(userId)))}
          >
            Tester getMine
          </Button>
        </section>

        {/* VALIDATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Valider Request</h2>
          <Button
            className="bg-green-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => requestQueries.validate(Number(requestId)))
            }
          >
            Tester Validate
          </Button>
        </section>

        {/* REJECT */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Rejeter Request</h2>
          <Button
            className="bg-red-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => requestQueries.reject(Number(requestId)))
            }
          >
            Tester Reject
          </Button>
        </section>

        {/* UPDATE PRIORITY */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Modifier priorité</h2>
          <input
            placeholder="Nouvelle priorité"
            className="border p-2 rounded w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <Button
            className="bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                requestQueries.updatePriority(Number(requestId), priority)
              )
            }
          >
            Modifier priorité
          </Button>
        </section>

        {/* SUBMIT */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Soumettre Request</h2>
          <Button
            className="bg-teal-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() => requestQueries.submit(Number(requestId)))
            }
          >
            Tester Submit
          </Button>
        </section>
      </div>

      {/* RESULT */}
      <section>
        <h2 className="text-xl font-semibold max-w-[500px] w-full">Résultat :</h2>
        <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
