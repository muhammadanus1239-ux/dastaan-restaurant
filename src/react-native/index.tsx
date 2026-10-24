// @ts-nocheck
/**
 * React Native & Expo Go Universal Primitives
 * Compatible with both Native Mobile (Expo Go on Android/iOS) and Web Preview.
 */

import React, { forwardRef, useState, useEffect } from 'react';

// Platform detection
export const Platform = {
  OS: (typeof window !== 'undefined' && typeof document !== 'undefined') ? 'web' : 'android',
  select: (obj: any) => obj.web ?? obj.default ?? obj.android ?? obj.ios
};

// Helper to sanitize React Native props from leaking into web DOM elements
function cleanDOMProps(props: any) {
  const {
    accessibilityLabel,
    accessibilityRole,
    accessibilityHint,
    accessibilityState,
    accessibilityValue,
    accessible,
    activeOpacity,
    testID,
    placeholderTextColor,
    secureTextEntry,
    keyboardType,
    numberOfLines,
    multiline,
    resizeMode,
    ...rest
  } = props;

  const domProps: any = { ...rest };

  if (accessibilityLabel && !domProps['aria-label']) {
    domProps['aria-label'] = accessibilityLabel;
  }
  if (accessibilityRole && !domProps.role) {
    domProps.role = accessibilityRole;
  }
  if (testID && !domProps['data-testid']) {
    domProps['data-testid'] = testID;
  }

  return domProps;
}

// --- View ---
export const View = forwardRef<any, any>(({ style, children, className, ...props }, ref) => {
  const domProps = cleanDOMProps(props);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        ...(style || {})
      }}
      {...domProps}
    >
      {children}
    </div>
  );
});
View.displayName = 'View';

// --- Text ---
export const Text = forwardRef<any, any>(({ style, children, className, numberOfLines, ...props }, ref) => {
  const domProps = cleanDOMProps(props);
  const lineClampStyle = numberOfLines
    ? {
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical' as const
      }
    : {};

  return (
    <span
      ref={ref}
      className={className}
      style={{
        boxSizing: 'border-box',
        ...(lineClampStyle || {}),
        ...(style || {})
      }}
      {...domProps}
    >
      {children}
    </span>
  );
});
Text.displayName = 'Text';

// --- TextInput ---
export const TextInput = forwardRef<any, any>(
  (
    {
      style,
      value,
      onChangeText,
      placeholder,
      placeholderTextColor,
      secureTextEntry,
      keyboardType,
      multiline,
      numberOfLines = 4,
      className,
      ...props
    },
    ref
  ) => {
    const domProps = cleanDOMProps(props);

    const handleChange = (e: any) => {
      if (onChangeText) {
        onChangeText(e.target.value);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    if (multiline) {
      return (
        <textarea
          ref={ref}
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          rows={numberOfLines}
          className={className}
          style={{
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            ...(style || {})
          }}
          {...domProps}
        />
      );
    }

    return (
      <input
        ref={ref}
        type={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : 'text'}
        inputMode={keyboardType === 'numeric' ? 'tel' : undefined}
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        style={{
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          ...(style || {})
        }}
        {...domProps}
      />
    );
  }
);
TextInput.displayName = 'TextInput';

// --- TouchableOpacity ---
export const TouchableOpacity = forwardRef<any, any>(
  ({ style, children, onPress, activeOpacity = 0.7, disabled, className, ...props }, ref) => {
    const domProps = cleanDOMProps(props);
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onPress}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          boxSizing: 'border-box',
          ...(style || {})
        }}
        {...domProps}
      >
        {children}
      </button>
    );
  }
);
TouchableOpacity.displayName = 'TouchableOpacity';

// --- Pressable ---
export const Pressable = forwardRef<any, any>(
  ({ style, children, onPress, disabled, className, ...props }, ref) => {
    const domProps = cleanDOMProps(props);
    const resolvedStyle = typeof style === 'function' ? style({ pressed: false }) : style;
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onPress}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box',
          ...(resolvedStyle || {})
        }}
        {...domProps}
      >
        {typeof children === 'function' ? children({ pressed: false }) : children}
      </button>
    );
  }
);
Pressable.displayName = 'Pressable';

// --- ScrollView ---
export const ScrollView = forwardRef<any, any>(
  ({ style, children, horizontal, className, contentContainerStyle, ...props }, ref) => {
    const domProps = cleanDOMProps(props);
    return (
      <div
        ref={ref}
        className={className}
        style={{
          overflowX: horizontal ? 'auto' : 'hidden',
          overflowY: horizontal ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          boxSizing: 'border-box',
          ...(style || {})
        }}
        {...domProps}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            boxSizing: 'border-box',
            ...(contentContainerStyle || {})
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollView.displayName = 'ScrollView';

// --- FlatList ---
export function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  horizontal,
  style,
  contentContainerStyle,
  className
}: any) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', ...(style || {}) }} className={className}>
        {ListHeaderComponent && (typeof ListHeaderComponent === 'function' ? ListHeaderComponent() : ListHeaderComponent)}
        {ListEmptyComponent && (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent)}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        overflowX: horizontal ? 'auto' : 'visible',
        ...(style || {})
      }}
      className={className}
    >
      {ListHeaderComponent && (typeof ListHeaderComponent === 'function' ? ListHeaderComponent() : ListHeaderComponent)}
      <div
        style={{
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          ...(contentContainerStyle || {})
        }}
      >
        {data.map((item: T, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : (item as any)?.id || (item as any)?._id || index;
          return (
            <React.Fragment key={key}>
              {renderItem({ item, index })}
              {ItemSeparatorComponent && index < data.length - 1 && (
                typeof ItemSeparatorComponent === 'function' ? ItemSeparatorComponent() : ItemSeparatorComponent
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// --- Image ---
export const Image = forwardRef<any, any>(({ source, style, resizeMode = 'cover', alt = '', className, ...props }, ref) => {
  const domProps = cleanDOMProps(props);
  const src = typeof source === 'string' ? source : source?.uri || '';
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={{
        objectFit: resizeMode === 'contain' ? 'contain' : 'cover',
        display: 'block',
        boxSizing: 'border-box',
        ...(style || {})
      }}
      {...domProps}
    />
  );
});
Image.displayName = 'Image';

// --- Modal ---
export const Modal: React.FC<any> = ({ visible, transparent, children, onRequestClose }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: transparent ? 'rgba(0, 0, 0, 0.65)' : '#ffffff',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onRequestClose) {
          onRequestClose();
        }
      }}
    >
      {children}
    </div>
  );
};

// --- Alert (React Native Alert.alert) ---
export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

class AlertManager {
  private listeners: ((alertState: any) => void)[] = [];

  subscribe(listener: (alertState: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  alert(title: string, message?: string, buttons?: AlertButton[], options?: any) {
    const alertData = {
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }],
      options
    };
    this.listeners.forEach((listener) => listener(alertData));
  }
}

export const Alert = new AlertManager();

// Global Native Alert Host Container (Safely renders on web, avoids mobile crash)
export const AlertHost: React.FC = () => {
  const [currentAlert, setCurrentAlert] = useState<any>(null);

  useEffect(() => {
    return Alert.subscribe((data) => {
      setCurrentAlert(data);
    });
  }, []);

  if (!currentAlert) return null;

  // If running on native mobile device, avoid DOM rendering
  if (typeof document === 'undefined') return null;

  const handleButtonPress = (btn: AlertButton) => {
    setCurrentAlert(null);
    if (btn.onPress) {
      btn.onPress();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: '#4B1420',
          color: '#F8F1E5',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          border: '1px solid #D4AF37'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#D4AF37', fontFamily: 'serif' }}>
          {currentAlert.title}
        </h3>
        {currentAlert.message && (
          <p style={{ marginTop: '10px', marginBottom: '20px', fontSize: '13px', lineHeight: 1.5, color: '#F8F1E5', opacity: 0.9 }}>
            {currentAlert.message}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
          {currentAlert.buttons.map((btn: AlertButton, idx: number) => {
            const isDestructive = btn.style === 'destructive';
            const isCancel = btn.style === 'cancel';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleButtonPress(btn)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isCancel ? '1px solid rgba(248, 241, 229, 0.3)' : 'none',
                  backgroundColor: isDestructive ? '#DC2626' : isCancel ? 'transparent' : '#D4AF37',
                  color: isDestructive ? '#FFFFFF' : isCancel ? '#F8F1E5' : '#4B1420'
                }}
              >
                {btn.text || 'OK'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- StyleSheet & Platform helpers ---
export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any) => (Array.isArray(style) ? Object.assign({}, ...style) : style || {})
};

export const ActivityIndicator: React.FC<any> = ({ size = 'small', color = '#D4AF37' }) => {
  const dim = size === 'large' ? 36 : 20;
  return (
    <div
      style={{
        width: dim,
        height: dim,
        border: `3px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );
};

export const SafeAreaView = View;
export const StatusBar = () => null;