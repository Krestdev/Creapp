import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from './button'

interface Props {
    totalItems: number,
    itemsPerPage: number,
    currentPage: number,
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }: Props) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    console.log(itemsPerPage);
    

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handlePageChange(Number(e.target.value))
    }

    return (
        <div className="flex items-center justify-end mt-4 gap-4">
            {/* Sélecteur de pages */}
            <div className="relative border border-[#D4D4D8] rounded-[6px] bg-white p-2 flex items-center">
                <select
                    value={currentPage}
                    onChange={handleSelectChange}
                    className="appearance-none bg-transparent pr-6 pl-2 cursor-pointer focus:outline-none"
                >
                    {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Page {i + 1}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 pointer-events-none" size={16} />
            </div>

            {/* Contrôles de navigation */}
            <div className="flex items-center gap-2">
                <Button variant={"ghost"}
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="text-[#71717A] disabled:opacity-30"
                >
                    <ChevronsLeft size={16} />
                </Button>
                <Button variant={"ghost"}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-[#71717A] disabled:opacity-30"
                >
                    <ChevronLeft size={16} />
                </Button>
                <Button variant={"ghost"}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-[#71717A] disabled:opacity-30"
                >
                    <ChevronRight size={16} />
                </Button>
                <Button variant={"ghost"}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="text-[#71717A] disabled:opacity-30"
                >
                    <ChevronsRight size={16} />
                </Button>
            </div>
        </div>
    )
}

export default Pagination