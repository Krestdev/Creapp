import ActionsDepartment from '@/components/Organisation/Departement/ActionDepartment'
import DepartmentTable from '@/components/Organisation/Departement/DepartmentTable'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col gap-6'>
      <ActionsDepartment />
      <DepartmentTable />
    </div>
  )
}

export default page
