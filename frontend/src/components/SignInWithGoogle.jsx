import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Get user info
    const name = user.displayName;
    const email = user.email;
    const photoURL = user.photoURL; // 🔥 This is the profile image

    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Photo URL:', photoURL);

    // You can now store or display the image URL in your app
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
};
