export class Tick {
  constructor(
    public readonly symbol: string,
    public readonly price: number,
    public readonly eventTime: number,
    public readonly receivedAt: number,
    public readonly id?: string,
  ) {}
}
