#import "AppIconModule.h"
#import <React/RCTLog.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <AppIconSpec/AppIconSpec.h>
#endif

// Forward declaration of the Swift class
@interface AppIconModuleImpl : NSObject
+ (instancetype)shared;
- (void)changeIcon:(NSString *)iconName resolve:(void (^)(id result))resolve reject:(void (^)(NSString *code, NSString *message, NSError *error))reject;
- (void)getCurrentIcon:(void (^)(id result))resolve reject:(void (^)(NSString *code, NSString *message, NSError *error))reject;
- (void)getAvailableIcons:(void (^)(id result))resolve reject:(void (^)(NSString *code, NSString *message, NSError *error))reject;
- (void)resetIcon:(void (^)(id result))resolve reject:(void (^)(NSString *code, NSString *message, NSError *error))reject;
@end

@implementation AppIconModule

RCT_EXPORT_MODULE(AppIconModule)

- (AppIconModuleImpl *)swiftImpl {
    return [AppIconModuleImpl shared];
}

// Don't need to run on main queue, the Swift code will dispatch to main queue if needed
- (dispatch_queue_t)methodQueue
{
    return dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
}

RCT_EXPORT_METHOD(changeIcon:(NSString *)iconName resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[self swiftImpl] changeIcon:iconName resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getCurrentIcon:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[self swiftImpl] getCurrentIcon:resolve reject:reject];
}

RCT_EXPORT_METHOD(getAvailableIcons:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[self swiftImpl] getAvailableIcons:resolve reject:reject];
}

RCT_EXPORT_METHOD(resetIcon:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[self swiftImpl] resetIcon:resolve reject:reject];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAppIconModuleSpecJSI>(params);
}
#endif

@end
