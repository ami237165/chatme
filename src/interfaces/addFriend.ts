export interface AddFriend {
  performedBy: string;
  targetUser: string;
  action: ConnectionAction;
}

export interface ResponsToReq{
  id:any;
  performedBy:string;
  targetUser:string;
  action:ConnectionAction;
  status:EventStatus;
}

export enum ConnectionAction {
  SEND_MESSAGE_REQUEST = 'SEND_MESSAGE_REQUEST',

  ACCEPT_MESSAGE_REQUEST = 'ACCEPT_MESSAGE_REQUEST',

  REJECT_MESSAGE_REQUEST = 'REJECT_MESSAGE_REQUEST',

  SEND_FRIEND_REQUEST = 'SEND_FRIEND_REQUEST',

  ACCEPT_FRIEND_REQUEST = 'ACCEPT_FRIEND_REQUEST',

  REJECT_FRIEND_REQUEST = 'REJECT_FRIEND_REQUEST',

  CANCEL_FRIEND_REQUEST = 'CANCEL_FRIEND_REQUEST',

  BLOCK = 'BLOCK',

  UNBLOCK = 'UNBLOCK',

  UNFRIEND = 'UNFRIEND',
}

export enum ConnectionStatus {
  NONE = 'NONE',
  MESSAGE_REQUEST = 'MESSAGE_REQUEST',
  MESSAGE_ALLOWED = 'MESSAGE_ALLOWED',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIENDS = 'FRIENDS',
  BLOCKED = 'BLOCKED',
}

export enum EventStatus {
  DONE = 'DONE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}
