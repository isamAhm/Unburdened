const { Client, Account, ID } = require("node-appwrite");
const DatabaseService = require("./database");
require("dotenv").config();

class AuthService {
  // Create a client with session for authenticated requests
  static createSessionClient(sessionSecret) {
    const client = new Client()
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
      )
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setSession(sessionSecret);

    return new Account(client);
  }

  // Create a client WITHOUT API key for user authentication
  // API keys CANNOT be used for user login/registration
  static createAuthClient() {
    const client = new Client()
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
      )
      .setProject(process.env.APPWRITE_PROJECT_ID);

    const key = process.env.APPWRITE_ACCOUNT_API_KEY || process.env.APPWRITE_API_KEY;
    if (key) {
      client.setKey(key);
    }

    return new Account(client);
  }

  static async register(email, password, name) {
    try {
      const account = this.createAuthClient();

      // Create account in Appwrite (no API key - user operation)
      const user = await account.create(ID.unique(), email, password, name);

      // Create user document in database
      const userDoc = await DatabaseService.createUser(user.$id, email, name);

      return {
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          bio: userDoc.bio || "",
          avatarUrl: userDoc.avatarUrl || null,
          avatarFileId: userDoc.avatarFileId || null,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  }

  static async login(email, password) {
    try {
      const account = this.createAuthClient();

      // Create session in Appwrite (no API key - user operation)
      const session = await account.createEmailPasswordSession(email, password);

      // Get user details using the session
      const sessionAccount = this.createSessionClient(session.secret);
      const user = await sessionAccount.get();

      let userDoc = null;
      try {
        userDoc = await DatabaseService.getUser(user.$id);
      } catch (docError) {
        console.warn("User profile document not found for", user.$id, docError);
      }

      return {
        success: true,
        session: {
          id: session.$id,
          secret: session.secret,
          userId: session.userId,
          provider: session.provider,
          current: session.current,
        },
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          bio: userDoc?.bio || "",
          avatarUrl: userDoc?.avatarUrl || null,
          avatarFileId: userDoc?.avatarFileId || null,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }

  static async logout(sessionSecret) {
    try {
      const account = this.createSessionClient(sessionSecret);
      await account.deleteSession("current");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  }

  static async getCurrentUser(sessionSecret) {
    try {
      const account = this.createSessionClient(sessionSecret);
      const user = await account.get();
      let userDoc = null;
      try {
        userDoc = await DatabaseService.getUser(user.$id);
      } catch (docError) {
        console.warn("User profile document not found for", user.$id, docError);
      }

      return {
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          bio: userDoc?.bio || "",
          avatarUrl: userDoc?.avatarUrl || null,
          avatarFileId: userDoc?.avatarFileId || null,
        },
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return {
        success: false,
        error: error.message || "Failed to get current user",
      };
    }
  }

  static async verifySession(sessionSecret) {
    try {
      const account = this.createSessionClient(sessionSecret);
      const user = await account.get();
      return { valid: true, userId: user.$id };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = AuthService;
