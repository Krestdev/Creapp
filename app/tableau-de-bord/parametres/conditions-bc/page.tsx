"use client"

import PageTitle from '@/components/pageTitle'
import { Button } from '@/components/ui/button'
import React from 'react'
import CreateCondition from './CreateCondition'
import { useQuery } from '@tanstack/react-query'
import { CommandConditionQ } from '@/queries/commandsConditions'
import { ConditionsTable } from './ConditionsTable'
import LoadingPage from '@/components/loading-page'
import ErrorPage from '@/components/error-page'
import ConditionForm from './CreateCondition'

const page = () => {
    const [open, setOpen] = React.useState(false);
    const conditions = useQuery({
        queryKey: ["conditions"],
        queryFn: () => CommandConditionQ.getAll(),
    });

    if (conditions.isLoading) return <LoadingPage />;
    if (conditions.isError) return <ErrorPage message="Erreur lors du chargement des conditions." />;

    if (conditions.isSuccess) {

        return (
            <div className='flex flex-col gap-6'>
                <PageTitle
                    title="Conditions des Bons de commandes"
                    subtitle="Consultez la liste des conditions des bons de commandes."
                    color="red"
                />
                <div className='flex flex-col gap-6'>
                    <Button variant={"primary"} onClick={() => setOpen(true)} className='w-fit'>
                        Ajouter une condition
                    </Button>
                </div>
                <ConditionsTable
                    data={conditions?.data.data || []}
                />

                <ConditionForm
                    open={open}
                    openChange={setOpen}
                />
            </div>
        )
    }
}

export default page