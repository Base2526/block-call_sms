export interface ItemCall {
    id: string;
    date: string; 
    name: string;
    number: string;
    photoUri: string | null;
    type: string; 
    createdAt?: string; 
    updatedAt?: string; 
}

export interface CallLog {
    number: string;
    callLogs: ItemCall[];
    createdAt?: string; 
    updatedAt?: string; 
}

export interface ItemSms {
    id: string;
    address: string; // Phone number
    body: string;   // SMS body content
    date: string;   // Date of the SMS
    name: string;   // Contact name
    photoUri?: string; // Contact photo URI (optional)
    type: string;   // Message type (e.g., sent, received)
    read: number;   // Read status (1 for read, 0 for unread)
    status: string; // Delivery status of the message
    thread_id?: string; // SMS thread ID
}

export interface SmsLog {
    address: string;
    messages: ItemSms[]
    createdAt?: string; 
    updatedAt?: string; 
}

export interface BlockItem{
    ID?: string;
    DETAIL?: string;
    NAME?: string;
    TYPE?: number;
    PHONE_NUMBER: string;
    PHOTO_URI?: string | null;
    REPORTER?: string;
    CREATE_AT?: string;
    UPDATE_AT?: string;
}  

enum Roles {
    AUTHENTICATED = 1,
    ADMINISTRATOR = 2,
}

export interface UserItem{
    current:{
        username: string;
        password: string;
        email: string;
        tel: string;
        displayName: string;
        address?: string;
        packages: 1 | 2 | 3;
        roles: Roles[];
        isActive: 0 | 1;
        lockAccount?: {
            lock: boolean;
            date: Date;
        };
        lastAccess: Date;
    }
    ,avatar?: {
        url?: string;
        filename?: string;
        mimetype?: string;
        encoding?: string;
    };
}