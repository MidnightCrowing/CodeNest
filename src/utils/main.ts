export async function openLink(url: string | undefined) {
  if (url)
    await window.api.openExternal(url)
}
