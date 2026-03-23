import { cn } from '@/lib/utils';
import { User } from '@/types/types'
import React from 'react'

interface Props {
    user: User;
    className?: string;
}

function AvatarText({user, className=""}:Props) {
    const initials:string = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;
  return (
    <div className={cn("size-8 p-1.5 bg-linear-to-t from-primary-800 to-primary-600 rounded-full flex items-center justify-center text-gray-50 font-semibold uppercase", className)}>{initials}</div>
  )
}

export default AvatarText