# Art Assets

Drop your custom art here. Reference in code as `/art/filename.svg`.

## Recommended files to create:

### Diamond Pedestal (replace the SVG in DiamondPedestal.jsx)
- `diamond-safe.svg` — pedestal with diamond, glowing, secure
- `diamond-stolen.svg` — shattered glass, alarm, empty pedestal
- `diamond-missing.svg` — empty pedestal, dust, eerie

### Role Reveal Cards (shown when game starts)
- `role-guard.svg` — guard badge / shield
- `role-conman.svg` — mask / disguise
- `role-insider.svg` — handshake / double agent

### Screen Backgrounds
- `night-bg.png` — dark vault corridor for night screen
- `lobby-bg.png` — vault entrance for lobby
- `vote-bg.png` — interrogation room

### Misc
- `vault-logo.svg` — game logo for home screen
- `sleep.svg` — sleeping guard for off-duty screen

## How to use:
In any component: `<img src="/art/diamond-safe.svg" alt="diamond" />`
Or as background: `style={{ backgroundImage: 'url(/art/night-bg.png)' }}`
