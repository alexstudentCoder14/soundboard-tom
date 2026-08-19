/* =========================================================
   SOUNDBOARD
   Firebase Authentication
   Firebase Realtime Database
   CodePen version
   ========================================================= */


/* =========================================================
   1. FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyAp41pXjkEPhoBlAjyISoE5aZFOW1iWTZY",

  authDomain:
    "soundboard-2431f.firebaseapp.com",

  databaseURL:
    "https://soundboard-2431f-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "soundboard-2431f",

  storageBucket:
    "soundboard-2431f.firebasestorage.app",

  messagingSenderId:
    "784060441415",

  appId:
    "1:784060441415:web:bff61fd230ddf2434ea262",

  measurementId:
    "G-LZ8Z7S1B47"

};


/* =========================================================
   2. CONSTANTS
   ========================================================= */

/*
  We are NOT using Firebase Storage.

  The audio file is converted into a data URL and stored
  inside Realtime Database.

  Keep files reasonably short.

  3 MB per file.
*/

const MAX_FILE_SIZE =
  3 * 1024 * 1024;


/* =========================================================
   3. DOM
   ========================================================= */

const authScreen =
  document.getElementById("authScreen");

const app =
  document.getElementById("app");

const loginTab =
  document.getElementById("loginTab");

const signupTab =
  document.getElementById("signupTab");

const authForm =
  document.getElementById("authForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const authSubmit =
  document.getElementById("authSubmit");

const authMessage =
  document.getElementById("authMessage");

const firebaseStatus =
  document.getElementById("firebaseStatus");

const userEmail =
  document.getElementById("userEmail");

const logoutButton =
  document.getElementById("logout");

const stopAllButton =
  document.getElementById("stopAll");

const fileInput =
  document.getElementById("fileInput");

const emptyFileInput =
  document.getElementById("emptyFileInput");

const soundboard =
  document.getElementById("soundboard");

const emptyState =
  document.getElementById("emptyState");

const soundCount =
  document.getElementById("soundCount");

const searchInput =
  document.getElementById("searchInput");

const uploadPanel =
  document.getElementById("uploadPanel");

const uploadTitle =
  document.getElementById("uploadTitle");

const uploadText =
  document.getElementById("uploadText");

const toast =
  document.getElementById("toast");


/* Edit */

const editModal =
  document.getElementById("editModal");

const editName =
  document.getElementById("editName");

const editVolume =
  document.getElementById("editVolume");

const editVolumeValue =
  document.getElementById("editVolumeValue");

const closeEdit =
  document.getElementById("closeEdit");

const cancelEdit =
  document.getElementById("cancelEdit");

const saveEdit =
  document.getElementById("saveEdit");


/* Delete */

const deleteModal =
  document.getElementById("deleteModal");

const deleteName =
  document.getElementById("deleteName");

const closeDelete =
  document.getElementById("closeDelete");

const cancelDelete =
  document.getElementById("cancelDelete");

const confirmDelete =
  document.getElementById("confirmDelete");


/* =========================================================
   4. APPLICATION STATE
   ========================================================= */

let auth = null;

let database = null;

let currentUser = null;

let sounds = {};

let authMode = "login";

let soundListener = null;

let soundBeingEdited = null;

let soundBeingDeleted = null;

let toastTimer = null;


/*
  Every time a sound is played, an Audio object is stored
  here so Stop All can stop every sound.
*/

const activeAudio =
  new Set();


/* =========================================================
   5. FIREBASE INITIALIZATION
   ========================================================= */

try {

  /*
    Make sure Firebase actually exists.
  */

  if (
    typeof firebase === "undefined"
  ) {

    throw new Error(
      "Firebase SDK did not load."
    );

  }


  /*
    Initialize Firebase.
  */

  firebase.initializeApp(
    firebaseConfig
  );


  /*
    Get Firebase services.
  */

  auth =
    firebase.auth();

  database =
    firebase.database();


  firebaseStatus.textContent =
    "Firebase connected";


  firebaseStatus.style.color =
    "#35d07f";


  console.log(
    "Firebase initialized successfully."
  );


} catch (error) {

  console.error(
    "Firebase initialization error:",
    error
  );


  firebaseStatus.textContent =
    "Firebase failed to load";


  firebaseStatus.style.color =
    "#ff7777";


  showAuthMessage(
    "Firebase could not be initialized. Check the JavaScript configuration."
  );

}


/* =========================================================
   6. LOGIN / SIGNUP TABS
   ========================================================= */

loginTab.addEventListener(
  "click",
  () => {

    setAuthMode("login");

  }
);


signupTab.addEventListener(
  "click",
  () => {

    setAuthMode("signup");

  }
);


function setAuthMode(mode) {

  authMode = mode;

  authMessage.textContent = "";


  if (mode === "login") {

    loginTab.classList.add(
      "active"
    );

    signupTab.classList.remove(
      "active"
    );

    authSubmit.textContent =
      "Login";

    passwordInput.autocomplete =
      "current-password";

  } else {

    signupTab.classList.add(
      "active"
    );

    loginTab.classList.remove(
      "active"
    );

    authSubmit.textContent =
      "Create Account";

    passwordInput.autocomplete =
      "new-password";

  }

}


/* =========================================================
   7. LOGIN / SIGNUP FORM
   ========================================================= */

authForm.addEventListener(
  "submit",
  async (event) => {

    /*
      VERY IMPORTANT:

      Stop the browser from submitting/reloading
      the CodePen page.
    */

    event.preventDefault();

    event.stopPropagation();


    if (!auth) {

      showAuthMessage(
        "Firebase is not connected."
      );

      return;

    }


    const email =
      emailInput.value
        .trim()
        .toLowerCase();

    const password =
      passwordInput.value;


    if (!email) {

      showAuthMessage(
        "Please enter your email address."
      );

      emailInput.focus();

      return;

    }


    if (!password) {

      showAuthMessage(
        "Please enter your password."
      );

      passwordInput.focus();

      return;

    }


    if (password.length < 6) {

      showAuthMessage(
        "Your password must contain at least 6 characters."
      );

      passwordInput.focus();

      return;

    }


    authSubmit.disabled = true;


    authSubmit.textContent =
      authMode === "login"
        ? "Logging in..."
        : "Creating account...";


    authMessage.textContent = "";


    try {

      if (
        authMode === "login"
      ) {

        /*
          LOGIN
        */

        await auth
          .signInWithEmailAndPassword(
            email,
            password
          );


      } else {

        /*
          CREATE ACCOUNT
        */

        await auth
          .createUserWithEmailAndPassword(
            email,
            password
          );

      }


      /*
        Firebase's onAuthStateChanged
        will take care of showing the app.
      */

      passwordInput.value = "";


    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );


      showAuthMessage(
        getAuthErrorMessage(error)
      );


    } finally {

      authSubmit.disabled = false;

      authSubmit.textContent =
        authMode === "login"
          ? "Login"
          : "Create Account";

    }

  }
);


/* =========================================================
   8. FIREBASE AUTH ERROR MESSAGES
   ========================================================= */

function getAuthErrorMessage(
  error
) {

  switch (error.code) {

    case "auth/invalid-email":
      return "That email address is not valid.";

    case "auth/user-not-found":
      return "No account exists with that email.";

    case "auth/wrong-password":
      return "The password is incorrect.";

    case "auth/invalid-credential":
      return "The email or password is incorrect.";

    case "auth/email-already-in-use":
      return "An account with that email already exists.";

    case "auth/weak-password":
      return "Your password must contain at least 6 characters.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in Firebase Authentication.";

    default:

      return (
        error.message ||
        "Something went wrong."
      );

  }

}


function showAuthMessage(
  message
) {

  authMessage.textContent =
    message;

}


/* =========================================================
   9. AUTH STATE
   ========================================================= */

if (auth) {

  auth.onAuthStateChanged(
    (user) => {

      if (user) {

        signedIn(user);

      } else {

        signedOut();

      }

    }
  );

}


/* =========================================================
   10. SIGNED IN
   ========================================================= */

function signedIn(user) {

  currentUser =
    user;


  /*
    Hide login screen.
  */

  authScreen.classList.add(
    "hidden"
  );


  /*
    Show soundboard.
  */

  app.classList.remove(
    "hidden"
  );


  userEmail.textContent =
    user.email || "Signed in";


  /*
    Reset current local state.
  */

  sounds = {};

  stopAllSounds();


  /*
    Start listening for changes
    in Realtime Database.
  */

  startSoundListener();

}


/* =========================================================
   11. SIGNED OUT
   ========================================================= */

function signedOut() {

  stopAllSounds();

  removeSoundListener();


  currentUser = null;

  sounds = {};


  soundboard.innerHTML = "";


  app.classList.add(
    "hidden"
  );

  authScreen.classList.remove(
    "hidden"
  );


  userEmail.textContent =
    "";


  soundCount.textContent =
    "0 sounds";


  authSubmit.textContent =
    authMode === "login"
      ? "Login"
      : "Create Account";


  emailInput.focus();

}


/* =========================================================
   12. LOGOUT
   ========================================================= */

logoutButton.addEventListener(
  "click",
  async () => {

    if (!auth) {
      return;
    }


    stopAllSounds();


    try {

      await auth.signOut();


    } catch (error) {

      console.error(
        error
      );

      showToast(
        "Could not log out."
      );

    }

  }
);


/* =========================================================
   13. DATABASE LISTENER
   ========================================================= */

function startSoundListener() {

  removeSoundListener();


  if (
    !currentUser ||
    !database
  ) {

    return;

  }


  /*
    IMPORTANT:

    Every user has their own soundboard.

    If somebody else logs into this SAME account,
    Firebase gives them this same UID and therefore
    this same collection of sounds.
  */

  const path =
    `users/${currentUser.uid}/sounds`;


  const reference =
    database.ref(path);


  const listener =
    reference.on(
      "value",

      (snapshot) => {

        sounds =
          snapshot.val() || {};


        renderSounds();

      },

      (error) => {

        console.error(
          "Realtime Database error:",
          error
        );


        showToast(
          "Could not load your sounds. Check your Firebase Database Rules."
        );

      }
    );


  soundListener = {
    reference,
    listener
  };

}


/* =========================================================
   14. REMOVE DATABASE LISTENER
   ========================================================= */

function removeSoundListener() {

  if (
    soundListener
  ) {

    soundListener.reference.off(
      "value",
      soundListener.listener
    );

    soundListener = null;

  }

}


/* =========================================================
   15. FILE INPUTS
   ========================================================= */

fileInput.addEventListener(
  "change",
  () => {

    handleFiles(
      fileInput.files
    );

    fileInput.value = "";

  }
);


emptyFileInput.addEventListener(
  "change",
  () => {

    handleFiles(
      emptyFileInput.files
    );

    emptyFileInput.value = "";

  }
);


/* =========================================================
   16. HANDLE MULTIPLE FILES
   ========================================================= */

async function handleFiles(
  fileList
) {

  if (
    !currentUser ||
    !database
  ) {

    showToast(
      "Please log in first."
    );

    return;

  }


  const files =
    Array.from(fileList || {});


  if (
    files.length === 0
  ) {

    return;

  }


  uploadPanel.classList.remove(
    "hidden"
  );


  let successful = 0;


  try {

    for (
      let i = 0;
      i < files.length;
      i++
    ) {

      const file =
        files[i];


      uploadTitle.textContent =
        `Uploading ${i + 1} of ${files.length}`;


      uploadText.textContent =
        file.name;


      try {

        await uploadSound(
          file
        );


        successful++;


      } catch (error) {

        console.error(
          error
        );


        showToast(
          `${file.name}: ${error.message}`
        );

      }

    }


    if (
      successful > 0
    ) {

      showToast(
        successful === 1
          ? "Sound uploaded successfully."
          : `${successful} sounds uploaded successfully.`
      );

    }


  } finally {

    uploadPanel.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   17. UPLOAD SOUND
   ========================================================= */

async function uploadSound(
  file
) {

  if (
    !file.type ||
    !file.type.startsWith(
      "audio/"
    )
  ) {

    throw new Error(
      "That file is not an audio file."
    );

  }


  if (
    file.size >
    MAX_FILE_SIZE
  ) {

    throw new Error(
      "That file is larger than 3 MB."
    );

  }


  /*
    Convert the audio file to a Base64/data URL.
  */

  const dataUrl =
    await fileToDataURL(
      file
    );


  /*
    Create a unique Firebase key.
  */

  const soundRef =
    database
      .ref(
        `users/${currentUser.uid}/sounds`
      )
      .push();


  const soundId =
    soundRef.key;


  const name =
    removeExtension(
      file.name
    ) ||
    "Untitled Sound";


  const sound = {

    id:
      soundId,

    name:
      name,

    audio:
      dataUrl,

    type:
      file.type,

    size:
      file.size,

    volume:
      100,

    createdAt:
      firebase.database
        .ServerValue
        .TIMESTAMP

  };


  /*
    Save the sound in Realtime Database.
  */

  await soundRef.set(
    sound
  );

}


/* =========================================================
   18. FILE TO DATA URL
   ========================================================= */

function fileToDataURL(
  file
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        () => {

          resolve(
            reader.result
          );

        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "Could not read the audio file."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   19. REMOVE FILE EXTENSION
   ========================================================= */

function removeExtension(
  filename
) {

  return filename
    .replace(
      /\.[^/.]+$/,
      ""
    )
    .trim();

}


/* =========================================================
   20. RENDER SOUNDS
   ========================================================= */

function renderSounds() {

  soundboard.innerHTML = "";


  const allSounds =
    Object.values(
      sounds || {}
    )
    .filter(Boolean)
    .sort(
      (a, b) =>
        (a.createdAt || 0) -
        (b.createdAt || 0)
    );


  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const filtered =
    allSounds.filter(
      sound =>
        String(
          sound.name || ""
        )
        .toLowerCase()
        .includes(search)
    );


  soundCount.textContent =
    `${allSounds.length} sound${
      allSounds.length === 1
        ? ""
        : "s"
    }`;


  /*
    Empty state.
  */

  if (
    allSounds.length === 0
  ) {

    emptyState.classList.remove(
      "hidden"
    );

  } else {

    emptyState.classList.add(
      "hidden"
    );

  }


  /*
    No search results.
  */

  if (
    filtered.length === 0 &&
    allSounds.length > 0
  ) {

    soundboard.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h2>No matching sounds</h2>
        <p>Try a different search.</p>
      </div>
    `;

    return;

  }


  filtered.forEach(
    (sound, index) => {

      const card =
        createSoundCard(
          sound,
          index
        );


      soundboard.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   21. CREATE SOUND CARD
   ========================================================= */

function createSoundCard(
  sound,
  index
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "sound-card";


  card.dataset.soundId =
    sound.id;


  const size =
    formatFileSize(
      sound.size || 0
    );


  card.innerHTML = `

    <div>

      <div class="sound-number">
        ${index + 1}
      </div>

      <div class="sound-name"></div>

      <div class="sound-meta">
        ${size}
      </div>

    </div>

    <div>

      <button
        class="play-button"
        type="button"
        data-action="play"
      >
        ▶ Play
      </button>

      <div class="card-actions">

        <button
          class="card-action"
          type="button"
          data-action="edit"
        >
          Edit
        </button>

        <button
          class="card-action delete"
          type="button"
          data-action="delete"
        >
          Delete
        </button>

      </div>

    </div>

  `;


  /*
    textContent prevents weird HTML
    from being injected through a filename.
  */

  card.querySelector(
    ".sound-name"
  ).textContent =
    sound.name ||
    "Untitled Sound";


  /*
    PLAY
  */

  card
    .querySelector(
      '[data-action="play"]'
    )
    .addEventListener(
      "click",
      () => {

        playSound(
          sound,
          card
        );

      }
    );


  /*
    EDIT
  */

  card
    .querySelector(
      '[data-action="edit"]'
    )
    .addEventListener(
      "click",
      () => {

        openEditModal(
          sound
        );

      }
    );


  /*
    DELETE
  */

  card
    .querySelector(
      '[data-action="delete"]'
    )
    .addEventListener(
      "click",
      () => {

        openDeleteModal(
          sound
        );

      }
    );


  return card;

}


/* =========================================================
   22. PLAY SOUND
   ========================================================= */

function playSound(
  sound,
  card
) {

  if (
    !sound ||
    !sound.audio
  ) {

    showToast(
      "This sound has no audio data."
    );

    return;

  }


  try {

    const audio =
      new Audio(
        sound.audio
      );


    /*
      Use the saved volume.
    */

    audio.volume =
      Math.max(
        0,
        Math.min(
          1,
          Number(
            sound.volume ?? 100
          ) / 100
        )
      );


    activeAudio.add(
      audio
    );


    card.classList.add(
      "playing"
    );


    audio.addEventListener(
      "ended",
      () => {

        activeAudio.delete(
          audio
        );

        card.classList.remove(
          "playing"
        );

      }
    );


    audio.addEventListener(
      "error",
      () => {

        activeAudio.delete(
          audio
        );

        card.classList.remove(
          "playing"
        );

        showToast(
          "The sound could not be played."
        );

      }
    );


    const promise =
      audio.play();


    /*
      Browser autoplay handling.
    */

    if (
      promise &&
      typeof promise.catch ===
        "function"
    ) {

      promise.catch(
        error => {

          console.error(
            error
          );

          activeAudio.delete(
            audio
          );

          card.classList.remove(
            "playing"
          );

          showToast(
            "The browser blocked audio playback. Click Play again."
          );

        }
      );

    }

  } catch (error) {

    console.error(
      error
    );

    showToast(
      "Could not play this sound."
    );

  }

}


/* =========================================================
   23. STOP ALL
   ========================================================= */

stopAllButton.addEventListener(
  "click",
  () => {

    stopAllSounds();

    showToast(
      "All sounds stopped."
    );

  }
);


function stopAllSounds() {

  activeAudio.forEach(
    audio => {

      try {

        audio.pause();

        audio.currentTime = 0;

      } catch (error) {

        console.error(
          error
        );

      }

    }
  );


  activeAudio.clear();


  document
    .querySelectorAll(
      ".sound-card.playing"
    )
    .forEach(
      card => {

        card.classList.remove(
          "playing"
        );

      }
    );

}


/* =========================================================
   24. SEARCH
   ========================================================= */

searchInput.addEventListener(
  "input",
  () => {

    renderSounds();

  }
);


/* =========================================================
   25. KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Don't trigger shortcuts while
      typing in an input.
    */

    const tag =
      document.activeElement
        ?.tagName;


    if (
      tag === "INPUT" ||
      tag === "TEXTAREA"
    ) {

      return;

    }


    const number =
      Number(
        event.key
      );


    if (
      number >= 1 &&
      number <= 9
    ) {

      const cards =
        Array.from(
          document.querySelectorAll(
            ".sound-card"
          )
        );


      const card =
        cards[number - 1];


      if (!card) {
        return;
      }


      const soundId =
        card.dataset.soundId;


      const sound =
        sounds[soundId];


      if (sound) {

        playSound(
          sound,
          card
        );

      }

    }


    if (
      event.key === "Escape"
    ) {

      closeEditModal();

      closeDeleteModal();

    }

  }
);


/* =========================================================
   26. EDIT MODAL
   ========================================================= */

function openEditModal(
  sound
) {

  soundBeingEdited =
    sound;


  editName.value =
    sound.name ||
    "";


  editVolume.value =
    Number(
      sound.volume ?? 100
    );


  updateVolumeLabel();


  editModal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {
      editName.focus();
      editName.select();
    },
    50
  );

}


function closeEditModal() {

  soundBeingEdited =
    null;

  editModal.classList.add(
    "hidden"
  );

}


closeEdit.addEventListener(
  "click",
  closeEditModal
);


cancelEdit.addEventListener(
  "click",
  closeEditModal
);


editModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      editModal
    ) {

      closeEditModal();

    }

  }
);


/* =========================================================
   27. VOLUME
   ========================================================= */

editVolume.addEventListener(
  "input",
  updateVolumeLabel
);


function updateVolumeLabel() {

  editVolumeValue.textContent =
    `${editVolume.value}%`;

}


/* =========================================================
   28. SAVE EDIT
   ========================================================= */

saveEdit.addEventListener(
  "click",
  async () => {

    if (
      !soundBeingEdited ||
      !currentUser ||
      !database
    ) {

      return;

    }


    const name =
      editName.value
        .trim();


    if (!name) {

      showToast(
        "Please enter a sound name."
      );

      return;

    }


    saveEdit.disabled =
      true;


    try {

      await database
        .ref(
          `users/${currentUser.uid}/sounds/${soundBeingEdited.id}`
        )
        .update({

          name:
            name,

          volume:
            Number(
              editVolume.value
            )

        });


      closeEditModal();


      showToast(
        "Sound updated."
      );


    } catch (error) {

      console.error(
        error
      );


      showToast(
        getDatabaseErrorMessage(
          error
        )
      );


    } finally {

      saveEdit.disabled =
        false;

    }

  }
);


/* =========================================================
   29. DELETE MODAL
   ========================================================= */

function openDeleteModal(
  sound
) {

  soundBeingDeleted =
    sound;


  deleteName.textContent =
    sound.name ||
    "this sound";


  deleteModal.classList.remove(
    "hidden"
  );

}


function closeDeleteModal() {

  soundBeingDeleted =
    null;


  deleteModal.classList.add(
    "hidden"
  );

}


closeDelete.addEventListener(
  "click",
  closeDeleteModal
);


cancelDelete.addEventListener(
  "click",
  closeDeleteModal
);


deleteModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      deleteModal
    ) {

      closeDeleteModal();

    }

  }
);


/* =========================================================
   30. CONFIRM DELETE
   ========================================================= */

confirmDelete.addEventListener(
  "click",
  async () => {

    if (
      !soundBeingDeleted ||
      !currentUser ||
      !database
    ) {

      return;

    }


    const sound =
      soundBeingDeleted;


    confirmDelete.disabled =
      true;


    try {

      /*
        Stop it if it is currently playing.
      */

      stopSoundById(
        sound.id
      );


      /*
        Delete from Firebase.
      */

      await database
        .ref(
          `users/${currentUser.uid}/sounds/${sound.id}`
        )
        .remove();


      closeDeleteModal();


      showToast(
        "Sound deleted."
      );


    } catch (error) {

      console.error(
        error
      );


      showToast(
        getDatabaseErrorMessage(
          error
        )
      );


    } finally {

      confirmDelete.disabled =
        false;

    }

  }
);


/* =========================================================
   31. STOP SPECIFIC SOUND
   ========================================================= */

function stopSoundById(
  soundId
) {

  const card =
    document.querySelector(
      `.sound-card[data-sound-id="${CSS.escape(soundId)}"]`
    );


  /*
    We don't directly map audio to ID,
    so stop all audio belonging to the card
    by stopping currently active audio whose
    source matches the sound.
  */

  const sound =
    sounds[soundId];


  if (!sound) {
    return;
  }


  activeAudio.forEach(
    audio => {

      if (
        audio.src ===
        sound.audio
      ) {

        audio.pause();

        audio.currentTime = 0;

        activeAudio.delete(
          audio
        );

      }

    }
  );


  if (card) {

    card.classList.remove(
      "playing"
    );

  }

}


/* =========================================================
   32. DATABASE ERROR
   ========================================================= */

function getDatabaseErrorMessage(
  error
) {

  if (
    error &&
    error.code ===
      "PERMISSION_DENIED"
  ) {

    return (
      "Firebase denied this action. Check your Realtime Database Rules."
    );

  }


  return (
    error?.message ||
    "The database operation failed."
  );

}


/* =========================================================
   33. FILE SIZE
   ========================================================= */

function formatFileSize(
  bytes
) {

  if (
    bytes < 1024
  ) {

    return `${bytes} B`;

  }


  if (
    bytes < 1024 * 1024
  ) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  }


  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;

}


/* =========================================================
   34. TOAST
   ========================================================= */

function showToast(
  message
) {

  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =========================================================
   35. INITIAL STATE
   ========================================================= */

setAuthMode(
  "login"
);
