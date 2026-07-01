import React, { useCallback, forwardRef, useRef, useLayoutEffect } from 'react';
import { 
  FlatList, 
  FlatListProps, 
  Platform, 
  NativeSyntheticEvent, 
  NativeScrollEvent, 
  LayoutChangeEvent 
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const RUBBER_BAND_C = 0.55;
const SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
  overshootClamping: false,
};

export interface ElasticFlatListProps<T> extends FlatListProps<T> {
  horizontal?: boolean;
  elastic?: boolean;
}

function useLatestCallback<T extends (...args: any[]) => any>(callback?: T): T | undefined {
  const ref = useRef<T | undefined>(callback);
  useLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);
  
  // @ts-ignore
  return useCallback((...args: Parameters<T>) => ref.current?.(...args), []);
}

interface AndroidElasticFlatListProps<T> extends ElasticFlatListProps<T> {
  forwardedRef: React.ForwardedRef<FlatList<T>>;
}

function AndroidElasticFlatList<T>(props: AndroidElasticFlatListProps<T>) {
  const {
    horizontal = false,
    style,
    contentContainerStyle,
    onScroll: _onScroll,
    onContentSizeChange: _onContentSizeChange,
    onLayout: _onLayout,
    forwardedRef,
    ...rest
  } = props;

  const scrollOffset = useSharedValue(0);
  const contentSize = useSharedValue(0);
  const viewportSize = useSharedValue(0);
  const translation = useSharedValue(0);
  const isOverscrolling = useSharedValue(false);

  const startTouchX = useSharedValue(0);
  const startTouchY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        horizontal 
          ? { translateX: translation.value } 
          : { translateY: translation.value }
      ]
    };
  });

  function edgeDirection(delta: number) {
    'worklet';
    const maxScroll = Math.max(0, contentSize.value - viewportSize.value);
    const atStart = scrollOffset.value <= 1;
    const atEnd = scrollOffset.value >= maxScroll - 1;
    
    if (atStart && delta > 0) return 1;
    if (atEnd && delta < 0) return -1;
    return 0;
  }

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((e) => {
      'worklet';
      if (e.allTouches.length > 0) {
        startTouchX.value = e.allTouches[0].x;
        startTouchY.value = e.allTouches[0].y;
      }
    })
    .onTouchesMove((e, stateManager) => {
      'worklet';
      if (e.allTouches.length > 0) {
        const deltaX = e.allTouches[0].x - startTouchX.value;
        const deltaY = e.allTouches[0].y - startTouchY.value;
        const delta = horizontal ? deltaX : deltaY;
        
        if (Math.abs(delta) > 10) {
          const dir = edgeDirection(delta);
          
          if (dir !== 0 || isOverscrolling.value) {
            stateManager.activate();
          } else {
            stateManager.fail();
          }
        }
      }
    })
    .onUpdate((e) => {
      'worklet';
      const delta = horizontal ? e.translationX : e.translationY;
      const dir = edgeDirection(delta);
      if (dir === 0 && !isOverscrolling.value) return;
      
      isOverscrolling.value = true;
      
      if (viewportSize.value <= 0) {
        translation.value = delta * 0.35;
      } else {
        const abs = Math.abs(delta);
        const damped = (viewportSize.value * RUBBER_BAND_C * abs) / (viewportSize.value + RUBBER_BAND_C * abs);
        translation.value = delta < 0 ? -damped : damped;
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isOverscrolling.value) return;
      isOverscrolling.value = false;
      translation.value = withSpring(0, SPRING_CONFIG);
    })
    .onFinalize(() => {
      'worklet';
      if (isOverscrolling.value) {
        isOverscrolling.value = false;
        translation.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const latestOnScroll = useLatestCallback(_onScroll);
  const latestOnContentSizeChange = useLatestCallback(_onContentSizeChange);
  const latestOnLayout = useLatestCallback(_onLayout);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.value = horizontal
      ? event.nativeEvent.contentOffset.x
      : event.nativeEvent.contentOffset.y;
      
    if (latestOnScroll) {
      latestOnScroll(event);
    }
  }, [horizontal, latestOnScroll, scrollOffset]);

  const onContentSizeChange = useCallback((w: number, h: number) => {
    contentSize.value = horizontal ? w : h;
    if (latestOnContentSizeChange) {
      latestOnContentSizeChange(w, h);
    }
  }, [horizontal, latestOnContentSizeChange, contentSize]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    viewportSize.value = horizontal ? width : height;
    if (latestOnLayout) {
      latestOnLayout(event);
    }
  }, [horizontal, latestOnLayout, viewportSize]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animatedStyle]}>
        <FlatList
          ref={forwardedRef}
          horizontal={horizontal}
          overScrollMode="never"
          bounces={false}
          contentContainerStyle={contentContainerStyle}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={16}
          {...rest}
        />
      </Animated.View>
    </GestureDetector>
  );
}

function ElasticFlatListInner<T>(
  props: ElasticFlatListProps<T>,
  ref: React.ForwardedRef<FlatList<T>>
) {
  const { 
    horizontal = false, 
    elastic = true, 
    style, 
    contentContainerStyle, 
    onScroll,
    onContentSizeChange,
    onLayout,
    ...rest 
  } = props;

  if (Platform.OS === 'ios' || !elastic) {
    return (
      <FlatList
        ref={ref}
        horizontal={horizontal}
        bounces={elastic !== false}
        style={style}
        contentContainerStyle={contentContainerStyle}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        {...rest}
      />
    );
  }

  return (
    <AndroidElasticFlatList
      horizontal={horizontal}
      style={style}
      contentContainerStyle={contentContainerStyle}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      forwardedRef={ref}
      {...rest}
    />
  );
}

export const ElasticFlatList = forwardRef(ElasticFlatListInner) as <T>(
  props: ElasticFlatListProps<T> & { ref?: React.ForwardedRef<FlatList<T>> }
) => React.ReactElement;
