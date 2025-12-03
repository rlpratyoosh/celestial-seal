import { UserInterface } from "@repo/types";

export class UserEntity implements UserInterface {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    userType: "ADMIN" | "USER";
    createdAt: Date;
    updatedAt: Date;
}
