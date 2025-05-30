export interface NavigationItemProps {
    href: string;
    title: string;
    badge?: Number;
}

export type UserRole = 'admin' | 'user';

export type User = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface UserTest extends User {
    password: string;
}