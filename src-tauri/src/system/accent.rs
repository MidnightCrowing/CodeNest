pub(super) fn set_window_theme(_current_theme: String) {}

#[cfg(target_os = "windows")]
use winreg::{enums::HKEY_CURRENT_USER, RegKey};

#[cfg(target_os = "windows")]
#[link(name = "dwmapi")]
extern "system" {
    fn DwmGetColorizationColor(colorization: *mut u32, opaque_blend: *mut i32) -> i32;
}

#[cfg(target_os = "windows")]
const WINDOWS_ACCENT_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Accent";

#[cfg(target_os = "windows")]
fn rgb_to_hex(red: u32, green: u32, blue: u32) -> String {
    format!("#{red:02x}{green:02x}{blue:02x}")
}

#[cfg(target_os = "windows")]
fn abgr_to_hex(color: u32) -> String {
    let red = color & 0xff;
    let green = (color >> 8) & 0xff;
    let blue = (color >> 16) & 0xff;
    rgb_to_hex(red, green, blue)
}

#[cfg(target_os = "windows")]
fn argb_to_hex(color: u32) -> String {
    let red = (color >> 16) & 0xff;
    let green = (color >> 8) & 0xff;
    let blue = color & 0xff;
    rgb_to_hex(red, green, blue)
}

#[cfg(target_os = "windows")]
fn read_windows_accent_palette_color(current_theme: Option<&str>) -> Option<String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let accent_key = hkcu.open_subkey(WINDOWS_ACCENT_KEY).ok()?;
    let palette = accent_key.get_raw_value("AccentPalette").ok()?.bytes;
    let palette_index = if current_theme == Some("dark") { 2 } else { 4 };
    let offset = palette_index * 4;

    if palette.len() < offset + 3 {
        return None;
    }

    Some(rgb_to_hex(
        palette[offset].into(),
        palette[offset + 1].into(),
        palette[offset + 2].into(),
    ))
}

#[cfg(target_os = "windows")]
fn read_windows_accent_color_menu() -> Option<String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let accent_key = hkcu.open_subkey(WINDOWS_ACCENT_KEY).ok()?;
    let color = accent_key.get_value::<u32, _>("AccentColorMenu").ok()?;
    Some(abgr_to_hex(color))
}

#[cfg(target_os = "windows")]
fn read_windows_dwm_accent_color() -> Option<String> {
    unsafe {
        let mut color = 0_u32;
        let mut opaque_blend = 0_i32;
        if DwmGetColorizationColor(&mut color, &mut opaque_blend) == 0 {
            return Some(argb_to_hex(color));
        }
    }

    None
}

pub(super) fn get_system_accent_color(current_theme: Option<String>) -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        let current_theme = current_theme.as_deref();
        read_windows_accent_palette_color(current_theme)
            .or_else(read_windows_accent_color_menu)
            .or_else(read_windows_dwm_accent_color)
    }

    #[cfg(not(target_os = "windows"))]
    None
}
