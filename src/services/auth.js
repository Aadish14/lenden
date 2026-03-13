import { supabase } from '../supabase';

export const authService = {
  // Format username to a valid faux email for Supabase
  formatIdentifier: (username) => {
    // Basic sanitization to ensure it forms a valid email structure
    const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${safeUsername}@lenden.local`;
  },

  // Register a new user
  register: async (username, password) => {
    const email = authService.formatIdentifier(username);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } // Store original username in user metadata
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    return { 
      uid: data.user.id,
      username: username 
    };
  },

  // Login a user
  login: async (username, password) => {
    const email = authService.formatIdentifier(username);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Incorrect username or password');
      }
      throw new Error(error.message);
    }
    return { 
      uid: data.user.id,
      username: data.user.user_metadata?.username || username 
    };
  },

  // Logout current user
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out: ", error);
    }
  },

  // Listener for auth state changes
  onAuthStateChange: (callback) => {
    // Return the initial session if available immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        callback({ 
          uid: session.user.id, 
          username: session.user.user_metadata?.username || session.user.email.split('@')[0]
        });
      } else {
        callback(null);
      }
    });

    // Listen to ongoing changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({ 
          uid: session.user.id, 
          username: session.user.user_metadata?.username || session.user.email.split('@')[0]
        });
      } else {
        callback(null);
      }
    });
    
    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }
};
