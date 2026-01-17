'use client'
import { Input } from '@/components/ui/input';
import { cn, TranslateRole } from '@/lib/utils';
import { Role } from '@/types/types'
import React from 'react'

interface Props {
    data: Array<Role>;
}

function Roles({data}:Props) {
    const [searchFilter, setSearchFilter] = React.useState<string>("");
    const filteredRoles:Array<Role> = React.useMemo(()=>{
        return data.filter(r=>{
            const search = searchFilter.toLocaleLowerCase();
            TranslateRole(r.label).toLocaleLowerCase().includes(search) 
            || r.users?.some(u=> u.firstName.trim().toLocaleLowerCase().includes(search) || u.lastName.trim().toLocaleLowerCase().includes(search));
        })
    },[data, searchFilter]);
  return (
    <div className="content">
        <Input type="search" value={searchFilter} onChange={(v)=>setSearchFilter(v.target.value)} placeholder='Rechercher' className="max-w-sm" />
        <div className='grid-stats-4'>
            {
                filteredRoles.map(role=>
                    <div key={role.id} className={cn("p-5 rounded-sm border border-gray-100 flex flex-col gap-3")}>
                        <h3>{TranslateRole(role.label)}</h3>
                    </div>
                )
            }
        </div>
    </div>
  )
}

export default Roles