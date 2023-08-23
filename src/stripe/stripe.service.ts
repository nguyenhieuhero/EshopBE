import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

interface ProductMetadata {
  metadata: {
    id: string;
  };
}

@Injectable()
export class StripeService {
  private stripeService: Stripe;
  constructor() {
    this.stripeService = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });
  }

  async checkoutSession(sessionId: string) {
    const session = await this.stripeService.checkout.sessions.retrieve(
      sessionId,
      {
        expand: ['line_items.data.price.product'],
      },
    );
    console.log(
      session.line_items.data.map((product) => {
        const _metadata = product.price.product as unknown as ProductMetadata;
        return { quantity: product.quantity, id: _metadata.metadata.id };
      }),
    );
  }

  async createcheckoutSession() {
    const Items = [
      { id: 12, quantity: 1, name: 'hehe', price: 10000, description: 'hihe' },
      { id: 23, quantity: 2, name: 'huhu', price: 50000, description: 'hihu' },
    ];
    const session = await this.stripeService.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: Items.map((item) => {
        return {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: item.name,
              description: item.description,
              metadata: { id: item.id },
            },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.FE_URL}/success?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FE_URL}/session/failure`,
    });
    return session;
  }
}
