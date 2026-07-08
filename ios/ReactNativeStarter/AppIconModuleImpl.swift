import Foundation
import UIKit

@objc(AppIconModuleImpl)
public class AppIconModuleImpl: NSObject {
    
    @objc public static let shared = AppIconModuleImpl()
    
    private let availableIcons = [
        "premium",
        "dark",
        "gold",
        "holiday",
        "christmas",
        "diwali",
        "diwali-gold",
        "christmas-gold",
        "holi",
        "holi-gold",
        "halloween",
        "halloween-gold",
        "newyear",
        "newyear-gold"
    ]
    
    @objc public func changeIcon(_ iconName: String, resolve: @escaping (Any?) -> Void, reject: @escaping (String, String, Error?) -> Void) {
        guard UIApplication.shared.supportsAlternateIcons else {
            reject("UNSUPPORTED", "Alternate icons are not supported on this device.", nil)
            return
        }
        
        let targetIcon: String? = (iconName.lowercased() == "default") ? nil : iconName.lowercased()
        
        if let target = targetIcon, !availableIcons.contains(target) {
            reject("INVALID_ICON", "Icon '\(iconName)' is not supported.", nil)
            return
        }
        
        DispatchQueue.main.async {
            UIApplication.shared.setAlternateIconName(targetIcon) { error in
                if let error = error {
                    reject("CHANGE_ICON_FAILED", error.localizedDescription, error)
                } else {
                    resolve(true)
                }
            }
        }
    }
    
    @objc public func getCurrentIcon(_ resolve: @escaping (Any?) -> Void, reject: @escaping (String, String, Error?) -> Void) {
        DispatchQueue.main.async {
            let current = UIApplication.shared.alternateIconName ?? "default"
            resolve(current)
        }
    }
    
    @objc public func getAvailableIcons(_ resolve: @escaping (Any?) -> Void, reject: @escaping (String, String, Error?) -> Void) {
        var allIcons = ["default"]
        allIcons.append(contentsOf: availableIcons)
        resolve(allIcons)
    }
    
    @objc public func resetIcon(_ resolve: @escaping (Any?) -> Void, reject: @escaping (String, String, Error?) -> Void) {
        changeIcon("default", resolve: resolve, reject: reject)
    }
}
