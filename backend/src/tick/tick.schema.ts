import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Tick extends Document {
  @Prop({ required: true }) symbol!: string;
  @Prop({ required: true }) price!: number;
  @Prop({ required: true }) eventTime!: number;
  @Prop({ default: () => Date.now() }) receivedAt!: number;
}
export const TickSchema = SchemaFactory.createForClass(Tick);

TickSchema.index({ symbol: 1, eventTime: -1 });
TickSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 }); // 14 days expiration
