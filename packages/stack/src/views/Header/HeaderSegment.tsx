import * as React from 'react';
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { getStatusBarHeight } from 'react-native-safe-area-view';
import HeaderTitle from './HeaderTitle';
import HeaderBackButton from './HeaderBackButton';
import HeaderBackground from './HeaderBackground';
import memoize from '../../utils/memoize';
import {
  Layout,
  HeaderStyleInterpolator,
  Route,
  HeaderBackButtonProps,
  HeaderOptions,
  HeaderScene,
} from '../../types';

export type Scene<T> = {
  route: T;
  progress: Animated.Node<number>;
};

type Props = HeaderOptions & {
  layout: Layout;
  onGoBack?: () => void;
  title?: string;
  leftLabel?: string;
  scene: HeaderScene<Route>;
  styleInterpolator: HeaderStyleInterpolator;
};

type State = {
  titleLayout?: Layout;
  leftLabelLayout?: Layout;
};

const warnIfHeaderStyleDefined = (value: any, styleProp: string) => {
  if (styleProp === 'position' && value === 'absolute') {
    console.warn(
      "position: 'absolute' is not supported on headerStyle. If you would like to render content under the header, use the headerTransparent navigationOption."
    );
  } else if (value !== undefined) {
    console.warn(
      `${styleProp} was given a value of ${value}, this has no effect on headerStyle.`
    );
  }
};

export const getDefaultHeaderHeight = (layout: Layout) => {
  const isLandscape = layout.width > layout.height;

  let headerHeight;

  if (Platform.OS === 'ios') {
    // @ts-ignore
    if (isLandscape && !Platform.isPad) {
      headerHeight = 32;
    } else {
      headerHeight = 44;
    }
  } else if (Platform.OS === 'android') {
    headerHeight = 56;
  } else {
    headerHeight = 64;
  }

  return headerHeight + getStatusBarHeight(isLandscape);
};

export default class HeaderSegment extends React.Component<Props, State> {
  state: State = {};

  private handleTitleLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;
    const { titleLayout } = this.state;

    if (
      titleLayout &&
      height === titleLayout.height &&
      width === titleLayout.width
    ) {
      return;
    }

    this.setState({ titleLayout: { height, width } });
  };

  private handleLeftLabelLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;
    const { leftLabelLayout } = this.state;

    if (
      leftLabelLayout &&
      height === leftLabelLayout.height &&
      width === leftLabelLayout.width
    ) {
      return;
    }

    this.setState({ leftLabelLayout: { height, width } });
  };

  private getInterpolatedStyle = memoize(
    (
      styleInterpolator: HeaderStyleInterpolator,
      layout: Layout,
      current: Animated.Node<number>,
      next: Animated.Node<number> | undefined,
      titleLayout: Layout | undefined,
      leftLabelLayout: Layout | undefined
    ) =>
      styleInterpolator({
        progress: {
          current,
          next,
        },
        layouts: {
          screen: layout,
          title: titleLayout,
          leftLabel: leftLabelLayout,
        },
      })
  );

  render() {
    const {
      scene,
      layout,
      title: currentTitle,
      leftLabel: previousTitle,
      onGoBack,
      headerLeft: left = (props: HeaderBackButtonProps) => (
        <HeaderBackButton {...props} />
      ),
      // @ts-ignore
      headerStatusBarHeight = getStatusBarHeight(layout.width > layout.height),
      headerTransparent,
      headerTintColor,
      headerBackground,
      headerRight: right,
      headerBackImage: backImage,
      headerBackTitle: leftLabel,
      headerBackTitleVisible,
      headerTruncatedBackTitle: truncatedLabel,
      headerPressColorAndroid: pressColorAndroid,
      headerBackAllowFontScaling: backAllowFontScaling,
      headerTitleAllowFontScaling: titleAllowFontScaling,
      headerTitleStyle: customTitleStyle,
      headerBackTitleStyle: customLeftLabelStyle,
      headerLeftContainerStyle: leftContainerStyle,
      headerRightContainerStyle: rightContainerStyle,
      headerTitleContainerStyle: titleContainerStyle,
      headerStyle: customHeaderStyle,
      styleInterpolator,
    } = this.props;

    const { leftLabelLayout, titleLayout } = this.state;

    const {
      titleStyle,
      leftButtonStyle,
      leftLabelStyle,
      rightButtonStyle,
      backgroundStyle,
    } = this.getInterpolatedStyle(
      styleInterpolator,
      layout,
      scene.progress.current,
      scene.progress.next,
      titleLayout,
      previousTitle ? leftLabelLayout : undefined
    );

    const {
      height = getDefaultHeaderHeight(layout),
      alignItems,
      justifyContent,
      flex,
      flexDirection,
      flexGrow,
      flexShrink,
      flexBasis,
      flexWrap,
      position,
      padding,
      paddingHorizontal,
      paddingRight,
      paddingLeft,
      paddingVertical,
      paddingTop,
      paddingBottom,
      top,
      right: _right,
      bottom: _bottom,
      left: _left,
      ...safeHeaderStyle
    } = StyleSheet.flatten(customHeaderStyle || {}) as ViewStyle;

    if (process.env.NODE_ENV !== 'production') {
      warnIfHeaderStyleDefined(alignItems, 'alignItems');
      warnIfHeaderStyleDefined(justifyContent, 'justifyContent');
      warnIfHeaderStyleDefined(flex, 'flex');
      warnIfHeaderStyleDefined(flexDirection, 'flexDirection');
      warnIfHeaderStyleDefined(flexGrow, 'flexGrow');
      warnIfHeaderStyleDefined(flexShrink, 'flexShrink');
      warnIfHeaderStyleDefined(flexBasis, 'flexBasis');
      warnIfHeaderStyleDefined(flexWrap, 'flexWrap');
      warnIfHeaderStyleDefined(padding, 'padding');
      warnIfHeaderStyleDefined(position, 'position');
      warnIfHeaderStyleDefined(paddingHorizontal, 'paddingHorizontal');
      warnIfHeaderStyleDefined(paddingRight, 'paddingRight');
      warnIfHeaderStyleDefined(paddingLeft, 'paddingLeft');
      warnIfHeaderStyleDefined(paddingVertical, 'paddingVertical');
      warnIfHeaderStyleDefined(paddingTop, 'paddingTop');
      warnIfHeaderStyleDefined(paddingBottom, 'paddingBottom');
      warnIfHeaderStyleDefined(top, 'top');
      warnIfHeaderStyleDefined(_right, 'right');
      warnIfHeaderStyleDefined(_bottom, 'bottom');
      warnIfHeaderStyleDefined(_left, 'left');
    }

    return (
      <React.Fragment>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, backgroundStyle]}
        >
          {headerBackground ? (
            headerBackground()
          ) : headerTransparent ? null : (
            <HeaderBackground style={safeHeaderStyle} />
          )}
        </Animated.View>
        <Animated.View pointerEvents="box-none" style={[{ height }]}>
          <View
            pointerEvents="none"
            style={{ height: headerStatusBarHeight }}
          />
          <View pointerEvents="box-none" style={styles.content}>
            {onGoBack ? (
              <Animated.View
                style={[styles.left, leftButtonStyle, leftContainerStyle]}
              >
                {left({
                  backImage,
                  pressColorAndroid,
                  allowFontScaling: backAllowFontScaling,
                  onPress: onGoBack,
                  labelVisible: headerBackTitleVisible,
                  label: leftLabel !== undefined ? leftLabel : previousTitle,
                  truncatedLabel,
                  labelStyle: [leftLabelStyle, customLeftLabelStyle],
                  onLabelLayout: this.handleLeftLabelLayout,
                  screenLayout: layout,
                  titleLayout,
                  tintColor: headerTintColor,
                })}
              </Animated.View>
            ) : null}
            {currentTitle ? (
              <Animated.View
                style={[
                  Platform.select({
                    ios: null,
                    default: { left: onGoBack ? 72 : 16 },
                  }),
                  styles.title,
                  titleStyle,
                  titleContainerStyle,
                ]}
              >
                <HeaderTitle
                  onLayout={this.handleTitleLayout}
                  allowFontScaling={titleAllowFontScaling}
                  style={[{ color: headerTintColor }, customTitleStyle]}
                >
                  {currentTitle}
                </HeaderTitle>
              </Animated.View>
            ) : null}
            {right ? (
              <Animated.View
                style={[styles.right, rightButtonStyle, rightContainerStyle]}
              >
                {right({ tintColor: headerTintColor })}
              </Animated.View>
            ) : null}
          </View>
        </Animated.View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  title: Platform.select({
    ios: {},
    default: { position: 'absolute' },
  }),
});
