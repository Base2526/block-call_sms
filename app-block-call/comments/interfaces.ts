export enum StatusInterface {
    SENDING = 'SENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

export interface UserCommentInterface {
    userId: string;
    username: string;
    url: string;
}

export interface SubCommentInterface {
    _id: string;
    text: string;
    user: UserCommentInterface;
    status: StatusInterface;
    created: number;
    updated: number;
}
  
export interface CommentInterface {
    _id: string;
    text: string;
    user: UserCommentInterface;
    exposed?: boolean;
    status: StatusInterface;
    created: number;
    updated: number;
    subComments: Array<SubCommentInterface>;
}
  
export interface ReplyInterface {
    _id: string;
    tag: string;
    selectId: string;
}
