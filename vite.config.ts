import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    // Vite options tailored for Vercel deployments
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // Define global env variable defaults here
    define: {
      __FIREBASE_CONFIG__: {
        apiKey: "AIzaSyA6GarQGUptkNgPtEF8A61_Iw1dQKkRohc",
        authDomain: "ai-interview-af021.firebaseapp.com",
        projectId: "ai-interview-af021",
        storageBucket: "ai-interview-af021.firebasestorage.app",
        messagingSenderId: "460153456557",
        appId: "1:460153456557:web:36150387ccecd782f78324",
        measurementId: "G-73L1CYJLL9"
      }
    }
  };
});
