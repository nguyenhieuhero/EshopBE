import { Injectable } from '@nestjs/common';
import { CheckoutProdcutParams } from 'src/interface/interfaces';
import { Stripe } from 'stripe';

interface StripeProductMetadata extends Stripe.Product {
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
    return session.line_items.data.map((product) => {
      const _metadata = product.price.product as StripeProductMetadata;
      return {
        quantity: product.quantity,
        product_id: _metadata.metadata.id,
      };
    });
  }

  async createcheckoutSession(products: CheckoutProdcutParams[]) {
    const session = await this.stripeService.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: products.map((item) => {
        return {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: item.name,
              description: item.description,
              images: [item.image_url],
              metadata: { id: item.id },
            },
            unit_amount: item.pricePerUnit,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.FE_URL}/success?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FE_URL}/session/failure`,
    });
    return session.url;
  }
}
