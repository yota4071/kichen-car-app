# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based food truck finder web application for university campuses, allowing students to find and review visiting food trucks. The app is called "Nom!Nom!" and is deployed at https://kichen-car-app.vercel.app/.

## Essential Commands

### Development
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

### Environment Setup
- Requires `.env.local` file with Firebase configuration
- Uses Firebase for authentication (Google Auth) and Firestore database

## Architecture

### Tech Stack
- **Frontend**: Next.js (Pages Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom CSS modules
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google provider)
- **Deployment**: Vercel

### Core Data Models (lib/firebase.ts:23-69)
- `Shop`: Food truck/kitchen car information
- `MenuItem`: Individual menu items for each truck
- `Schedule`: Food truck schedules by date and campus location
- `CampusSpot`: Campus locations where trucks can park
- `CampusId`: 'oic' | 'bkc' | 'kinugasa' (Ritsumeikan campuses)

### Key Components Structure
- `Layout`: Main page wrapper with Header/Footer, includes dark mode support
- `Header`: Navigation and user authentication
- Profile components: `ProfileContainer`, `ProfileInfo`, `StatsContainer`, etc.
- Shop components: `ShopCard`, `ReviewForm`, `ReviewList`, `RatingStars`
- UI components: Reusable form elements, buttons, loading indicators
- Games: Includes arcade-style games (`WakaInvaders`, etc.)

### Page Structure
- Pages Router architecture in `/pages`
- Dynamic routes: `/shop/[id]`, `/categories/[category]`
- Admin pages: `/admin/shops`, `/admin/calendar`, `/admin/menu/[id]`
- API routes: Basic setup with `/api/hello`

### Styling Architecture
- Multiple CSS files imported in `_app.tsx`
- Modular CSS approach with component-specific stylesheets
- Responsive design with mobile-first approach
- Dark mode support built into Layout component

### Firebase Integration
- Authentication with Google provider
- Firestore database for all data persistence
- Type definitions exported from `lib/firebase.ts`
- Configuration via environment variables

## Development Notes

### CSS Organization
The project uses extensive custom CSS with multiple style files:
- `globals.css` - Base styles
- Component-specific: `header.module.css`, `map-styles.css`, etc.
- Feature-specific: `mypage.css`, `review-styles.css`, `games.css`
- `responsive-fixes.css` - Mobile layout corrections

### Firebase Configuration
- Uses environment variables for Firebase config
- Firestore security rules should be considered when modifying data access
- Google Auth is the only authentication method

### Component Patterns
- Functional components with TypeScript
- Custom hooks (e.g., `useHeroMessage.ts`)
- Props interfaces defined inline or imported from firebase types
- Consistent use of Next.js built-in components (Head, Image, etc.)