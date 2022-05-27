let deferredPrompt
const enableNotificationButtons = document.querySelectorAll(
  '.enable-notifications'
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('Service worker registered!')
    })
    .catch((err) => {
      console.log(err)
    })
} else {
  console.log('Service worker not supported')
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt fired')
  e.preventDefault()
  deferredPrompt = e
  return false
})

const displayConfirmNotification = () => {
  const options = {
    body: 'You successfully subscribed to our notification service',
    icon: '/src/images/icons/app-icon-96x96.png',
    image: '/src/images/sf-boat.jpg',
    dir: 'ltr',
    lang: 'en-US', // BCP 47
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app-icon-96x96.png',
    tag: 'confirm-notification',
    renotify: true,
    actions: [
      {
        action: 'confirm',
        title: 'Okay',
        icon: '/src/images/icons/app-icon-96x96.png',
      },
      {
        action: 'cancel',
        title: 'Cancel',
        icon: '/src/images/icons/app-icon-96x96.png',
      },
    ],
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((swreg) => {
      swreg.showNotification('Successbully subscribed (from SW)', options)
    })
  }
}

const configurePushSub = () => {
  if (!'serviceWorker' in navigator) {
    return
  }
  let reg
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg
      return swreg.pushManager.getSubscription()
    })
    .then((sub) => {
      if (!sub) {
        // Create a new subscription
        const vapidPublicKey =
          'BBYC_FGgUnPMinBWbXYKLuCEkosMmgGu2JN-nUQ1R1YFSsKMkGU10t9RnmN8ivgrZqk19kLjWuJfys9qtdHfaKU'
        const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey)
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        })
      } else {
        // We have a subscription
      }
    })
    .then((newSub) => {
      return fetch(
        'https://pwagram-48475-default-rtdb.firebaseio.com/subscriptions.json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(newSub),
        }
      )
    })
    .then((res) => {
      if (res.ok) {
        displayConfirmNotification()
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

const askForNotifificationPermission = () => {
  Notification.requestPermission().then((result) => {
    console.log('User Choice', result)
    if (result !== 'granted') {
      console.log('No notification permission granted')
    } else {
      // Hide button
      console.log('Yay!')
      configurePushSub()
      // displayConfirmNotification()
    }
  })
}

if ('Notification' in window) {
  for (let i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = 'inline-block'
    enableNotificationButtons[i].addEventListener(
      'click',
      askForNotifificationPermission
    )
  }
}
