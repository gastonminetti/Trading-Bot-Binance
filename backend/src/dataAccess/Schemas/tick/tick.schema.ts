import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: false })
export class TickMongo extends Document {
  @Prop({ required: true, trim: true, uppercase: true }) symbol!: string;
  @Prop({ required: true, min: 0 }) price!: number;
  @Prop({ required: true }) eventTime!: number;
  @Prop({ default: () => Date.now() }) receivedAt!: number;
}
export const TickSchema = SchemaFactory.createForClass(TickMongo);

TickSchema.index({ symbol: 1, eventTime: -1 });
TickSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 }); // 14 days expiration
