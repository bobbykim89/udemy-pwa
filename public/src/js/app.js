let deferredPrompt;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("Service worker registered!");
  });
}

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt fired");
  e.preventDefault();
  deferredPrompt = e;
  return false;
});

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    // resolve("This is executed once time is done");
    reject({ code: 500, message: "An error occurred" });
    // console.log("This is executed once time is done");
  }, 3000);
});

// promise
//   .then(
//     (text) => {
//       return text;
//     },
//     (err) => {
//       console.log(err.code, err.message);
//     }
//   )
//   .then((newText) => {
//     console.log(newText);
//   });

promise
  .then((text) => {
    return text;
  })
  .then((newText) => {
    console.log(newText);
  })
  .catch((err) => {
    console.log(err.code, err.message);
  });

console.log("this is executed right after setTimeout");
