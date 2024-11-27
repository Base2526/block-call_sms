// Role Constants
export const Role = {
    ANONYMOUS: 0,
    ADMINISTRATOR: 1,
    AUTHENTICATED: 2,
    SELLER: 3,
  } as const;
  
  // Status Constants
  export const Status = {
    SUCCESS: "SUCCESS",
    ERROR: "ERROR",
    SYSTEM_ERROR: "SYSTEM_ERROR",
    FORCE_LOGOUT: "FORCE_LOGOUT",
    DATA_NOT_FOUND: "DATA_NOT_FOUND",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    PASSWORD_WRONG: "PASSWORD_WRONG",
    UNAUTHENTICATED: "UNAUTHENTICATED",
    BAD_USER_INPUT: "BAD_USER_INPUT",
    NOT_ENOUGH_BALANCE: "NOT_ENOUGH_BALANCE",
    EXPIRE_DATE: "EXPIRE_DATE",
    NOT_FOUND: "NOT_FOUND",
  } as const;
  
  // Action Constants
  export const Action = {
    CANCEL: 0,
    OK: 1,
  } as const;
  
  // Transaction Types
  export const TransactionType = {
    SUPPLIER: 10,
    DEPOSIT: 11,
    WITHDRAW: 12,
  } as const;
  
  // Approval Status
  export const ApprovalStatus = {
    WAIT: 13,
    APPROVED: 14,
    REJECT: 15,
  } as const;
  
  // Operation Types
  export const Operation = {
    NEW: 16,
    DELETE: 17,
  } as const;
  
  // Message Status
  export const MessageStatus = {
    STATUS_SENT: 50,
    STATUS_DELIVERED: 51,
    STATUS_FAILED: 52,
  } as const;
  