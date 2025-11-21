"use client";

import { Button } from "@/components/ui/button";
import { CommandRequestQueries } from "@/queries/commandModule";
import React, { useState } from "react";

const commandQueries = new CommandRequestQueries();

export default function TestCommandRequestPage() {
  const [state, setState] = useState("");
  const [modality, setModality] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [justification, setJustification] = useState("");
  const [providerId, setProviderId] = useState<number | string>("");
  const [requestId, setRequestId] = useState<number | string>("");
  const [docId, setDocId] = useState<number | string>("");
  const [result, setResult] = useState<any>(null);

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
        <h1 className="text-3xl font-bold">📦 Test Routes Command Request</h1>

        {/* CREATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Créer une commande</h2>
          <input
            placeholder="Modality"
            className="border p-2 rounded w-full"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
          />
          <input
            type="date"
            placeholder="Delivery Date"
            className="border p-2 rounded w-full"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
          <input
            placeholder="Justification"
            className="border p-2 rounded w-full"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
          <input
            type="number"
            placeholder="Provider ID"
            className="border p-2 rounded w-full"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          />

          <Button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                commandQueries.create({
                  modality,
                  deliveryDate: new Date(deliveryDate),
                  justification,
                  providerId: providerId ? Number(providerId) : null
                })
              )
            }
          >
            Créer Command
          </Button>
        </section>

        {/* GET ALL */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Liste Commandes</h2>
          <Button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.getAll())}
          >
            Tester getAll
          </Button>
        </section>

        {/* GET ONE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Get One</h2>
          <input
            type="number"
            placeholder="Command ID"
            className="border p-2 rounded w-full"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />
          <Button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.getOne(Number(requestId)))}
          >
            Tester getOne
          </Button>
        </section>

        {/* UPDATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Update Command</h2>
          <Button
            className="bg-orange-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handle(() =>
                commandQueries.update(Number(requestId), {
                  state: "updated",
                  modality: "Updated Modality",
                  justification: "Updated justification",
                })
              )
            }
          >
            Tester Update
          </Button>
        </section>

        {/* DELETE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Delete Command</h2>
          <Button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.delete(Number(requestId)))}
          >
            Tester Delete
          </Button>
        </section>

        {/* VALIDATE */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Valider Command</h2>
          <Button
            className="bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.validate(Number(requestId)))}
          >
            Tester Validate
          </Button>
        </section>

        {/* REJECT */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Rejeter Command</h2>
          <Button
            className="bg-red-700 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.reject(Number(requestId)))}
          >
            Tester Reject
          </Button>
        </section>

        {/* ATTACH DOC */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Attacher Document</h2>
          <input
            type="number"
            placeholder="Doc ID"
            className="border p-2 rounded w-full"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          />
          <Button
            className="bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.attachDoc(Number(requestId), Number(docId)))}
          >
            Tester Attach Doc
          </Button>
        </section>

        {/* SUBMIT */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Soumettre Command</h2>
          <Button
            className="bg-teal-600 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.submit(Number(requestId)))}
          >
            Tester Submit
          </Button>
        </section>

        {/* LINK PROVIDER */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Lier Fournisseur</h2>
          <input
            type="number"
            placeholder="Provider ID"
            className="border p-2 rounded w-full"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          />
          <Button
            className="bg-indigo-700 text-white px-4 py-2 rounded"
            onClick={() => handle(() => commandQueries.linkProvider(Number(requestId), Number(providerId)))}
          >
            Tester Link Provider
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
