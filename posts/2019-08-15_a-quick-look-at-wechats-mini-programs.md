---
layout: layouts/post.njk
title: "A Quick Look At WeChat's Mini Programs"
author: "Thomas Steiner"
date: "2019-08-15T11:59:52"
permalink: 2019/08/15/a-quick-look-at-wechats-mini-programs/index.html
tags:
  - Technical
---

While preparing for my [presentation](https://events.google.cn/intl/zh-CN/developerdays2019/agenda/#table-row-1-7) at the [Google Developer Days 2019 in Shanghai, China](https://events.google.cn/intl/zh-CN/developerdays2019/) I was reminded again that China is a market where few super apps like [WeChat](https://www.wechat.com/en) host a [gazillion mini apps or mini programs](https://techcrunch.com/2018/11/07/wechat-mini-apps-200-million-users/) that fulfill everyday needs like booking cabs, reserving tables, etc.

I got curious and [downloaded the SDK](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) and after playing a bit with the [Your First Mini App tutorial](https://developers.weixin.qq.com/miniprogram/en/dev/), I realized the whole thing is so close to building for the actual web, it both fascinates, intrigues, and honestly somewhat infuriates me.

#### App Architecture

- You style your apps with [WXSS](https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxss.html), which is essentially CSS with some neat additions like [responsive pixels](https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxss.html).

```css
page-section-gap{
  box-sizing: border-box;
  padding: 0 30rpx;
}

.page-body-button {
  margin-bottom: 30rpx;
}
```

- You write your app logic with JavaScript (or TypeScript), with `App` as the top level object and `wx` as the object you get all the cool capabilities from. The [API](https://developers.weixin.qq.com/miniprogram/en/dev/api/) is incredibly powerful.

<details>
<summary>Here are the keys of the `wx` object</summary>
<pre>
[
  "addCard",
  "addNativeDownloadTask",
  "addPhoneContact",
  "addWeRunData",
  "arrayBufferToBase64",
  "authorize",
  "base64ToArrayBuffer",
  "batchGetContactDirectly",
  "bindPaymentCard",
  "calRqt",
  "canIUse",
  "cancelDownloadAppTask",
  "canvasGetImageData",
  "canvasPutImageData",
  "canvasToTempFilePath",
  "captureScreen",
  "checkIsSoterEnrolledInDevice",
  "checkIsSupportFacialRecognition",
  "checkIsSupportSoterAuthentication",
  "checkSession",
  "chooseAddress",
  "chooseContact",
  "chooseImage",
  "chooseInvoice",
  "chooseInvoiceTitle",
  "chooseLocation",
  "chooseMedia",
  "chooseMessageFile",
  "chooseMultiMedia",
  "chooseShareGroup",
  "chooseVideo",
  "chooseWeChatContact",
  "clearStorage",
  "clearStorageSync",
  "closeBLEConnection",
  "closeBluetoothAdapter",
  "closeSocket",
  "cloud",
  "compressImage",
  "connectSocket",
  "connectWifi",
  "createAnimation",
  "createAudioContext",
  "createBLEConnection",
  "createCameraContext",
  "createCanvasContext",
  "createContext",
  "createInnerAudioContext",
  "createIntersectionObserver",
  "createInterstitialAd",
  "createLivePlayerContext",
  "createLivePusherContext",
  "createMapContext",
  "createOffscreenCanvas",
  "createRewardedVideoAd",
  "createSelectorQuery",
  "createUDPSocket",
  "createVideoContext",
  "createWorker",
  "downloadApp",
  "downloadAppForIOS",
  "downloadFile",
  "downloadSilkVoice",
  "drawCanvas",
  "enterContact",
  "env",
  "error",
  "exitVoIPChat",
  "faceVerifyForPay",
  "getABTestConfig",
  "getAccountInfoSync",
  "getAppInstallState",
  "getAvailableAudioSources",
  "getBLEDeviceCharacteristics",
  "getBLEDeviceServices",
  "getBackgroundAudioManager",
  "getBackgroundAudioPlayerState",
  "getBackgroundFetchData",
  "getBackgroundFetchToken",
  "getBatteryInfo",
  "getBatteryInfoSync",
  "getBeacons",
  "getBluetoothAdapterState",
  "getBluetoothDevices",
  "getClipboardData",
  "getConnectedBluetoothDevices",
  "getConnectedWifi",
  "getCookies",
  "getExtConfig",
  "getExtConfigSync",
  "getFileInfo",
  "getFileSystemManager",
  "getHCEState",
  "getImageInfo",
  "getLabInfo",
  "getLaunchOptionsSync",
  "getLocation",
  "getLogManager",
  "getMenuButtonBoundingClientRect",
  "getNetworkType",
  "getOpenDeviceId",
  "getPublicLibVersion",
  "getRealtimeLogManager",
  "getRecorderManager",
  "getResPath",
  "getSavedFileInfo",
  "getSavedFileList",
  "getScreenBrightness",
  "getSelectedTextRange",
  "getSetting",
  "getShareInfo",
  "getStorage",
  "getStorageInfo",
  "getStorageInfoSync",
  "getStorageSync",
  "getSystemInfo",
  "getSystemInfoSync",
  "getUpdateManager",
  "getUserInfo",
  "getWeRunData",
  "getWifiList",
  "getWxSecData",
  "hideKeyboard",
  "hideLoading",
  "hideNavigationBarLoading",
  "hideShareMenu",
  "hideTabBar",
  "hideTabBarRedDot",
  "hideToast",
  "installDownloadApp",
  "isSDKError",
  "isSystemError",
  "isThirdError",
  "joinVoIPChat",
  "launchApplicationDirectly",
  "launchApplicationForNative",
  "launchMiniProgram",
  "loadFontFace",
  "loadPaySpeechDialectConfig",
  "login",
  "makePhoneCall",
  "makeVoIPCall",
  "navigateBack",
  "navigateBackApplication",
  "navigateBackH5",
  "navigateBackMiniProgram",
  "navigateBackNative",
  "navigateTo",
  "navigateToDevMiniProgram",
  "navigateToMiniProgram",
  "navigateToMiniProgramDirectly",
  "nextTick",
  "notifyBLECharacteristicValueChange",
  "notifyBLECharacteristicValueChanged",
  "offAppHide",
  "offAppShow",
  "offAudioInterruptionBegin",
  "offAudioInterruptionEnd",
  "offError",
  "offLocalServiceDiscoveryStop",
  "offLocalServiceFound",
  "offLocalServiceLost",
  "offLocalServiceResolveFail",
  "offPageNotFound",
  "offWindowResize",
  "onAccelerometerChange",
  "onAppEnterBackground",
  "onAppEnterForeground",
  "onAppHide",
  "onAppRoute",
  "onAppRouteDone",
  "onAppShow",
  "onAppUnhang",
  "onAudioInterruptionBegin",
  "onAudioInterruptionEnd",
  "onBLECharacteristicValueChange",
  "onBLEConnectionStateChange",
  "onBLEConnectionStateChanged",
  "onBackgroundAudioPause",
  "onBackgroundAudioPlay",
  "onBackgroundAudioStop",
  "onBackgroundFetchData",
  "onBeaconServiceChange",
  "onBeaconUpdate",
  "onBluetoothAdapterStateChange",
  "onBluetoothDeviceFound",
  "onCompassChange",
  "onDeviceMotionChange",
  "onDownloadAppStateChange",
  "onError",
  "onEvaluateWifi",
  "onGetWifiList",
  "onGyroscopeChange",
  "onHCEMessage",
  "onKeyboardHeightChange",
  "onLocalServiceDiscoveryStop",
  "onLocalServiceFound",
  "onLocalServiceLost",
  "onLocalServiceResolveFail",
  "onLocationChange",
  "onMemoryWarning",
  "onNativeEvent",
  "onNetworkStatusChange",
  "onPageNotFound",
  "onPageReload",
  "onSocketClose",
  "onSocketError",
  "onSocketMessage",
  "onSocketOpen",
  "onTapNavigationBarRightButton",
  "onUploadEncryptedFileToCDNProgress",
  "onUserCaptureScreen",
  "onVoIPChatInterrupted",
  "onVoIPChatMembersChanged",
  "onVoIPChatSpeakersChanged",
  "onVoicePlayEnd",
  "onWebviewEvent",
  "onWifiConnected",
  "onWindowResize",
  "openBluetoothAdapter",
  "openBusinessView",
  "openCard",
  "openDeliveryList",
  "openDocument",
  "openGoldenRedPacketDetail",
  "openLocation",
  "openMiniProgramHistoryList",
  "openMiniProgramProfile",
  "openMiniProgramSearch",
  "openMiniProgramStarList",
  "openOfficialAccountProfile",
  "openOfflinePayView",
  "openQRCode",
  "openSetting",
  "openUrl",
  "openUserProfile",
  "openWCPayCardList",
  "operateWXData",
  "pageScrollTo",
  "pauseBackgroundAudio",
  "pauseDownloadAppTask",
  "pauseVoice",
  "playBackgroundAudio",
  "playVoice",
  "presetWifiList",
  "preventApplePayUI",
  "previewImage",
  "queryDownloadAppTask",
  "reLaunch",
  "readBLECharacteristicValue",
  "redirectTo",
  "removeSavedFile",
  "removeStorage",
  "removeStorageSync",
  "removeTabBarBadge",
  "removeUserCloudStorage",
  "reportAction",
  "reportAnalytics",
  "reportIDKey",
  "reportKeyValue",
  "reportMonitor",
  "request",
  "requestMallPayment",
  "requestPayment",
  "requestPaymentToBank",
  "requestVirtualPayment",
  "resumeDownloadAppTask",
  "saveFile",
  "saveImageToPhotosAlbum",
  "saveVideoToPhotosAlbum",
  "scanCode",
  "secureTunnel",
  "seekBackgroundAudio",
  "sendBizRedPacket",
  "sendGoldenRedPacket",
  "sendHCEMessage",
  "sendSocketMessage",
  "setBackgroundColor",
  "setBackgroundFetchToken",
  "setBackgroundTextStyle",
  "setClipboardData",
  "setCookies",
  "setCurrentPaySpeech",
  "setEnableDebug",
  "setInnerAudioOption",
  "setKeepScreenOn",
  "setLabInfo",
  "setNavigationBarAlpha",
  "setNavigationBarColor",
  "setNavigationBarRightButton",
  "setNavigationBarTitle",
  "setPageStyle",
  "setResPath",
  "setScreenBrightness",
  "setStorage",
  "setStorageSync",
  "setTabBarBadge",
  "setTabBarItem",
  "setTabBarStyle",
  "setTopBarText",
  "setUserCloudStorage",
  "setWifiList",
  "shareAppMessageForFakeNative",
  "showActionSheet",
  "showLoading",
  "showModal",
  "showNavigationBarLoading",
  "showShareActionSheet",
  "showShareMenu",
  "showTabBar",
  "showTabBarRedDot",
  "showToast",
  "startAccelerometer",
  "startBeaconDiscovery",
  "startBluetoothDevicesDiscovery",
  "startCompass",
  "startCustomFacialRecognitionVerify",
  "startCustomFacialRecognitionVerifyAndUploadVideo",
  "startDeviceMotionListening",
  "startFacialRecognitionVerify",
  "startFacialRecognitionVerifyAndUploadVideo",
  "startGyroscope",
  "startHCE",
  "startLocalServiceDiscovery",
  "startLocationUpdate",
  "startLocationUpdateBackground",
  "startPullDownRefresh",
  "startRecord",
  "startSoterAuthentication",
  "startWifi",
  "stopAccelerometer",
  "stopBackgroundAudio",
  "stopBeaconDiscovery",
  "stopBluetoothDevicesDiscovery",
  "stopCompass",
  "stopDeviceMotionListening",
  "stopGyroscope",
  "stopHCE",
  "stopLocalServiceDiscovery",
  "stopLocationUpdate",
  "stopPullDownRefresh",
  "stopRecord",
  "stopVoice",
  "stopWifi",
  "switchTab",
  "traceEvent",
  "triggerGettingWidgetData",
  "updatePerfData",
  "updateShareMenu",
  "updateVoIPChatMuteConfig",
  "uploadEncryptedFileToCDN",
  "uploadFile",
  "uploadSilkVoice",
  "uploadWeRunData",
  "verifyPaymentPassword",
  "version",
  "vibrateLong",
  "vibrateShort",
  "voiceSplitJoint",
  "writeBLECharacteristicValue"
]</pre>
</details>

- You describe your interface with [WXML](https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxml/), which is something between [JSX](https://reactjs.org/docs/introducing-jsx.html), [Vue's declarative rendering](https://vuejs.org/v2/guide/#Declarative-Rendering); it also reminds me of old concepts like XSLT's [`<xsl:if>`](https://www.w3.org/TR/xslt-30/#xsl-if):

```html
<view wx:if="{{view == 'WEBVIEW'}}"> WEBVIEW </view>
<view wx:elif="{{view == 'APP'}}"> APP </view>
<view wx:else="{{view == 'MINA'}}"> MINA </view>
```

Overall a really nice separation of concerns. I could very well imagine being productive with this in no time. The onboarding experience of the documentation is pretty neat. The SDK is well made with (essentially an adapted) [Chrome DevTools integrated](https://developers.weixin.qq.com/miniprogram/en/dev/devtools/devtools.html) and some VS Code like features like code completion.

#### Programming Concept

The overall programming concept [reminds of OpenSocial](http://opensocial.github.io/spec/2.5.1/Social-Gadget.xml#rfc.section.3.1.2) (if anyone remembers that) where there is a baseline assumption of a logged in user whose social graph can be explored:

```js
// OpenSocial
osapi.people.getViewer().execute(function(result) {
  if (!result.error) {
    console.log('Your name is ' + result.displayName + '!');
  }
});
```

```js
// WeChat
wx.getSetting({
  success: res => {
    if (res.authSetting['scope.userInfo']) {
      wx.getUserInfo({
        success: res => {
          console.log(res.userInfo);
        }
      });
    }
  }
});
```

![The "My First Mini Program" app running in the WeChat DevTools](https://user-images.githubusercontent.com/145676/63084473-8cf79900-bf4b-11e9-8838-447688caf661.png)

#### Component Library

They also have nice [set of declarative components](https://developers.weixin.qq.com/miniprogram/en/dev/component/), think web components essentially, that you can create with WXML and interact with from JavaScript:

```html
<map
  id="myMap"
  style="width: 100%; height: 300px;"
  latitude="{{latitude}}"
  longitude="{{longitude}}"
  markers="{{markers}}"
  covers="{{covers}}"
  show-location
></map>
```

```js
Page({
  data: {
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      name: 'T.I.T 创意园'
    }],
    covers: [{
      latitude: 23.099994,
      longitude: 113.344520,
      iconPath: '/image/location.png'
    }, {
      latitude: 23.099994,
      longitude: 113.304520,
      iconPath: '/image/location.png'
    }]
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function(res){
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  }
})
```

![WeChat `<map>` component sample running in WeChat DevTools](https://user-images.githubusercontent.com/145676/63084474-8d902f80-bf4b-11e9-9267-c69f4923e795.png)

And of course they have a [`<web-view>`](https://developers.weixin.qq.com/miniprogram/en/dev/component/web-view.html).

![WeChat `<web-view>` component sample running in WeChat DevTools](https://user-images.githubusercontent.com/145676/63084476-8d902f80-bf4b-11e9-9cb5-d3a216a4d4af.png)

#### Inner Mechanics

From what I understand, it's all running in an iframe, Chrome/WeChat DevTools then hides the container, and all you see is the WXML layer.
When you look at the SDK's package contents, they make no real effort at hiding any of the inner mechanics: it's all HTML (of particular interest: `/Applications/wechatwebdevtools.app/Contents/Resources/package.nw/html/standalone.html`), CSS (of particular interest: `/Applications/wechatwebdevtools.app/Contents/Resources/package.nw/static/app.css`), and JavaScript (of particular interest: `/Applications/wechatwebdevtools.app/Contents/Resources/package.nw/js/vendor/index.js`).

![Inspecting package contents of the WeChat DevTools](https://user-images.githubusercontent.com/145676/63084475-8d902f80-bf4b-11e9-954a-aff06f9b0e8d.png)

Finally there is a local web server running that allows them to link from the online docs to local URLs like [127.0.0.1:32123/minicode/VBZ3Jim26zYu](http://127.0.0.1:32123/minicode/VBZ3Jim26zYu), which in turn allows them to open code samples from the docs that are ready to play with a click in WeChat DevTools. The web server [luckily](https://medium.com/bugbountywriteup/zoom-zero-day-4-million-webcams-maybe-an-rce-just-get-them-to-visit-your-website-ac75c83f4ef5) only runs  when the WeChat DevTools are open.