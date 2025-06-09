import ActionsServices from '@/components/Organisation/Services/ActionService'
import ServicesTable from '@/components/Organisation/Services/ServicesTable'
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
