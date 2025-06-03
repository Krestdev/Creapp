import ActionsServices from '@/components/Organisation/ActionService'
import ServicesTable from '@/components/Organisation/ServicesTable'
import React from 'react'

const ServicesPage = () => {
    return (
        <div className='flex flex-col gap-6'>
            <ActionsServices />
            <ServicesTable />
        </div>
    )
}

export default ServicesPage
