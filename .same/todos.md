# Wedding Script Marketplace - TODO List

## Completed
- [x] Set up Next.js project with shadcn UI
- [x] Create marketplace UI with script cards
- [x] Implement cart functionality
- [x] Add Supabase integration for auth
- [x] Create login/signup pages
- [x] Set up environment variables
- [x] Fix Netlify deployment issues
- [x] Create server-side purchase and download API routes
- [x] Add Stripe secret key to environment variables
- [x] Create Stripe checkout API route (`/api/checkout`)
- [x] Create Stripe webhook handler (`/api/webhooks/stripe`)
- [x] Update CartSidebar to use real Stripe checkout

## In Progress
- [ ] Test Stripe checkout flow (add items to cart, proceed to checkout)

## Pending
- [ ] Set up Stripe webhook secret in .env.local
- [ ] Create purchases table in Supabase (if not exists)
- [ ] Deploy to production with environment variables
- [ ] Configure webhook URL in Stripe dashboard after deployment
- [ ] Add Stripe Connect for vendor payouts (optional)

## Notes
- Stripe test mode is enabled - use test card numbers like 4242 4242 4242 4242
- Webhook secret is optional for development but required for production
