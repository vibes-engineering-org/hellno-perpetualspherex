# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (runs TypeScript checks then Vite build)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run Biome linter on src directory

## Dynamic URL Configuration

The template automatically detects and uses the deployment URL in this priority order:
1. `VITE_URL` environment variable (if explicitly set)
2. `NEXT_PUBLIC_URL` environment variable (for Next.js compatibility)
3. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel production domain)
4. `VERCEL_URL` (Vercel deployment URL)
5. `http://localhost:5173` (local development fallback)

This is handled by a Vite plugin in `vite.config.ts` that replaces `{{APP_URL}}` and `{{PROJECT_TITLE}}` placeholders in `index.html` at build time. Project metadata is defined in `src/lib/constants.ts`.

## Architecture

This is a Farcaster Mini App built with:
- **Vite** as build tool with React plugin
- **React 18** with TypeScript
- **Wagmi** for Web3 wallet connections with Farcaster Frame connector
- **TailwindCSS** for styling (v4 with PostCSS)
- **Biome** for linting and formatting (2-space indentation, 120 char line width)

### Key Integration Points

**Farcaster SDK:** The app must call `sdk.actions.ready()` on mount in App.tsx to initialize the Farcaster Mini App SDK.

**Wallet Connection:** Uses wagmi with a custom Farcaster Frame connector configured in src/wagmi.ts supporting Base and Mainnet chains.

**Farcaster Manifest:** The `public/.well-known/farcaster.json` contains app metadata and account association for Farcaster integration. Static assets like splash images should be placed in the public directory.

### Project Structure

- `src/App.tsx` - Main app component with wallet connection UI
- `src/wagmi.ts` - Wagmi configuration with Farcaster Frame connector
- `public/.well-known/farcaster.json` - Farcaster app manifest
- Static assets (logos, splash images) served from `public/`