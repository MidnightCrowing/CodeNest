use std::sync::Mutex;

use serde::Serialize;
use tauri::{ipc::Channel, AppHandle, State};
use tauri_plugin_updater::{Update, UpdaterExt};

#[derive(Default)]
pub struct PendingUpdate(Mutex<Option<Update>>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckUpdateResult {
    has_update: bool,
    current_version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    latest_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    published_at: Option<String>,
}

#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data")]
pub enum DownloadEvent {
    #[serde(rename_all = "camelCase")]
    Started {
        content_length: Option<u64>,
    },
    #[serde(rename_all = "camelCase")]
    Progress {
        chunk_length: usize,
    },
    Finished,
}

fn store_pending_update(
    pending_update: &State<'_, PendingUpdate>,
    update: Option<Update>,
) -> Result<(), String> {
    *pending_update
        .0
        .lock()
        .map_err(|_| "Update state is unavailable".to_string())? = update;
    Ok(())
}

#[tauri::command]
pub async fn check_update(
    app: AppHandle,
    pending_update: State<'_, PendingUpdate>,
) -> Result<CheckUpdateResult, String> {
    let current_version = app.package_info().version.to_string();
    let update = app
        .updater()
        .map_err(|error| error.to_string())?
        .check()
        .await
        .map_err(|error| error.to_string())?;

    let result = match update.as_ref() {
        Some(update) => CheckUpdateResult {
            has_update: true,
            current_version: update.current_version.clone(),
            latest_version: Some(update.version.clone()),
            notes: update.body.clone(),
            published_at: update.date.map(|date| date.to_string()),
        },
        None => CheckUpdateResult {
            has_update: false,
            current_version,
            latest_version: None,
            notes: None,
            published_at: None,
        },
    };

    store_pending_update(&pending_update, update)?;
    Ok(result)
}

#[tauri::command]
pub async fn install_update(
    app: AppHandle,
    pending_update: State<'_, PendingUpdate>,
    on_event: Channel<DownloadEvent>,
) -> Result<(), String> {
    let update = pending_update
        .0
        .lock()
        .map_err(|_| "Update state is unavailable".to_string())?
        .take()
        .ok_or_else(|| "There is no pending update".to_string())?;

    log::info!(
        "Installing CodeNest update from {} to {}",
        update.current_version,
        update.version
    );

    let mut started = false;
    update
        .download_and_install(
            |chunk_length, content_length| {
                if !started {
                    let _ = on_event.send(DownloadEvent::Started { content_length });
                    started = true;
                }
                let _ = on_event.send(DownloadEvent::Progress { chunk_length });
            },
            || {
                let _ = on_event.send(DownloadEvent::Finished);
            },
        )
        .await
        .map_err(|error| error.to_string())?;

    log::info!("CodeNest update installed; restarting application");
    app.restart();
}
