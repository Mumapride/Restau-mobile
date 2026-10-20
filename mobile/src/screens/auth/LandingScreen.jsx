import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
View,
Text,
StyleSheet,
TouchableOpacity,
Animated,
Easing,
ScrollView,
useWindowDimensions,
Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
Defs,
LinearGradient as SvgLinearGradient,
Stop,
Rect,
} from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/tokens';
import foodLinesPngFrames, { FOOD_LINES_PNG_FPS } from './foodLinesFrames';

const LOGO = require('../../../assets/brand/restau-logo-white.png');

/* -------------------------------------------------------------------------- */
/* Transparent food-lines animation — PNG sequence (alpha-safe iOS + Android)  */
/* -------------------------------------------------------------------------- */
/*
 * Why not expo-video here:
 * - Original master is ProRes 4444 .mov (iOS-only, huge, no Android decoder).
 * - WebM VP9 with alpha plays on Android ExoPlayer only, not iOS AVPlayer.
 * - HEVC-with-alpha .mov plays on iOS 13+ only, not Android ExoPlayer.
 * - expo-video VideoView renders through an opaque surface on Android, so
 *   even a decoded alpha video composites as a black rectangle.
 * PNG frames rendered with <Image> preserve per-pixel alpha on both platforms,
 * need no new native modules, and work in Expo Go (SDK 54).
 *
 * Original master preserved at: mobile/assets/animations/restau-food-lines.mov
 * (do not overwrite or delete it).
 *
 * Verified: 125 transparent PNG frames (540x540 RGBA, 12fps loop covering the
 * complete 10.44s ProRes 4444 master) are registered in
 * ./foodLinesFrames.js and rendered below in the indicator area with
 * <Image>, looping continuously with per-pixel alpha over the green
 * gradient. No substitute visuals, no black rectangle.
 */
// Metro-safe source of truth lives in ./foodLinesFrames.js (static requires only).
const FOOD_LINE_FRAMES = foodLinesPngFrames;
const FOOD_LINES_FPS = FOOD_LINES_PNG_FPS;

const FEATURES = [
{
id: 'qr',
icon: 'qr-code-outline',
//title: 'Quick & Easy',
//subtitle: 'Get your QR code\nin seconds',
},
{
id: 'plans',
icon: 'card-outline',
//title: 'Flexible Plans',
//subtitle: 'Choose a plan\nthat fits you',
},
{
id: 'meals',
icon: 'restaurant-outline',
//title: 'Delicious Meals',
//subtitle: 'Enjoy fresh and\naffordable meals',
},
];

const BUTTON_HEIGHT = 54;
const BUTTON_RADIUS = 18;
const MIN_FEATURE_WIDTH = 112;

/*

These colors are deliberately tuned to the supplied reference:
Bright emerald at the upper-left
↓
rich Restau green through the middle
↓
deep green/forest tone toward the bottom-right
*/
const GRADIENT_TOP_LEFT = '#00a955';
const GRADIENT_MIDDLE = '#006A4D';
const GRADIENT_BOTTOM_RIGHT = '#01291e';

const SHAPE_LIGHT = '#31D66F';
const SHAPE_MID = '#16B86A';
const RING_COLOR = 'rgba(91, 232, 139, 0.38)';

/* -------------------------------------------------------------------------- /
/ Animated background shapes /
/ -------------------------------------------------------------------------- */

const SHAPES = [
{
id: 'tl',
size: 0.49,
side: 'left',
offset: -0.245,
top: '11%',
color: SHAPE_LIGHT,
opacity: 0.55,
dx: 10,
dy: 10,
duration: 9000,
delay: 0,
scaleTo: 1.03,
},
{
id: 'tlRing',
size: 0.58,
side: 'left',
offset: -0.3,
top: '9%',
ring: true,
opacity: 0.7,
dx: -6,
dy: 6,
duration: 11000,
delay: 1500,
scaleTo: 1.03,
},
{
id: 'tr',
size: 0.3,
side: 'right',
offset: -0.08,
top: '5%',
color: SHAPE_MID,
opacity: 0.55,
dx: -10,
dy: 8,
duration: 8000,
delay: 800,
scaleTo: 1.04,
},
{
id: 'trRing',
size: 0.34,
side: 'right',
offset: -0.15,
top: '10%',
ring: true,
opacity: 0.7,
dx: 8,
dy: -6,
duration: 10500,
delay: 2200,
scaleTo: 1.03,
},
{
id: 'mr',
size: 0.37,
side: 'right',
offset: -0.185,
top: '40%',
color: SHAPE_LIGHT,
opacity: 0.5,
dx: -9,
dy: -10,
duration: 9500,
delay: 400,
scaleTo: 1.04,
},
{
id: 'mlRing',
size: 0.31,
side: 'left',
offset: -0.21,
top: '44%',
ring: true,
opacity: 0.7,
dx: 8,
dy: 6,
duration: 12000,
delay: 3000,
scaleTo: 1.04,
},
{
id: 'bl',
size: 0.43,
side: 'left',
offset: -0.23,
top: '69%',
color: SHAPE_MID,
opacity: 0.45,
dx: 9,
dy: -8,
duration: 7500,
delay: 1000,
scaleTo: 1.04,
},
{
id: 'br',
size: 0.55,
side: 'right',
offset: -0.285,
top: '69%',
color: SHAPE_MID,
opacity: 0.45,
dx: -8,
dy: 10,
duration: 10000,
delay: 2600,
scaleTo: 1.04,
},
{
id: 'brRing',
size: 0.4,
side: 'right',
offset: -0.2,
top: '93%',
ring: true,
opacity: 0.7,
dx: 6,
dy: -6,
duration: 9000,
delay: 1800,
scaleTo: 1.03,
},
{
id: 'blCorner',
size: 0.4,
side: 'left',
offset: -0.2,
top: '91%',
color: SHAPE_LIGHT,
opacity: 0.55,
dx: 8,
dy: -8,
duration: 8500,
delay: 3500,
scaleTo: 1.04,
},
];

function DriftingShape({
style,
dx,
dy,
scaleTo,
opacity: base,
duration,
delay,
}) {
const animation = useRef(new Animated.Value(0)).current;

useEffect(() => {
const easing = Easing.inOut(Easing.sin);

const loop = Animated.loop(
  Animated.sequence([
    Animated.timing(animation, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver: true,
    }),
    Animated.timing(animation, {
      toValue: 0,
      duration,
      easing,
      useNativeDriver: true,
    }),
  ]),
);

const timer = setTimeout(() => {
  loop.start();
}, delay);

return () => {
  clearTimeout(timer);
  loop.stop();
};

}, [animation, duration, delay]);

const translateX = animation.interpolate({
inputRange: [0, 1],
outputRange: [0, dx],
});

const translateY = animation.interpolate({
inputRange: [0, 1],
outputRange: [0, dy],
});

const scale = animation.interpolate({
inputRange: [0, 1],
outputRange: [2 - scaleTo, scaleTo],
});

const opacity = animation.interpolate({
inputRange: [0, 1],
outputRange: [base, Math.min(1, base + 0.08)],
});

return (
<Animated.View
pointerEvents="none"
style={[
styles.shape,
style,
{
opacity,
transform: [
{ translateX },
{ translateY },
{ scale },
],
},
]}
/>
);
}

/* -------------------------------------------------------------------------- */
/* Real food-lines loop (transparent PNG frames, indicator area)              */
/* -------------------------------------------------------------------------- */

function FoodLinesIndicator() {
  const hasFrames = FOOD_LINE_FRAMES.length > 0;
  const total = FOOD_LINE_FRAMES.length;
  // Double buffer: visible frame stays mounted until the hidden buffer
  // finishes decoding the next frame (onLoad), so a swap never flashes blank.
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [bufferIndex, setBufferIndex] = useState(hasFrames && total > 1 ? 1 : 0);
  const [ready, setReady] = useState(false);
  const startTimeRef = useRef(0);
  const visibleRef = useRef(0);
  const bufferRef = useRef(hasFrames && total > 1 ? 1 : 0);

  useEffect(() => {
    visibleRef.current = visibleIndex;
  }, [visibleIndex]);

  useEffect(() => {
    bufferRef.current = bufferIndex;
  }, [bufferIndex]);

  // Warm the cache in small chunks (never force 125 bitmaps into memory).
  useEffect(() => {
    if (!hasFrames) {
      return undefined;
    }
    let cancelled = false;
    const uris = [];
    FOOD_LINE_FRAMES.forEach((source) => {
      try {
        const resolved = Image.resolveAssetSource(source);
        if (resolved && resolved.uri) {
          uris.push(resolved.uri);
        }
      } catch {
        // Bundled frames still render without prefetch.
      }
    });
    (async () => {
      const CHUNK = 8;
      for (let i = 0; i < uris.length && !cancelled; i += CHUNK) {
        await Promise.allSettled(uris.slice(i, i + CHUNK).map((uri) => Image.prefetch(uri)));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasFrames]);

  // Safety net so the indicator never stays blank if onLoad is lost.
  useEffect(() => {
    if (!hasFrames || ready) {
      return undefined;
    }
    const fallback = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(fallback);
  }, [hasFrames, ready]);

  // Stable wall-clock timer: derive the expected frame from elapsed time so
  // JS-thread jank causes a catch-up jump, not drift or queued updates.
  useEffect(() => {
    if (!hasFrames || total === 0 || !ready) {
      return undefined;
    }
    const frameMs = 1000 / FOOD_LINES_FPS;
    startTimeRef.current = Date.now() - visibleRef.current * frameMs;
    const pollMs = Math.max(32, Math.floor(frameMs / 2));
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const expected = Math.floor(elapsed / frameMs) % total;
      if (expected !== visibleRef.current && expected !== bufferRef.current) {
        setBufferIndex(expected);
      }
    }, pollMs);
    return () => clearInterval(timer);
  }, [hasFrames, ready, total]);

  // No substitute visuals: without real frames render nothing.
  if (!hasFrames) {
    return null;
  }

  const handleFirstLoad = () => {
    if (!ready) {
      startTimeRef.current = Date.now();
      setReady(true);
    }
  };

  const handleBufferLoad = (loadedIndex) => {
    if (loadedIndex !== bufferRef.current) {
      return;
    }
    if (loadedIndex === visibleRef.current) {
      return;
    }
    visibleRef.current = loadedIndex;
    setVisibleIndex(loadedIndex);
  };

  return (
    <View
      style={styles.foodLinesIndicator}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Image
        source={FOOD_LINE_FRAMES[visibleIndex]}
        style={styles.foodLinesImage}
        resizeMode="contain"
        resizeMethod="resize"
        fadeDuration={0}
        onLoad={handleFirstLoad}
      />
      {ready ? (
        <Image
          source={FOOD_LINE_FRAMES[bufferIndex]}
          style={[styles.foodLinesImage, styles.foodLinesBuffer]}
          resizeMode="contain"
          resizeMethod="resize"
          fadeDuration={0}
          onLoad={() => handleBufferLoad(bufferIndex)}
        />
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- /
/ Landing screen /
/ -------------------------------------------------------------------------- */

export default function LandingScreen({ navigation }) {
const insets = useSafeAreaInsets();
const { width } = useWindowDimensions();

const logoSize = Math.min(
170,
Math.max(120, width * 0.4),
);

const taglineSize = Math.round(
Math.min(24, Math.max(19, width * 0.056)),
);

const featureWidth = Math.max(
MIN_FEATURE_WIDTH,
width / FEATURES.length,
);

const handleFeatureScroll = useCallback(() => {
// The food-lines indicator is a loading-style animation
// rather than a traditional page indicator.
}, []);

return (
<View style={styles.screen}>

  {/* ------------------------------------------------------------------ */}
  {/* Exact-style green gradient background                              */}
  {/* ------------------------------------------------------------------ */}

  <View
    pointerEvents="none"
    style={StyleSheet.absoluteFill}
  >
    <Svg
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFill}
      preserveAspectRatio="none"
    >
      <Defs>
        <SvgLinearGradient
          id="restauBackground"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop
            offset="0%"
            stopColor={GRADIENT_TOP_LEFT}
          />

          <Stop
            offset="42%"
            stopColor={GRADIENT_MIDDLE}
          />

          <Stop
            offset="100%"
            stopColor={GRADIENT_BOTTOM_RIGHT}
          />
        </SvgLinearGradient>
      </Defs>

      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#restauBackground)"
      />
    </Svg>
  </View>

  {/* ------------------------------------------------------------------ */}
  {/* Animated decorative circles                                        */}
  {/* ------------------------------------------------------------------ */}

  <View
    style={styles.shapes}
    pointerEvents="none"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    {SHAPES.map(
      ({
        id,
        size,
        side,
        offset,
        top,
        color,
        ring,
        ...animationProps
      }) => (
        <DriftingShape
          key={id}
          {...animationProps}
          style={[
            {
              width: size * width,
              height: size * width,
              top,
              [side]: offset * width,
            },
            ring
              ? styles.ring
              : {
                  backgroundColor: color,
                },
          ]}
        />
      ),
    )}
  </View>

  {/* ------------------------------------------------------------------ */}
  {/* Main page                                                          */}
  {/* ------------------------------------------------------------------ */}

  <ScrollView
    style={styles.content}
    contentContainerStyle={[
      styles.page,
      {
        paddingTop: insets.top,
      },
    ]}
    showsVerticalScrollIndicator={false}
    bounces={false}
  >

    <View style={styles.topSpacer} />

    {/* ---------------------------------------------------------------- */}
    {/* Logo + tagline                                                   */}
    {/* ---------------------------------------------------------------- */}

    <View style={styles.logoBlock}>

      <Animated.Image
        source={LOGO}
        style={{
          width: logoSize,
          height: logoSize,
        }}
        resizeMode="contain"
        accessible
        accessibilityLabel="Restau logo"
      />

      <Text
        style={[
          styles.tagline,
          {
            fontSize: taglineSize,
            lineHeight: Math.round(taglineSize * 1.4),
          },
        ]}
      >
        Your Campus Meals,
        {'\n'}
        Made Simple
      </Text>

    </View>

    {/* ---------------------------------------------------------------- */}
    {/* Features                                                         */}
    {/* ---------------------------------------------------------------- */}

    <View style={styles.carousel}>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleFeatureScroll}
        accessibilityLabel="Feature highlights"
      >
        {FEATURES.map((feature) => (
          <View
            key={feature.id}
            style={[
              styles.feature,
              {
                width: featureWidth,
              },
            ]}
          >

            <View style={styles.featureIcon}>
              <Ionicons
                name={feature.icon}
                size={28}
                color={COLORS.onPrimary}
              />
            </View>

            <Text style={styles.featureTitle}>
              {feature.title}
            </Text>

            <Text style={styles.featureSubtitle}>
              {feature.subtitle}
            </Text>

          </View>
        ))}
      </ScrollView>

      {/* Real food-lines loop (transparent frames from original .mov) */}
      <FoodLinesIndicator />

    </View>

    {/* ---------------------------------------------------------------- */}
    {/* Bottom actions                                                   */}
    {/* ---------------------------------------------------------------- */}

    <View
      style={[
        styles.cta,
        {
          paddingBottom:
            Math.max(insets.bottom, SPACING.md) +
            SPACING.xl,
        },
      ]}
    >

      <TouchableOpacity
        accessible
        accessibilityRole="button"
        accessibilityLabel="Create an account"
        activeOpacity={0.88}
        onPress={() => navigation.navigate('Register')}
        style={[
          styles.button,
          styles.btnRegister,
        ]}
      >
        <Text style={styles.btnRegisterText}>
          Register
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessible
        accessibilityRole="button"
        accessibilityLabel="Sign in to your account"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Login')}
        style={[
          styles.button,
          styles.btnSignIn,
        ]}
      >
        <Text style={styles.btnSignInText}>
          Sign in
        </Text>
      </TouchableOpacity>

    </View>

  </ScrollView>

</View>

);
}

/* -------------------------------------------------------------------------- /
/ Styles /
/ -------------------------------------------------------------------------- */

const styles = StyleSheet.create({

  content: {
  flex: 1,
  zIndex: 3,
  elevation: 3,
  },

screen: {
flex: 1,
backgroundColor: GRADIENT_BOTTOM_RIGHT,
},

/* ---------------------------------------------------------------------- /
/ Background /
/ ---------------------------------------------------------------------- */

shapes: {
...StyleSheet.absoluteFillObject,
overflow: 'hidden',
zIndex: 2,
elevation: 2,
},

shape: {
position: 'absolute',
borderRadius: 9999,
},

ring: {
backgroundColor: 'transparent',
borderWidth: 1.5,
borderColor: RING_COLOR,
},

/* ---------------------------------------------------------------------- /
/ Page /
/ ---------------------------------------------------------------------- */

page: {
flexGrow: 1,
minHeight: '100%',
},

topSpacer: {
flex: 1,
minHeight: SPACING.md,
},

/* ---------------------------------------------------------------------- /
/ Logo /
/ ---------------------------------------------------------------------- */

logoBlock: {
alignItems: 'center',
paddingHorizontal: SPACING.lg,
},

tagline: {
...TYPOGRAPHY.h2,
fontWeight: '300',
color: COLORS.onPrimary,
textAlign: 'center',
marginTop: SPACING.md,
},

/* ---------------------------------------------------------------------- /
/ Features /
/ ---------------------------------------------------------------------- */

carousel: {
marginTop: SPACING.xl + SPACING.md,
alignItems: 'center',
},

feature: {
alignItems: 'center',
paddingHorizontal: SPACING.sm,
},

featureIcon: {
width: 58,
height: 58,
borderRadius: 29,
backgroundColor: 'rgba(255,255,255,0.14)',
alignItems: 'center',
justifyContent: 'center',
marginBottom: SPACING.md,
},

featureTitle: {
...TYPOGRAPHY.h3,
fontSize: 15,
fontWeight: '600',
color: COLORS.onPrimary,
textAlign: 'center',
marginBottom: SPACING.xs,
},

featureSubtitle: {
...TYPOGRAPHY.bodySmall,
fontSize: 12.5,
lineHeight: 17,
color: 'rgba(255,255,255,0.72)',
textAlign: 'center',
},

/* ---------------------------------------------------------------------- /
/ Food-lines indicator (real transparent frames) /
/ ---------------------------------------------------------------------- */

foodLinesIndicator: {
alignItems: 'center',
justifyContent: 'center',
marginTop: SPACING.xl,
height: 128,
},

foodLinesImage: {
width: 128,
height: 128,
},

// Hidden preload buffer stacked exactly over the visible frame.
foodLinesBuffer: {
position: 'absolute',
opacity: 0,
},

/* ---------------------------------------------------------------------- /
/ Buttons /
/ ---------------------------------------------------------------------- */

cta: {
width: '100%',
maxWidth: 480,
alignSelf: 'center',
paddingHorizontal: SPACING.lg - 2,
marginTop: SPACING.xl + SPACING.lg,
gap: 12,
},

button: {
height: BUTTON_HEIGHT,
borderRadius: BUTTON_RADIUS,
alignItems: 'center',
justifyContent: 'center',
},

btnRegister: {
backgroundColor: '#FFFFFF',
},

btnRegisterText: {
...TYPOGRAPHY.label,
fontSize: 17,
fontWeight: '600',
color: '#087A55',
},

btnSignIn: {
borderWidth: 1.5,
borderColor: 'rgba(255,255,255,0.82)',
backgroundColor: 'rgba(0,60,48,0.08)',
},

btnSignInText: {
...TYPOGRAPHY.label,
fontSize: 17,
fontWeight: '500',
color: COLORS.onPrimary,
},

});
