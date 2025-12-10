import React from 'react'

interface Props {
    title: string
    value: string
    className: string
    valColor: string
}

const TitleValueCard = ({title, value, className, valColor}: Props) => {
  return (
    <div className={`${className} w-full flex flex-col gap-2 p-5 shadow-[0px_8px_6px_-6px_rgba(0,0,0,0.1)] rounded-[12px]`}>
      <p className='text-sm font-medium'>{title}</p>
      <p className={`${valColor} text-[32px]`}>{value}</p>
    </div>
  )
}

export default TitleValueCard
