import { IUserBase } from './user-base';

export interface IUser extends IUserBase {
    jwtToken: string;
}