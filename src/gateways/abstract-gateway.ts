export abstract class AbstractGateways {
   public abstract initiateTransaction<T extends {},U>(props: T): Promise<U>;
   public abstract callback<T extends {},U>(body?: T): Promise<U>;
   public abstract verify<T extends {}, U>(body?: T): Promise<U>;
}