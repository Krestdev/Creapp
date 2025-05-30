'use client';
import React from 'react'
import Login from './login'
import { Copyright } from 'lucide-react'
import useAuthGuard from '@/hooks/useAuthGuard'

function Page() {
  useAuthGuard({requireAuth: false})
  return (
    <React.Fragment>
        <div className='min-h-[calc(100vh-40px)] grid place-items-center py-10'>
        <div className='max-w-md w-full px-7 py-10 flex flex-col items-center gap-10'>
            <div className='flex flex-col justify-center items-center gap-5'>
                <img src="/logo-icon.svg" alt="logo" className='h-16 w-auto'/>
                <h1 className='text-center'>{"Connexion"}</h1>
            </div>
            <Login/>
        </div>
        </div>
        <div className='border-t border-gray-200 w-full h-10 inline-flex items-center justify-center gap-3 text-gray-600 text-sm'><span>{"CREAPP."}</span><span className='inline-flex items-center gap-1'><Copyright className='text-gray-600' size={14}/> {"2025 KrestDev"}</span></div>
    </React.Fragment>
  )
}

export default Page