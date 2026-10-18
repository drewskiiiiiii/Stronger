# Manual iPhone checklist

Automated tests run in desktop Chromium at iPhone Pro Max size. These need a real iPhone (Safari, and again from the Home Screen icon):

1. Add to Home Screen; open it from the icon. The status bar and bottom bar sit clear of the notch / home indicator.
2. Airplane mode, force-quit, reopen: the app still opens.
3. Import a program file. Confirm it appears and its details match the source.
4. Start a workout. Tap a weight field: the keyboard must not hide the field or the ✓ button.
5. Check off a set, tap **⌂ Home**, visit Calendar / Progress / Program, tap the blue banner: the set is still checked and the timer kept running.
6. Lock the phone for a minute, unlock: workout time and rest timer are correct (they use timestamps).
7. Force-quit Safari mid-workout, reopen: tap the banner; your entries are still there.
8. Rotate or use a smaller iPhone: no sideways scrolling, buttons still reachable.
9. Settings → Export backup: the file saves/shares; Restore backup brings data back.
10. Settings shows whether browser storage protection was granted.
