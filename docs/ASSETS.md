# Assets Documentation

This document covers the asset management system and visual resources used in the Expo Mobile Skeleton app.

## Overview

The app uses a comprehensive asset management system for icons, images, splash screens, and other visual resources. All assets are optimized for cross-platform deployment and different screen densities.

## Asset Structure

```
assets/
├── icons/              # App icons and favicons
│   ├── icon.png       # Main app icon (1024x1024)
│   ├── adaptive-icon.png  # Android adaptive icon (1024x1024)
│   └── favicon.png    # Web favicon (48x48)
├── splash/            # Splash screen assets
│   └── splash-icon.png    # Splash screen image
└── README.md          # Asset documentation
```

## Icon System

### App Icon Requirements

#### iOS App Icon (icon.png)

- **Size**: 1024x1024 pixels
- **Format**: PNG without transparency
- **Design**: No rounded corners (iOS handles automatically)
- **Content**: Should be recognizable at all sizes (16px to 1024px)

#### Android Adaptive Icon (adaptive-icon.png)

- **Size**: 1024x1024 pixels
- **Format**: PNG with or without transparency
- **Safe Area**: Keep important content within center 768x768 pixels
- **Adaptive**: Should work with circular, rounded square, and square masks

#### Web Favicon (favicon.png)

- **Size**: 48x48 pixels (minimum)
- **Format**: PNG with transparency support
- **Scalability**: Should remain clear when scaled down
- **Contrast**: Should work on both light and dark backgrounds

### Icon Generation Workflow

1. **Design Master Icon**: Create a 1024x1024 master design
2. **Test Adaptive Cropping**: Ensure design works when cropped to different shapes
3. **Generate Variants**: Create platform-specific versions
4. **Test Across Devices**: Verify appearance on different devices and contexts

## Splash Screen System

### Splash Screen Configuration

The app uses Expo's splash screen system with the following configuration:

```javascript
// app.json
{
  "expo": {
    "splash": {
      "image": "./assets/splash/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### Splash Screen Requirements

- **Size**: 1242x2436 pixels (iPhone X resolution)
- **Format**: PNG with transparency
- **Content**: Centered design that works on various screen ratios
- **Background**: Transparent or solid color matching app theme

### Responsive Splash Design

The splash screen should work across different screen sizes:

- **Portrait**: 9:16 to 9:21 aspect ratios
- **Landscape**: 16:9 to 21:9 aspect ratios
- **Square**: 1:1 aspect ratio (rare but possible)

## Asset Optimization

### Image Optimization Tools

1. **ImageOptim** (macOS): Lossless compression
2. **TinyPNG**: Online PNG/JPEG compression
3. **Squoosh**: Google's web-based image optimizer
4. **Sharp**: Node.js image processing library

### Optimization Guidelines

- **PNG**: Use for icons, logos, and images with transparency
- **JPEG**: Use for photographs and complex images
- **WebP**: Consider for web platform when supported
- **SVG**: Use for simple vector graphics when possible

### Automated Optimization

```javascript
// Example optimization script
const sharp = require('sharp');

async function optimizeIcon(inputPath, outputPath, size) {
  await sharp(inputPath)
    .resize(size, size)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(outputPath);
}

// Generate multiple icon sizes
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
sizes.forEach(size => {
  optimizeIcon('master-icon.png', `icon-${size}.png`, size);
});
```

## Platform-Specific Assets

### iOS Assets

- **App Icon**: Automatically generated from icon.png
- **Launch Screen**: Uses splash configuration
- **Tab Bar Icons**: Vector icons from icon libraries
- **Navigation Icons**: System icons or custom vectors

### Android Assets

- **Adaptive Icon**: Uses adaptive-icon.png
- **Launch Screen**: Uses splash configuration
- **Notification Icons**: Monochrome versions of app icon
- **Action Bar Icons**: Material Design icons

### Web Assets

- **Favicon**: Uses favicon.png
- **PWA Icons**: Generated from main app icon
- **Open Graph Images**: Social media preview images
- **Apple Touch Icons**: iOS web app icons

## Dynamic Assets

### Theme-Aware Assets

Some assets may need theme-specific versions:

```typescript
// Theme-aware asset loading
const getThemedAsset = (assetName: string, theme: 'light' | 'dark') => {
  return require(`../assets/images/${theme}/${assetName}`);
};

// Usage in components
const logoSource = getThemedAsset('logo.png', currentTheme);
```

### Responsive Images

For images that need to adapt to screen density:

```typescript
// Responsive image component
const ResponsiveImage = ({ source, style, ...props }) => {
  const { width } = useWindowDimensions();
  const imageSource = width > 768 ? source.large : source.small;

  return <Image source={imageSource} style={style} {...props} />;
};
```

## Asset Loading Performance

### Lazy Loading

```typescript
// Lazy load heavy assets
const HeavyImageComponent = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload image
    Image.prefetch(heavyImageUri).then(() => {
      setImageLoaded(true);
    });
  }, []);

  return imageLoaded ? (
    <Image source={{ uri: heavyImageUri }} />
  ) : (
    <ActivityIndicator />
  );
};
```

### Caching Strategy

```typescript
// Image caching configuration
const cacheConfig = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxSize: 50 * 1024 * 1024, // 50MB
  enableCache: true,
};
```

## Asset Management Tools

### Design Tools

1. **Figma**: Collaborative design with export presets
2. **Sketch**: macOS design tool with symbol libraries
3. **Adobe XD**: Cross-platform design tool
4. **Canva**: Simple icon and graphic creation

### Generation Tools

1. **App Icon Generator**: Automated icon generation
2. **Adaptive Icon Generator**: Android adaptive icon creation
3. **Favicon Generator**: Multi-format favicon creation
4. **Splash Screen Generator**: Responsive splash screen creation

### Validation Tools

1. **iOS Simulator**: Test icons and splash screens
2. **Android Emulator**: Test adaptive icons and themes
3. **Browser DevTools**: Test web assets and PWA icons
4. **Real Device Testing**: Final validation on actual devices

## Asset Guidelines

### Design Principles

1. **Consistency**: Maintain visual consistency across all assets
2. **Scalability**: Ensure assets work at all required sizes
3. **Accessibility**: Consider color contrast and visibility
4. **Brand Alignment**: Align with overall brand guidelines

### Technical Requirements

1. **File Formats**: Use appropriate formats for each asset type
2. **Compression**: Optimize file sizes without quality loss
3. **Naming**: Use consistent, descriptive file names
4. **Organization**: Maintain clear directory structure

### Quality Assurance

1. **Cross-Platform Testing**: Test on iOS, Android, and web
2. **Device Testing**: Test on various screen sizes and densities
3. **Theme Testing**: Verify assets work with different themes
4. **Performance Testing**: Monitor asset loading performance

## Troubleshooting

### Common Issues

1. **Blurry Icons**: Ensure proper pixel density and sizing
2. **Splash Screen Delays**: Optimize splash image size and format
3. **Missing Assets**: Verify file paths and naming conventions
4. **Platform Differences**: Test platform-specific asset rendering

### Debug Commands

```bash
# Check asset sizes
du -sh assets/**/*

# Validate image formats
file assets/**/*.png

# Test asset loading
npm run test:assets
```

This asset management system ensures consistent, high-quality visual presentation across all platforms while maintaining optimal performance and user experience.
