var shareImageButton = document.querySelector('#share-image-button')
var createPostArea = document.querySelector('#create-post')
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
)
const sharedMomentsArea = document.querySelector('#shared-moments')

function openCreatePostModal() {
  createPostArea.style.display = 'block'
  if (deferredPrompt) {
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome)

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation')
      } else {
        console.log('User added to home screen')
      }
    })

    deferredPrompt = null
  }

  // Unregister serviceworker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (let i = 0; i < registrations.length; i++) {
  //       registrations[i].unregister()
  //     }
  //   })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none'
}

shareImageButton.addEventListener('click', openCreatePostModal)

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal)

const onSavebuttonClicked = (e) => {
  console.log('Clicked!')
  if ('caches' in window) {
    caches.open('user-requested').then((cache) => {
      cache.add('https://httpbin.org/get')
      cache.add('/src/images/sf-boat.jpg')
    })
  }
}

const clearCards = () => {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastElementChild)
  }
}

const createCard = () => {
  const cardWrapper = document.createElement('div')
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp'
  const cardTitle = document.createElement('div')
  cardTitle.className = 'mdl-card__title'
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")'
  cardTitle.style.backgroundSize = 'cover'
  cardTitle.style.height = '180px'
  cardWrapper.appendChild(cardTitle)
  const cardTitleTextElement = document.createElement('h2')
  cardTitleTextElement.style.color = 'white'
  cardTitleTextElement.className = 'mdl-card__title-text'
  cardTitleTextElement.textContent = 'San Francisco Trip'
  cardTitle.appendChild(cardTitleTextElement)
  const cardSupportingText = document.createElement('div')
  cardSupportingText.className = 'mdl-card__supporting-text'
  cardSupportingText.textContent = 'In San Francisco'
  cardSupportingText.style.textAlign = 'center'
  // const cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save'
  // cardSaveButton.addEventListener('click', onSavebuttonClicked)
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText)
  componentHandler.upgradeElement(cardWrapper)

  sharedMomentsArea.appendChild(cardWrapper)
}

const url = 'https://httpbin.org/post'
let networkDataReceived = false

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    message: 'some message',
  }),
})
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    networkDataReceived = true
    console.log('from web', data)
    clearCards()
    createCard()
  })

if ('caches' in window) {
  caches
    .match(url)
    .then((res) => {
      if (res) {
        return res.json()
      }
    })
    .then((data) => {
      console.log('from cache', data)
      if (!networkDataReceived) {
        clearCards()
        createCard()
      }
    })
}
