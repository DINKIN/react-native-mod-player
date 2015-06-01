/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 */
'use strict';

var NativeMethodsMixin     = require('NativeMethodsMixin'),
    NativeModules          = require('NativeModules'),
    PropTypes              = require('ReactPropTypes'),
    React                  = require('React'),
    ReactIOSViewAttributes = require('ReactIOSViewAttributes'),
    StyleSheetPropType     = require('StyleSheetPropType'),
    ViewStylePropTypes     = require('ViewStylePropTypes');

/**
 * <View> - The most fundamental component for building UI, `View` is a
 * container that supports layout with flexbox, style, some touch handling, and
 * accessibility controls, and is designed to be nested inside other views and
 * to have 0 to many children of any type. `View` maps directly to the native
 * view equivalent on whatever platform react is running on, whether that is a
 * `UIView`, `<div>`, `android.view`, etc.  This example creates a `View` that
 * wraps two colored boxes and custom component in a row with padding.
 *
 *  <View style={{flexDirection: 'row', height: 100, padding: 20}}>
 *    <View style={{backgroundColor: 'blue', flex: 0.3}} />
 *    <View style={{backgroundColor: 'red', flex: 0.5}} />
 *    <MyCustomComponent {...customProps} />
 *  </View>
 *
 * By default, `View`s have a primary flex direction of 'column', so children
 * will stack up vertically by default.  `View`s also expand to fill the parent
 * in the direction of the parent's flex direction by default, so in the case of
 * a default parent (flexDirection: 'column'), the children will fill the width,
 * but not the height.
 *
 * Many library components can be treated like plain `Views` in many cases, for
 * example passing them children, setting style, etc.
 *
 * `View`s are designed to be used with `StyleSheet`s for clarity and
 * performance, although inline styles are also supported.  It is common for
 * `StyleSheet`s to be combined dynamically.  See `StyleSheet.js` for more info.
 *
 * Check out `ViewExample.js`, `LayoutExample.js`, and other apps for more code
 * examples.
 */

var StyleConstants = NativeModules.RKUIManager.StyleConstants;

var createReactIOSNativeComponentClass = require('createReactIOSNativeComponentClass');

var stylePropType = StyleSheetPropType(ViewStylePropTypes);


var View = React.createClass({
  statics: {
    pointerEvents: StyleConstants.PointerEventsValues,
    stylePropType
  },

  mixins: [NativeMethodsMixin],

  /**
   * `NativeMethodsMixin` will look for this when invoking `setNativeProps`. We
   * make `this` look like an actual native component class.
   */
  viewConfig: {
    uiViewClassName: 'RCExtendedView',
    validAttributes: ReactIOSViewAttributes.RKView
  },


  render: function() {
    return <RCExtendedView {...this.props} />;
  }
});


var RCExtendedView = createReactIOSNativeComponentClass({
  validAttributes: ReactIOSViewAttributes.RKView,
  uiViewClassName: 'RCExtendedView',
});

var ViewToExport = RCExtendedView;
if (__DEV__) {
  ViewToExport = View;
}

ViewToExport.pointerEvents = View.pointerEvents;
ViewToExport.stylePropType = stylePropType;

module.exports = ViewToExport;
