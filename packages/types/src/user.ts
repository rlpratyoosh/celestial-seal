export interface UserInterface {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    userType: 'ADMIN' | 'USER'; // A celestial or a mortal
    createdAt: Date;
    updatedAt: Date;
}