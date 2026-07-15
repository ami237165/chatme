import { ConnectionAction, ConnectionStatus, EventStatus } from "./addFriend";

export interface GetRequests {
  performedBy?: string;
  targetUser?: string;
  action?: ConnectionAction;
  connection_status?: ConnectionStatus;
  status?: EventStatus;
}
