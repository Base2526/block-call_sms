import BankModel from "./BankModel"
import SocketModel from './SocketModel';
import DblogModel from './DblogModel';
import SessionModel from './SessionModel';
import TransitionModel from './TransitionModel';
import LogUserAccessModel from './LogUserAccessModel';
import { File as FileModel } from './FileModel';
import ProvinceModel from './ProvinceModel';
import UserModel from './UserModel';
import ReportModel from './ReportModel';
import CommentModel from "./CommentModel";

// Define a type for the exported models
export type Models = {
    Bank: typeof BankModel;
    Socket: typeof SocketModel;
    Dblog: typeof DblogModel;
    Session: typeof SessionModel;
    Transition: typeof TransitionModel;
    Province: typeof ProvinceModel;
    LogUserAccess: typeof LogUserAccessModel;
    File: typeof FileModel;
    User: typeof UserModel;
    Report: typeof ReportModel;
    Comment: typeof CommentModel
};

// Export the models using the `export` keyword
export const models: Models = {
    Bank: BankModel,
    Socket: SocketModel,
    Dblog: DblogModel,
    Session: SessionModel,
    Transition: TransitionModel,
    LogUserAccess: LogUserAccessModel,
    File: FileModel,
    Province: ProvinceModel,
    User: UserModel,
    Report: ReportModel,
    Comment: CommentModel,
};