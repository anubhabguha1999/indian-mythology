import { useEffect } from 'react'

/**
 * Sets `document.title` while the calling component is mounted, restoring
 * whatever it was before on unmount. `index.html`'s `<title>` is one
 * static string ("KALI · The Power Beyond Time") shared by every route —
 * nothing anywhere in the app was overriding it per page, so every route
 * (not just /shiva) shows Kali's title in the tab regardless of which
 * page is actually open.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
