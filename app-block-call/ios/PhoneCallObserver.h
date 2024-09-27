//
//  PhoneCallObserver.h
//  YourProjectName
//
//  Created by Somkid on 25/9/2024.
//

//#import "RCTEventEmitter.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CallKit/CallKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface PhoneCallObserver : RCTEventEmitter <RCTBridgeModule, CXCallObserverDelegate>
@property (nonatomic, strong) CXCallObserver *callObserver;

@end

NS_ASSUME_NONNULL_END
