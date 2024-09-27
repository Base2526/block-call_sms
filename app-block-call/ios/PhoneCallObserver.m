//
//  PhoneCallObserver.m
//  YourProjectName
//
//  Created by Somkid on 25/9/2024.
//

#import "PhoneCallObserver.h"

@implementation PhoneCallObserver

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    _callObserver = [[CXCallObserver alloc] init];
    [_callObserver setDelegate:self queue:nil];
  }
  return self;
}

// Override the supportedEvents method
- (NSArray<NSString *> *)supportedEvents {
  return @[@"CallConnected", @"OutgoingCall", @"CallEnded"];
}

- (void)callObserver:(CXCallObserver *)callObserver callChanged:(CXCall *)call {
  NSLog(@"callObserver");
  if (call.hasConnected) {
//    [self sendEventWithName:@"CallConnected" body:@{@"callUUID": call.uuid.UUIDString}];
  } else if (call.isOutgoing) {
//    [self sendEventWithName:@"OutgoingCall" body:@{@"callUUID": call.uuid.UUIDString}];
  } else if (call.hasEnded) {
//    [self sendEventWithName:@"CallEnded" body:@{@"callUUID": call.uuid.UUIDString}];
  }
}


@end
