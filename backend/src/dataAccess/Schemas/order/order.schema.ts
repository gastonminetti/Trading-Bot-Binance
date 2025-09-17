import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class OrderMongo extends Document {
  @Prop({ required: true, trim: true, uppercase: true }) symbol!: string;
  @Prop({ enum: ['BUY', 'SELL'], required: true }) side!: 'BUY' | 'SELL';

  @Prop({ required: true }) quantity!: number;

  @Prop({ enum: ['MARKET', 'LIMIT'], required: true }) type!:
    | 'MARKET'
    | 'LIMIT';

  @Prop() price?: number;

  @Prop({ required: true }) status!: string;

  @Prop({ required: true }) isTest!: boolean;

  @Prop() exchangeOrderId?: string;

  @Prop() clientOrderId?: string;

  @Prop({
    type: {
      code: { type: Number },
      message: { type: String },
      raw: { type: Object },
    },
    required: false,
    _id: false,
  })
  lastError?: {
    code?: number;
    message?: string;
    raw?: { type: object };
  };
}

export const OrderSchema = SchemaFactory.createForClass(OrderMongo);

OrderSchema.index({ symbol: 1, createdAt: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ exchangeOrderId: 1 });
OrderSchema.index({ clientOrderId: 1 });
