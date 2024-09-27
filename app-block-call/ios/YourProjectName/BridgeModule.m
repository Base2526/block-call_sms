//
//  BridgeModule.m
//  YourProjectName
//
//  Created by Somkid on 10/8/2024.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "DatabaseHelper.h"

@interface DatabaseModule : NSObject <RCTBridgeModule>
@end

@implementation DatabaseModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(addData:(NSString *)phoneNumber
              detail:(NSString *)detail
              reporter:(NSString *)reporter
              resolver:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject) {
    DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
    BOOL success = [dbHelper addDataWithPhoneNumber:phoneNumber detail:detail reporter:reporter];
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"error", @"Failed to add data", nil);
    }
}

RCT_EXPORT_METHOD(getAllData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
//    NSArray *results = [self getAllData];
    DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
    NSArray *results = [dbHelper getAllData];
    if (results) {
        resolve(results);
    } else {
        reject(@"db_error", @"Failed to retrieve data", nil);
    }
}

RCT_EXPORT_METHOD(addDatas:(NSArray *)dataArray
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  
    DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
    for (NSDictionary *data in dataArray) {
//        [self addDataWithPhoneNumber:data[@"PHONE_NUMBER"]
//                              detail:data[@"DETAIL"]
//                            reporter:data[@"REPORTER"]];
      [dbHelper addDataWithPhoneNumber:data[@"PHONE_NUMBER"] detail:data[@"DETAIL"] reporter:data[@"REPORTER"]];
    }
    resolve(@(YES));
}

RCT_EXPORT_METHOD(getDataById:(NSInteger)ID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
//    NSDictionary *result = [self getDataById:(int)ID];
    DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
    NSDictionary *result = [dbHelper getDataById:(int)ID];
    if (result) {
        resolve(result);
    } else {
        reject(@"db_error", @"No data found", nil);
    }
}

RCT_EXPORT_METHOD(getDataByPhoneNumber:(NSString *)phoneNumber
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
    // NSDictionary *result = [self getDataByPhoneNumber:phoneNumber];
    NSDictionary *result = [dbHelper getDataByPhoneNumber:phoneNumber];
    if (result) {
        resolve(result);
    } else {
        reject(@"db_error", @"No data found", nil);
    }
}

RCT_EXPORT_METHOD(updateDataWithID:(NSInteger)ID
                  phoneNumber:(NSString *)phoneNumber
                  detail:(NSString *)detail
                  reporter:(NSString *)reporter
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
//    if ([self updateDataWithID:(int)ID phoneNumber:phoneNumber detail:detail reporter:reporter]) {
//        resolve(@(YES));
//    } else {
//        reject(@"db_error", @"Failed to update data", nil);
//    }
  DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
  bool result = [dbHelper updateDataWithID:(int)ID phoneNumber:phoneNumber detail:detail reporter:reporter];
  if(result){
    resolve(@(YES));
  }else{
    reject(@"db_error", @"Failed to update data", nil);
  }
}

RCT_EXPORT_METHOD(deleteDataWithID:(NSInteger)ID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  
    DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
    bool result = [dbHelper deleteDataWithID:(int)ID];
  //    if ([self deleteDataWithID:(int)ID]) {
    if(result){
        resolve(@(YES));
    } else {
        reject(@"db_error", @"Failed to delete data", nil);
    }
}
// Other methods like getDataById, getDataByPhoneNumber, etc. can be implemented similarly.


RCT_EXPORT_METHOD(getDatabasePath:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  DatabaseHelper *dbHelper = [[DatabaseHelper alloc] init];
  @try{
    return resolve([dbHelper getDatabasePath]);
  } @catch (NSException *exception) {
    // Handle any exceptions and reject the promise
    reject(@"get_database_path_error", @"Failed to get database path", exception);
  }
}

@end

