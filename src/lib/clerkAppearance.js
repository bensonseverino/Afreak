/**
 * Clerk UI theming mapped onto the AFREAK design system (see `index.css` @theme).
 * Shared by <ClerkProvider> so every Clerk surface — sign-in, sign-up, the user
 * button menu and the profile modal — matches the monochrome, square-cornered
 * storefront.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#000000',
    colorText: '#000000',
    colorTextSecondary: '#6B6B6B',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#000000',
    colorDanger: '#D92D20',
    colorSuccess: '#1A9E4B',
    colorWarning: '#C2410C',
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontFamilyButtons: '"Inter", "Helvetica Neue", Arial, sans-serif',
    borderRadius: '0px',
    fontSize: '14px',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none border border-line bg-paper',
    headerTitle: 'font-sans font-bold uppercase text-ink',
    headerSubtitle: 'text-graphite',
    socialButtonsBlockButton: 'border border-line text-ink',
    dividerLine: 'bg-line',
    formFieldLabel: 'font-sans font-medium text-ink',
    formFieldInput: 'border border-line bg-paper text-ink',
    formButtonPrimary:
      'bg-ink text-paper hover:bg-graphite font-sans font-bold uppercase text-[12px] tracking-label',
    footerActionText: 'text-graphite',
    footerActionLink: 'text-ink font-semibold',
    identityPreviewText: 'text-ink',
    userButtonAvatarBox: 'w-8 h-8 rounded-none',
  },
};
