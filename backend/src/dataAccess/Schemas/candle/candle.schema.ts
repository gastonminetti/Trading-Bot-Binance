import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class CandleMongo extends Document {
  @Prop({ required: true, trim: true, uppercase: true }) symbol!: string;
  @Prop({
    required: true,
    enum: [
      '1m',
      '3m',
      '5m',
      '15m',
      '30m',
      '1h',
      '2h',
      '4h',
      '6h',
      '8h',
      '12h',
      '1d',
      '3d',
      '1w',
      '1M',
    ],
  })
  interval!: string;
  @Prop({ required: true, min: 0 }) openTime!: number;
  @Prop({ required: true, min: 0 }) closeTime!: number;
  @Prop({ required: true }) openPrice!: number;
  @Prop({ required: true }) highPrice!: number;
  @Prop({ required: true }) lowPrice!: number;
  @Prop({ required: true }) closePrice!: number;
  @Prop({ required: true, min: 0 }) volume!: number;
  @Prop({ required: true, min: 0 }) trades!: number;
  @Prop({ required: true }) closed!: boolean;
  @Prop({ default: () => Date.now(), index: true }) receivedAt!: number;
}

export const CandleSchema = SchemaFactory.createForClass(CandleMongo);

// TODO: Is this necessary?
// Virtual id (string) from _id
/* CandleSchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
}); */

CandleSchema.index(
  { symbol: 1, interval: 1, openTime: 1 },
  { unique: true, name: 'uniq_symbol_interval_openTime' },
);

CandleSchema.index(
  { symbol: 1, interval: 1, closeTime: -1, closed: 1 },
  { name: 'qry_latest_closed' },
);
