"use client"

import ErrorPage from '@/components/error-page'
import LoadingPage from '@/components/loading-page'
import PageTitle from '@/components/pageTitle'
import { CommandConditionQ } from '@/queries/commandsConditions'
import { NavLink } from '@/types/types'
import { useQuery } from '@tanstack/react-query'
import { ConditionsTable } from './ConditionsTable'

const page = () => {
    const {data:conditions, isLoading, isError, error, isSuccess} = useQuery({
        queryKey: ["conditions"],
        queryFn: () => CommandConditionQ.getAll(),
    });

    if (isLoading) return <LoadingPage />;
    if (isError) return <ErrorPage error={error} />;

    if (isSuccess) {

        const links:Array<NavLink> = [
            {
                title: "Ajouter une valeur",
                href: "./conditions-generales/creer"
            }
        ]

        return (
            <div className='flex flex-col gap-6'>
                <PageTitle
                    title="Conditions des Bons de commandes"
                    subtitle="Consultez la liste des conditions des bons de commandes."
                    color="red"
                    links={links}
                />
                <ConditionsTable
                    data={conditions.data}
                />
            </div>
        )
    }
}

export default page