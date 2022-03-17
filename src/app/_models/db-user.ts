import { IUserBase } from './user-base';

export interface IDbUser extends IUserBase {
    password: string;
    refreshTokens: string[];
}