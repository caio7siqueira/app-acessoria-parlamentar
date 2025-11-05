"use strict";exports.id=596,exports.ids=[596],exports.modules={4484:(t,e,n)=>{/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var o=n(9885),r="function"==typeof Object.is?Object.is:function(t,e){return t===e&&(0!==t||1/t==1/e)||t!=t&&e!=e},u=o.useState,c=o.useEffect,s=o.useLayoutEffect,a=o.useDebugValue;function checkIfSnapshotChanged(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!r(t,n)}catch(t){return!0}}var i="undefined"==typeof window||void 0===window.document||void 0===window.document.createElement?function(t,e){return e()}:function(t,e){var n=e(),o=u({inst:{value:n,getSnapshot:e}}),r=o[0].inst,i=o[1];return s(function(){r.value=n,r.getSnapshot=e,checkIfSnapshotChanged(r)&&i({inst:r})},[t,n,e]),c(function(){return checkIfSnapshotChanged(r)&&i({inst:r}),t(function(){checkIfSnapshotChanged(r)&&i({inst:r})})},[t]),a(n),n};e.useSyncExternalStore=void 0!==o.useSyncExternalStore?o.useSyncExternalStore:i},1928:(t,e,n)=>{t.exports=n(4484)},1214:(t,e,n)=>{n.d(e,{$:()=>r});var o=n(1928);let r=o.useSyncExternalStore},4713:(t,e,n)=>{n.d(e,{L:()=>shouldThrowError});function shouldThrowError(t,e){return"function"==typeof t?t(...e):!!t}}};