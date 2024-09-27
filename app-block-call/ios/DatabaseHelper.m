//
//  DatabaseHelper.m
//  YourProjectName
//
//  Created by Somkid on 10/8/2024.
//

//#import "DatabaseHelper.h"
//
//@implementation DatabaseHelper
//
//@end

#import "DatabaseHelper.h"

@implementation DatabaseHelper

- (instancetype)init {
    self = [super init];
    if (self) {
        [self createDatabase];
    }
    return self;
}

- (void)createDatabase {
    // Path to SQLite database
    NSString *docsDir;
    NSArray *dirPaths;
    
    dirPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    docsDir = dirPaths[0];
    NSString *databasePath = [[NSString alloc] initWithString:[docsDir stringByAppendingPathComponent:@"database.sqlite"]];
    
    if (sqlite3_open([databasePath UTF8String], &database) == SQLITE_OK) {
        const char *sqlStatement = "CREATE TABLE IF NOT EXISTS Contacts (ID INTEGER PRIMARY KEY AUTOINCREMENT, PHONE_NUMBER TEXT, DETAIL TEXT, REPORTER TEXT)";
        char *errorMessage;
        if (sqlite3_exec(database, sqlStatement, NULL, NULL, &errorMessage) != SQLITE_OK) {
            NSLog(@"Failed to create table: %s", errorMessage);
        }
        sqlite3_close(database);
    } else {
        NSLog(@"Failed to open/create database");
    }
}

- (BOOL)addDataWithPhoneNumber:(NSString *)phoneNumber
                        detail:(NSString *)detail
                      reporter:(NSString *)reporter {
    // Add single data entry
    // Open the database
    if (sqlite3_open([self getDatabasePath].UTF8String, &database) == SQLITE_OK) {
        const char *sql = "INSERT INTO Contacts (PHONE_NUMBER, DETAIL, REPORTER) VALUES (?, ?, ?)";
        sqlite3_stmt *statement;
        
        if (sqlite3_prepare_v2(database, sql, -1, &statement, NULL) == SQLITE_OK) {
            sqlite3_bind_text(statement, 1, [phoneNumber UTF8String], -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(statement, 2, [detail UTF8String], -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(statement, 3, [reporter UTF8String], -1, SQLITE_TRANSIENT);
            
            if (sqlite3_step(statement) != SQLITE_DONE) {
                NSLog(@"Error while inserting data: %s", sqlite3_errmsg(database));
                sqlite3_finalize(statement);
                sqlite3_close(database);
                return NO;
            }
        }
        sqlite3_finalize(statement);
        sqlite3_close(database);
        return YES;
    }
    return NO;
}

- (BOOL)addDatas:(NSArray *)dataArray {
    // Add multiple data entries
    for (NSDictionary *data in dataArray) {
        [self addDataWithPhoneNumber:data[@"PHONE_NUMBER"]
                              detail:data[@"DETAIL"]
                            reporter:data[@"REPORTER"]];
    }
    return YES;
}

- (NSDictionary *)getDataById:(int)ID {
    // Get data by ID
    if (sqlite3_open([self getDatabasePath].UTF8String, &database) == SQLITE_OK) {
        const char *sql = "SELECT * FROM Contacts WHERE ID = ?";
        sqlite3_stmt *statement;
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        
        if (sqlite3_prepare_v2(database, sql, -1, &statement, NULL) == SQLITE_OK) {
            sqlite3_bind_int(statement, 1, ID);
            if (sqlite3_step(statement) == SQLITE_ROW) {
                result[@"ID"] = @(sqlite3_column_int(statement, 0));
                result[@"PHONE_NUMBER"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 1)];
                result[@"DETAIL"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 2)];
                result[@"REPORTER"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 3)];
            }
        }
        sqlite3_finalize(statement);
        sqlite3_close(database);
        return result;
    }
    return nil;
}

- (NSDictionary *)getDataByPhoneNumber:(NSString *)phoneNumber {
    // Get data by phone number
    if (sqlite3_open([self getDatabasePath].UTF8String, &database) == SQLITE_OK) {
        const char *sql = "SELECT * FROM Contacts WHERE PHONE_NUMBER = ?";
        sqlite3_stmt *statement;
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        
        if (sqlite3_prepare_v2(database, sql, -1, &statement, NULL) == SQLITE_OK) {
            sqlite3_bind_text(statement, 1, [phoneNumber UTF8String], -1, SQLITE_TRANSIENT);
            if (sqlite3_step(statement) == SQLITE_ROW) {
                result[@"ID"] = @(sqlite3_column_int(statement, 0));
                result[@"PHONE_NUMBER"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 1)];
                result[@"DETAIL"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 2)];
                result[@"REPORTER"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 3)];
            }
        }
        sqlite3_finalize(statement);
        sqlite3_close(database);
        return result;
    }
    return nil;
}

- (NSArray *)getAllData {
    // Get all data
    if (sqlite3_open([self getDatabasePath].UTF8String, &database) == SQLITE_OK) {
        const char *sql = "SELECT * FROM Contacts";
        sqlite3_stmt *statement;
        NSMutableArray *results = [NSMutableArray array];
        
        if (sqlite3_prepare_v2(database, sql, -1, &statement, NULL) == SQLITE_OK) {
            while (sqlite3_step(statement) == SQLITE_ROW) {
                NSMutableDictionary *result = [NSMutableDictionary dictionary];
                result[@"ID"] = @(sqlite3_column_int(statement, 0));
                result[@"PHONE_NUMBER"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 1)];
                result[@"DETAIL"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 2)];
                result[@"REPORTER"] = [NSString stringWithUTF8String:(const char *)sqlite3_column_text(statement, 3)];
                [results addObject:result];
            }
        }
        sqlite3_finalize(statement);
        sqlite3_close(database);
        return results;
    }
    return nil;
}

- (BOOL)updateDataWithID:(int)ID
            phoneNumber:(NSString *)phoneNumber
                  detail:(NSString *)detail
                reporter:(NSString *)reporter {
    // Update data
    if (sqlite3_open([self getDatabasePath].UTF8String, &database) == SQLITE_OK) {
        const char *sql = "UPDATE Contacts SET PHONE_NUMBER = ?, DETAIL = ?, REPORTER = ? WHERE ID = ?";
        sqlite3_stmt *statement;
        
        if (sqlite3_prepare_v2(database, sql, -1, &statement, NULL) == SQLITE_OK) {
            sqlite3_bind_text(statement, 1, [phoneNumber UTF8String], -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(statement, 2, [detail UTF8String], -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(statement, 3, [reporter UTF8String], -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(statement, 4, ID);
            
            if (sqlite3_step(statement) != SQLITE_DONE) {
                NSLog(@"Error while updating data: %s", sqlite3_errmsg(database));
                sqlite3_finalize(statement);
                sqlite3_close(database);
                return NO;
            }
        }
        sqlite3_finalize(statement);
        sqlite3_close(database);
        return YES;
    }
    return NO;
}

- (BOOL)deleteDataWithID:(int)ID {
    // Delete data
    if (sqlite3_open([self getDatabasePath].UTF8String, &database) == SQLITE_OK) {
        const char *sql = "DELETE FROM Contacts WHERE ID = ?";
        sqlite3_stmt *statement;
        
        if (sqlite3_prepare_v2(database, sql, -1, &statement, NULL) == SQLITE_OK) {
            sqlite3_bind_int(statement, 1, ID);
            
            if (sqlite3_step(statement) != SQLITE_DONE) {
                NSLog(@"Error while deleting data: %s", sqlite3_errmsg(database));
                sqlite3_finalize(statement);
                sqlite3_close(database);
                return NO;
            }
        }
        sqlite3_finalize(statement);
        sqlite3_close(database);
        return YES;
    }
    return NO;
}

- (NSString *)getDatabasePath {
    // Return the path to the database
    NSArray *dirPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    return [dirPaths[0] stringByAppendingPathComponent:@"database.sqlite"];
}

@end

