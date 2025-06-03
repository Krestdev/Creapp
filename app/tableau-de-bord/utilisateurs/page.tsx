import Actions from '@/components/Users/Actions'
import UsersTable from '@/components/Users/UsersTable'
import React from 'react'

const UsersPage = () => {
  return (
    <div className='flex flex-col gap-6'>
        <Actions />
        <UsersTable />
    </div>
  )
}

export default UsersPage
