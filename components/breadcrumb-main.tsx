'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
} from './ui/breadcrumb';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';

function NavigationBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const formatSegment = (segment: string) => {
    return segment.split('-').join(' ');
  };
  const router = useRouter()

  return (
    <Breadcrumb className="px-4 py-2">
      <BreadcrumbList>
        {pathSegments.length > 2 ? (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BreadcrumbEllipsis className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {pathSegments.slice(0, -2).map((segment, index) => {
                    const href = '/' + pathSegments.slice(0, index + 1).join('/');
                    return (
                      <DropdownMenuItem key={href} asChild>
                        <Button variant={"ghost"} onClick={() => router.push(href)} className="first-letter:uppercase">
                          {formatSegment(segment)}
                        </Button>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="first-letter:uppercase">
                <Button variant={"ghost"} onClick={() => router.push(`${'/' + pathSegments.slice(0, pathSegments.length - 1).join('/')}`)} className="first-letter:uppercase">
                  {formatSegment(pathSegments[pathSegments.length - 2])}
                </Button>
              </BreadcrumbPage>
              <BreadcrumbSeparator />
              <BreadcrumbPage className="first-letter:uppercase">
                {formatSegment(pathSegments[pathSegments.length - 1])}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            const isLast = index === pathSegments.length - 1;
            const formattedSegment = formatSegment(segment);

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="first-letter:uppercase">{formattedSegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href} asChild>
                      {formattedSegment}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default NavigationBreadcrumb;
