var shareImageButton = document.querySelector('#share-image-button')
var createPostArea = document.querySelector('#create-post')
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
)
const sharedMomentsArea = document.querySelector('#shared-moments')
const form = document.querySelector('form')
const titleInput = document.querySelector('#title')
const locationInput = document.querySelector('#location')

function openCreatePostModal() {
  // createPostArea.style.display = 'block'
  // setTimeout(() => {
  createPostArea.style.transform = 'translateY(0)'
  // }, 1)
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
  createPostArea.style.transform = 'translateY(100vh)'
  // createPostArea.style.display = 'none'
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

const createCard = (data) => {
  const cardWrapper = document.createElement('div')
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp'
  const cardTitle = document.createElement('div')
  cardTitle.className = 'mdl-card__title'
  cardTitle.style.backgroundImage = `url('${data.image}')`
  cardTitle.style.backgroundSize = 'cover'
  cardTitle.style.height = '180px'
  cardWrapper.appendChild(cardTitle)
  const cardTitleTextElement = document.createElement('h2')
  cardTitleTextElement.style.color = 'white'
  cardTitleTextElement.className = 'mdl-card__title-text'
  cardTitleTextElement.textContent = data.title
  cardTitle.appendChild(cardTitleTextElement)
  const cardSupportingText = document.createElement('div')
  cardSupportingText.className = 'mdl-card__supporting-text'
  cardSupportingText.textContent = data.location
  cardSupportingText.style.textAlign = 'center'
  // const cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save'
  // cardSaveButton.addEventListener('click', onSavebuttonClicked)
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText)
  componentHandler.upgradeElement(cardWrapper)

  sharedMomentsArea.appendChild(cardWrapper)
}

const updateUI = (data) => {
  for (let i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

const url = 'https://pwagram-48475-default-rtdb.firebaseio.com/posts.json'
let networkDataReceived = false

fetch(url)
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    networkDataReceived = true
    console.log('from web', data)
    let dataArray = []
    for (let key in data) {
      dataArray.push(data[key])
    }
    updateUI(dataArray)
  })

if ('indexedDB' in window) {
  readAllData('posts').then((data) => {
    if (!networkDataReceived) {
      console.log('From cache', data)
      updateUI(data)
    }
  })
}

const sendData = () => {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        'https://firebasestorage.googleapis.com/v0/b/pwagram-48475.appspot.com/o/sf-boat.jpg?alt=media&token=bd402c1a-73c8-4e7e-87f3-a5064a9cbdb7',
    }),
  }).then((res) => {
    console.log('Sent data', res)
    updateUI()
  })
}

form.addEventListener('submit', (event) => {
  event.preventDefault()

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data')
    return
  }

  closeCreatePostModal()
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((sw) => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
      }
      writeData('sync-posts', post)
        .then(() => {
          sw.sync.register('sync-new-posts')
        })
        .then(() => {
          const snackbarContainer = document.querySelector(
            '#confirmation-toast'
          )
          const data = { message: 'Your Post was saved for synching!' }
          snackbarContainer.MaterialSnackbar.showSnackbar(data)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  } else {
  }
})
