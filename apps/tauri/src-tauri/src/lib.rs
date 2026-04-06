#[cfg(desktop)]
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::Emitter;
#[cfg(desktop)]
use tauri::Manager;
#[cfg(desktop)]
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
#[cfg(desktop)]
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};

#[cfg(desktop)]
#[allow(dead_code)]
struct TrayState(Mutex<Option<TrayIcon<tauri::Wry>>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(desktop)]
    let builder = builder
        .menu(|handle| {
            let bible_item = MenuItem::with_id(handle, "nav_bible", "Biblia", true, Some("CmdOrCtrl+B"))?;
            let hymnal_item = MenuItem::with_id(handle, "nav_hymnal", "Hinario", true, Some("CmdOrCtrl+H"))?;
            let prayer_item = MenuItem::with_id(handle, "nav_prayer", "Oracao", true, Some("CmdOrCtrl+P"))?;
            let directory_item = MenuItem::with_id(handle, "nav_directory", "Diretorio", true, Some("CmdOrCtrl+D"))?;
            let events_item = MenuItem::with_id(handle, "nav_events", "Eventos", true, Some("CmdOrCtrl+E"))?;

            let navigate_menu = Submenu::with_items(
                handle,
                "Navegar",
                true,
                &[&bible_item, &hymnal_item, &prayer_item, &directory_item, &events_item],
            )?;

            let app_menu = Submenu::with_items(handle, "App", true, &[&PredefinedMenuItem::quit(handle, None)?])?;

            Menu::with_items(handle, &[&app_menu, &navigate_menu])
        })
        .on_menu_event(|app, event| {
            let event_id = event.id().0.as_str();

            if event_id == "tray_quit" {
                app.exit(0);
                return;
            }

            if event_id == "tray_show" {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                return;
            }

            let route = match event_id {
                "nav_bible" => Some("/biblia"),
                "nav_hymnal" => Some("/hinario"),
                "nav_prayer" => Some("/member/prayer"),
                "nav_directory" => Some("/member/directory"),
                "nav_events" => Some("/member/events"),
                _ => None,
            };

            if let Some(route) = route {
                let _ = app.emit("navigate", route);
            }
        })
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

            #[cfg(desktop)]
            {
                let handle = app.handle();
                let show_item = MenuItem::with_id(handle, "tray_show", "Abrir Filadelfias", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(handle, "tray_quit", "Sair", true, None::<&str>)?;
                let tray_menu = Menu::with_items(handle, &[&show_item, &quit_item])?;

                if let Some(icon) = app.default_window_icon() {
                    let tray = TrayIconBuilder::with_id("main-tray")
                        .icon(icon.clone())
                        .tooltip("Filadelfias")
                        .menu(&tray_menu)
                        .show_menu_on_left_click(false)
                        .on_tray_icon_event(|tray, event| {
                            if let TrayIconEvent::Click {
                                button: MouseButton::Left,
                                button_state: MouseButtonState::Up,
                                ..
                            } = event
                            {
                                let app = tray.app_handle();
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        })
                        .build(app)?;
                    // Keep TrayIcon alive for the lifetime of the app.
                    app.manage(TrayState(Mutex::new(Some(tray))));
                }
            }

            Ok(())
        });

    builder
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_haptics::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
