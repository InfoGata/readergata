# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Run development server (includes CORS proxy server)
npm run dev

# Run just the frontend without the CORS proxy
npm start

# Run just the CORS proxy server
npm run cors-server

# Build for production
npm run build

# Run tests
npm test

# Lint the codebase
npm run lint
```

### Electron Commands

```bash
# Run Electron app in development mode
npm run electron:dev

# Build Electron app
npm run electron:build

# Preview Electron app
npm run electron:start
```

## Project Architecture

ReaderGata is a plugin-based reading application for ebooks and PDFs, built with React, Redux, and TypeScript.

### Core Architecture Components

1. **Plugin System**
   - Uses `plugin-frame` library for sandboxed iframes
   - Plugins run in isolated environments on their own subdomains
   - Managed through the `PluginsProvider` and `PluginsContext`

2. **Data Storage**
   - Uses Dexie.js (IndexedDB wrapper) for local storage
   - Redux for state management with redux-persist for persistence
   - Three main slices: document, settings, and UI

3. **Routing**
   - Uses Tanstack Router (formerly React Router)
   - Route tree generated in `routeTree.gen.ts`

4. **Viewers**
   - EBook Viewer: Uses epubjs to render ebooks
   - PDF Viewer: Uses react-pdf to render PDFs

5. **Internationalization**
   - Uses i18next for translations

### Key Subsystems

1. **Plugin Communication**
   - Plugins communicate with the main app through a well-defined interface (PluginMethodInterface)
   - Supports methods like onGetPublication, onGetFeed, onSearch, etc.

2. **Authentication**
   - Supports plugin authentication via headers or domain-specific headers
   - Handles login redirections for plugins requiring authentication

3. **Document Management**
   - Tracks document metadata, bookmarks, and reading locations
   - Provides seamless reading experience with synchronized table of contents

4. **UI Components**
   - Uses a combination of custom components and Radix UI primitives styled with Tailwind
   - Responsive design with support for different viewing modes

5. **Network Handling**
   - CORS proxy for handling cross-origin requests 
   - Extension integration for network requests to bypass CORS restrictions

## Data Flow

1. Plugins provide content sources and feed data
2. User selects content which is then rendered in the appropriate viewer
3. Document state (location, bookmarks) is persisted between sessions
4. UI state manages current view settings and interactive elements

## Project Structure

- `src/components/`: UI components including viewers
- `src/hooks/`: React hooks for various functionalities
- `src/layouts/`: Layout components for different parts of the app
- `src/providers/`: Context providers for themes and plugins
- `src/routes/`: Route definitions and page components
- `src/store/`: Redux store configuration and reducers
- `src/types.ts` and `src/plugintypes.ts`: Core type definitions
- `src/database.ts`: Dexie database configuration

## Plugin Development Resources

- Plugin documentation: https://infogata.github.io/readergata-plugin-typings/plugins/plugin-manifest
- Plugin types: https://github.com/InfoGata/readergata-plugin-typings
- Default plugins provide good examples for plugin development