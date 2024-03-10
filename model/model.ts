export enum UserType {
  user = 'user',
  owner = 'owner',
}

export interface User {
  username: string;
  password: string;
  image: string;
  type: string;
  email: string;
}

export interface imageUpload{
  url : string;
  uploadDate : string;
  count : string;
  userID : number;
}



export interface Vote {
  userID: string;
  imageID: number;
  elorating: number;
}