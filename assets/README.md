# App Assets

This directory contains all the visual assets for the Expo Mobile Skeleton app.

## Directory Structure

```
assets/
├── icons/
│   ├── icon.png              # Main app icon (1024x1024)
│   ├── adaptive-icon.png     # Android adaptive icon (1024x1024)
│   └── favicon.png           # Web favicon (48x48)
├── splash/
│   └── splash-icon.png       # Splash screen image
└── README.md                 # This file
```

## Icon Requirements

### iOS App Icon (icon.png)

- Size: 1024x1024 pixels
- Format: PNG
- No transparency
- No rounded corners (iOS handles this automatically)

### Android Adaptive Icon (adaptive-icon.png)

- Size: 1024x1024 pixels
- Format: PNG
- Should work well when cropped to different shapes
- Keep important content in the center 768x768 area

### Web Favicon (favicon.png)

- Size: 48x48 pixels (minimum)
- Format: PNG
- Should be recognizable at small sizes

### Splash Screen (splash-icon.png)

- Recommended size: 1242x2436 pixels
- Format: PNG
- Should work well on different screen sizes
- Keep important content centered

## Asset Generation Tools

You can use tools like:

- [App Icon Generator](https://appicon.co/)
- [Adaptive Icon Generator](https://adapticon.com/)
- [Figma](https://figma.com) with export presets
- [Sketch](https://sketch.com) with export presets

## Updating Assets

1. Replace the appropriate file in the correct directory
2. Ensure the file names match exactly
3. Test on both iOS and Android devices
4. Verify splash screen appears correctly on different screen sizes
