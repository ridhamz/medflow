# Configuration Stripe

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
STRIPE_SECRET_KEY=sk_test_...  # Votre clé secrète Stripe (mode test)
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret du webhook Stripe
```

## Configuration du Webhook Stripe

1. **Créer un webhook dans Stripe Dashboard :**
   - Allez sur https://dashboard.stripe.com/test/webhooks
   - Cliquez sur "Add endpoint"
   - URL du endpoint : `https://votre-domaine.com/api/webhooks/stripe`
   - Sélectionnez les événements :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - Copiez le "Signing secret" et ajoutez-le à `STRIPE_WEBHOOK_SECRET`

2. **Pour le développement local :**
   - Utilisez Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Le CLI vous donnera un webhook secret à utiliser

## Mode Test

Le système utilise actuellement **USD** pour les paiements en mode test car Stripe ne supporte pas TND en mode test.

Pour tester un paiement :
- Carte de test : `4242 4242 4242 4242`
- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel 3 chiffres
- Code postal : n'importe quel code postal

## Production

En production, vous pouvez :
1. Changer la devise dans `app/api/invoices/[id]/pay/route.ts` de `usd` à `tnd` si supporté
2. Utiliser vos clés Stripe en mode live (`sk_live_...`)
3. Configurer le webhook avec votre URL de production

