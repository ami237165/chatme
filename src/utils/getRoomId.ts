export const getRoomId = (userA: string, userB: string) =>
  [userA, userB].sort().join("_");