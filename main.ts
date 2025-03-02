namespace Asynchronous {
    export type Executor<T> = (resolve: (value: T) => void, reject: (reason?: any) => void) => void;
    export type ThenHandler<T, U> = (value: T) => U | Promise<U>;
    export type CatchHandler<U> = (reason?: any) => U | Promise<U>;
    export class Promise<T> {
        /**
        * Runs code asynchronously, and returns a result
        * @returns { Promise }
        */
        constructor(executor: Executor<T>) {
            try {
                executor((r: any) => this.resolve(r), (r: any) => this.reject(r)); // For Lambda bypass
            } catch (error) {
                this.reject(error);
            };
        };

        /**
         * Resolves the promise with the given value
         * @param value The value for the promise
         */
        private resolve(value: T) {
            if (this.state !== 'pending') return;
            this.state = 'fulfilled';
            this.value = value;

            setTimeout(() => {
                this.thenHandlers.forEach(handler => handler(value));
            }, 0);
        };

        /**
         * Rejects the promise with the given value
         * @param value The value for the rejection
         */
        private reject(reason: any) {
            if (this.state !== 'pending') return;
            this.state = 'rejected';
            this.reason = reason;

            setTimeout(() => {
                if (this.catchHandler) {
                    this.catchHandler(reason);
                } else {
                    throw `Unhandled Promise rejection: ${reason}`;
                };
            }, 0);
        };

        /**
         * Sets a callback for when the promise resolves
         * @param onFulfilled The function to run when the promise is completed
         * @returns { Promise<U> } The promise of the promise completion
         */
        then<U>(onFulfilled: ThenHandler<T, U>): Promise<U> {
            return new Promise<U>((resolve, reject) => {
                this.thenHandlers.push(value => {
                    try {
                        resolve(onFulfilled(value) as any);
                    } catch (error2) {
                        reject(error2);
                    }
                });
                if (this.state === 'fulfilled' && this.value !== undefined) {
                    resolve(onFulfilled(this.value) as any);
                }
            });
        };

        /**
         * Sets a callback for when the promise rejects
         * @param onFulfilled The function to run when the promise fails
         * @returns { Promise<U> } The promise of the promise failure
         */
        catch<U>(onRejected: CatchHandler<U>): Promise<U> {
            return new Promise<U>((resolve, reject) => {
                this.catchHandler = reason => {
                    try {
                        resolve(onRejected(reason) as any);
                    } catch (error3) {
                        reject(error3);
                    };
                };
                if (this.state === 'rejected' && this.reason !== undefined) {
                    resolve(onRejected(this.reason) as any);
                }
            });
        };
        private value?: T;
        private reason?: any;
        private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
        private thenHandlers: ThenHandler<T, any>[] = [];
        private catchHandler?: CatchHandler<any>;
    };
};
const promises: Asynchronous.Promise<any>[] = [];
namespace Asynchronous {
    //% blockId=create_promise block="Create promise with executor %executor"
    export function createPromise<T>(target: Asynchronous.Executor<T>) {
        const promise = new Asynchronous.Promise(target);
        promises.push(promise);
        return promises.length - 1;
    };
    //% blockId=on_promise_resolve block="Set a callback %callback for promise %promise resolve"
    export function onPromiseResolve<T>(promiseId: number, resolveCallback: Asynchronous.ThenHandler<any, T>) {
        promises[promiseId].then(resolveCallback);
    };
    //% blockId=on_promise_reject block="Set a callback %callback for promise %promise reject"
    export function onPromiseReject<T>(promiseId: number, rejectCallback: Asynchronous.CatchHandler<any>) {
        promises[promiseId].catch(rejectCallback);
    };
    //% block="Wrapper $wrapped"
    //% draggableParameters
    //% handlerStatement
    export function wrapper(promiseId: number, callback: () => void) {
        
    };
};