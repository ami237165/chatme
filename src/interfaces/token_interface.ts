export interface JwtPayload {
    exp:number,
    iat:number,
    id: number; // Subject (e.g., user ID)
    mobileNumber:string;
    name: string;
}