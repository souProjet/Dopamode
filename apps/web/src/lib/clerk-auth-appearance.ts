/**
 * Thème Clerk aligné sur la DA « carnet de route » : encre pierre, accents teal,
 * une seule action orange. Valeurs concrètes plutôt que tokens CSS — Clerk parse
 * ces couleurs en JS pour dériver ses nuances, `var(--x)` casserait le calcul.
 * Les pages d'authentification restent toujours en thème clair (les thèmes
 * boutique ne s'appliquent que sous `/app`).
 * Complété par `.auth-clerk-root` dans globals.css pour les classes internes Clerk.
 */
export const clerkAuthAppearance = {
  /** Retire le logo Clerk (déjà dans AuthQuestShell) — sinon grand vide au-dessus de « Continuer avec Google » */
  options: {
    logoImageUrl: '',
  },
  variables: {
    colorPrimary: '#c2410c',
    colorBackground: 'transparent',
    colorText: '#1c1917',
    colorTextSecondary: '#57534e',
    colorInputBackground: '#faf8f4',
    colorInputText: '#1c1917',
    colorDanger: '#b91c1c',
    borderRadius: '0.5rem',
    spacingUnit: '12px',
    fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
    fontSize: '0.9375rem',
  },
  elements: {
    rootBox: '!mx-auto !w-full !max-w-full !flex !flex-col !items-stretch',
    card: '!mx-auto !w-full !max-w-full !border-0 !bg-transparent !shadow-none',
    /** Titres masqués dans le shell ; le conteneur Clerk garde souvent une marge — resserrer sans casser les autres étapes */
    header: '!m-0 !p-0 !min-h-0 !gap-0 !border-0 !shadow-none',
    main: '!mx-auto !w-full !max-w-full !mt-0 !pt-0 !gap-3',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsRoot: '!mt-0 !pt-0 gap-3 !relative !overflow-hidden',
    socialButtonsBlockButton:
      '!w-full !justify-center !rounded-lg !border !border-[var(--border-ui-strong)] !bg-[var(--card)] !text-[var(--text)] !font-medium !shadow-none hover:!border-[var(--border-cyan)] hover:!bg-[var(--surface)] transition-colors duration-200',
    formButtonPrimary:
      '!w-full !rounded-lg !border-0 !bg-[var(--orange)] !text-white !font-semibold !normal-case !shadow-none hover:!brightness-110',
    formFieldInput:
      '!rounded-lg !border !border-[var(--border-ui-strong)] !bg-[var(--card)] !text-[var(--text)] !shadow-none placeholder:!text-[var(--subtle)] focus:!border-[var(--violet)] focus:!ring-1 focus:!ring-[var(--violet)]',
    formFieldLabel: '!text-[var(--muted)] !font-medium !text-sm',
    formFieldSuccessText: '!text-[var(--green)]',
    formFieldErrorText: '!text-[var(--red)] !text-sm',
    footer: '!bg-transparent !border-0 !shadow-none !p-0 !mt-2',
    footerActionLink: '!text-[var(--link-on-bg)] !font-medium !underline !underline-offset-[0.2em]',
    dividerRow: '!gap-3',
    dividerLine: '!bg-[var(--border-ui)] !h-px',
    dividerText: '!text-[var(--subtle)] !text-[11px] !font-bold !uppercase !tracking-[0.2em]',
    identityPreview: '!rounded-lg !border !border-[var(--border-ui)] !bg-[var(--card)] !shadow-none',
    identityPreviewText: '!text-[var(--text)]',
    identityPreviewEditButton: '!text-[var(--link-on-bg)] !font-medium',
    otpCodeFieldInput: '!rounded-lg !border-[var(--border-ui-strong)] !bg-[var(--card)]',
    formResendCodeLink: '!text-[var(--link-on-bg)] !font-medium',
    alertText: '!text-[var(--red)]',
    formFieldHintText: '!text-[var(--subtle)]',
    alternativeMethodsBlockButton:
      '!rounded-lg !border !border-[var(--border-ui)] !bg-[var(--card)] !font-medium !shadow-none',
  },
} as const;
