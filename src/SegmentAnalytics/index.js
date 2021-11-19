import { useEffect, useState } from 'react'
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

export const SegmentAnalytics = Analytics({
  app: 'The Chosen Web',
  plugins: [
    segmentPlugin({
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_KEY
    })
  ]
})

const Segment = () => {
  const [appboy, setAppboy] = useState(null)
  const initializePushSubscription = () => {
    appboy.subscribeToInAppMessage((inAppMessage) => {
      // eslint-disable-next-line no-console
      console.log(inAppMessage)
      let shouldDisplay = true

      if (inAppMessage instanceof appboy.InAppMessage) {
        const messageId = inAppMessage.extras.messageId

        if (messageId === 'push-primer') {
          if (!appboy.isPushSupported() || appboy.isPushPermissionGranted() || appboy.isPushBlocked()) {
            shouldDisplay = false
          }

          if (inAppMessage.buttons[1] != null) {
            inAppMessage.buttons[1].subscribeToClickedEvent(() => {
              appboy.registerAppboyPushMessages()
            })
          }
        }
      }

      if (shouldDisplay) {
        appboy.display.showInAppMessage(inAppMessage)
      }
    })

    appboy.logCustomEvent('prime-for-push')
  }

  useEffect(() => {
    import('@braze/web-sdk').then(sdk => {
      if (sdk) {
        sdk.initialize(process.env.NEXT_PUBLIC_BRAZE_KEY, {
          baseUrl: 'https://sdk.iad-05.braze.com',
          enableLogging: process.env.NODE_ENV !== 'production',
          manageServiceWorkerExternally: true,
          requireExplicitInAppMessageDismissal: true
        })

        setAppboy(sdk)
      }
    })
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            const { user: { anonymousId } } = SegmentAnalytics.getState()
            if (appboy) {
              appboy.openSession()
              appboy.changeUser(anonymousId)
              initializePushSubscription()
            }
          }
        )
      })
    }
  }, [appboy])

  return true
}

export default Segment
