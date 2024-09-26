//
//  DatabaseHelper.h
//  YourProjectName
//
//  Created by Somkid on 10/8/2024.
//

//#import <Foundation/Foundation.h>
//
//NS_ASSUME_NONNULL_BEGIN
//
//@interface DatabaseHelper : NSObject
//
//@end
//
//NS_ASSUME_NONNULL_END

#import <Foundation/Foundation.h>
#import <sqlite3.h>

@interface DatabaseHelper : NSObject {
    sqlite3 *database;
}

- (BOOL)addDataWithPhoneNumber:(NSString *)phoneNumber
                        detail:(NSString *)detail
                      reporter:(NSString *)reporter;

- (BOOL)addDatas:(NSArray *)dataArray;

- (NSDictionary *)getDataById:(int)ID;

- (NSDictionary *)getDataByPhoneNumber:(NSString *)phoneNumber;

- (NSArray *)getAllData;

- (BOOL)updateDataWithID:(int)ID
            phoneNumber:(NSString *)phoneNumber
                  detail:(NSString *)detail
                reporter:(NSString *)reporter;

- (BOOL)deleteDataWithID:(int)ID;

- (NSString *)getDatabasePath;
@end

