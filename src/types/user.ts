export type Color = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface User {
    id: number;
    username: string;
    nick: string;
    color?: Color;
};