import { Injectable } from '@nestjs/common';
import { CheckoutProductParams } from 'src/interface/interfaces';
import { Stripe } from 'stripe';

interface StripeProductMetadata extends Stripe.Product {
  metadata: {
    name: string;
    description: string;
    image_url: string;
    product_id: string;
    pricePerUnit: string;
  };
}
interface StripeMetadata extends Stripe.Metadata {
  user_id: string;
  order_id: string;
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
    const paidProduct = session.line_items.data.map((product) => {
      const _metadata = product.price.product as StripeProductMetadata;
      return {
        quantity: product.quantity,
        product_id: _metadata.metadata.product_id,
        name: _metadata.metadata.name,
        description: _metadata.metadata.description,
        image_url: _metadata.metadata.image_url,
        pricePerUnit: parseFloat(_metadata.metadata.pricePerUnit),
      };
    });
    const metadata = session.metadata as StripeMetadata;
    return {
      user_id: metadata.user_id,
      order_id: metadata.order_id,
      paidProduct,
    };
  }
  async createcheckoutSession(
    products: CheckoutProductParams[],
    user_id: string,
    order_id: string,
    user_email: string,
  ) {
    const session = await this.stripeService.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user_email,
      line_items: products.map((item) => {
        return {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: item.name,
              description: item.description,
              images: [item.image_url],
              metadata: {
                product_id: item.product_id,
                name: item.name,
                description: item.description,
                image_url: item.image_url,
                pricePerUnit: item.pricePerUnit,
              },
            },
            unit_amount: item.pricePerUnit,
          },
          quantity: item.quantity,
        };
      }),
      metadata: { user_id, order_id },
      success_url: `${process.env.FE_URL}/success?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FE_URL}/session/failure`,
    });
    return session.url;
  }
}
